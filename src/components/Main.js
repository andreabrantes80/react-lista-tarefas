import React, { Component } from "react";

import "./Main.css";
import Form from "../components/Form";
import ably from "../utils/ablyClient";

import Tarefas from "../components/Tarefas";

export default class Main extends Component {
  state = {
    newTask: "",
    alarmTime: "",
    tasks: [],
    index: -1,
    notifications: [],
  };
  receiveIds = new Set();
  alreadySubscribed = false;

  componentDidMount() {
    const tasks = JSON.parse(localStorage.getItem("tasks"));

    if ("Notification" in window) {
      Notification.requestPermission();
    }

    if (tasks) {
      // adiciona flag alarmTriggered para tarefas antigas
      const tasksWithFlag = tasks.map((task) => ({
        ...task,
        alarmTriggered: task.alarmTriggered || false,
      }));
      this.setState({ tasks: tasksWithFlag });
    }

    this.alarmeIntervalo = setInterval(this.checkAlarms, 60000); // Verifica a cada minuto

    // Registro do Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register(`${process.env.PUBLIC_URL}/ntfy-sw.js`)
        .then((reg) => console.log("✅ SW registrado:", reg))
        .catch((err) => console.error("❌ Erro no SW:", err));
    }

    // Inscrever SSE no tópico ntfy automaticamente
    this.subscribeToAbly();
  }

  componentWillUnmount() {
    clearInterval(this.alarmeIntervalo);
    if (this.eventSource) this.eventSource.close();
  }

  componentDidUpdate(prevProps, prevState) {
    const { tasks } = this.state;

    if (tasks === prevState.tasks) return;

    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // ----------------- ALARME -----------------
  checkAlarms = () => {
    console.log("Verificando alarmes");
    const now = Date.now();

    this.setState((prevState) => {
      const updatedTasks = prevState.tasks.map((task) => {
        if (
          !task.alarmTriggered &&
          task.alarmTimestamp &&
          now >= task.alarmTimestamp
        ) {
          this.sendAblyNotification(task);

          return { ...task, alarmTriggered: true }; // marca como disparado
        }
        return task;
      });
      return { tasks: updatedTasks };
    });
  };

  notifyUser = (task) => {
    if (Notification.permission === "granted") {
      new Notification("⏰ Lembrete de Tarefa!", {
        body: `Está na hora de: ${task.text}`,
        icon: "/icone.png", // opcional
      });
    }
  };

  sendAblyNotification = async (task) => {
    try {
      const channel = ably.channels.get("alarme-tarefas");
      await channel.publish("lembrete", {
        title: "Lembrete de Tarefa",
        message: `⏰ Está na hora de: ${task.text}`,
      });
    } catch (error) {
      console.error("Erro ao enviar notificação Ably:", error);
    }
  };

  // ----------------- SSE NTFY -----------------
  subscribeToAbly = () => {
    if (this.alreadySubscribed) return;
    this.alreadySubscribed = true;

    const channel = ably.channels.get("alarme-tarefas");

    channel.subscribe("lembrete", (msg) => {
      if (!msg || !msg.data) {
        console.warn("Mensagem Ably inválida ou sem dados:", msg);
        return;
      }

      const id = msg.data.message;
      if (this.receiveIds.has(id)) return;
      this.receiveIds.add(id);

      this.setState((prevState) => ({
        notifications: [
          {
            id,
            title: msg.data.title,
            message: msg.data.message,
          },
          ...prevState.notifications,
        ],
      }));

      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "ABLY_MESSAGE",
          body: msg.data.message,
        });
      }

      if (Notification.permission === "granted") {
        new Notification(msg.data.title || "📌 Notificação Ably", {
          body: msg.data.message,
          icon: "/icone.png",
        });
      }

    });
  };

  handleSubmit = (e) => {
    e.preventDefault();

    const { tasks, index, alarmTime } = this.state;

    let { newTask } = this.state;
    newTask = newTask.trim();

    if (!newTask) return;

    // if (tasks.indexOf(newTask) !== -1) return;

    if (tasks.some((t) => t.text === newTask)) return;

    const newTasks = [...tasks];

    // Calcula timestamp do alarme
    let alarmTimestamp = null;
    if (alarmTime) {
      const [hours, minutes] = alarmTime.split(":");
      const now = new Date();
      let alarmDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        parseInt(hours),
        parseInt(minutes),
        0,
        0
      );
      // se horário já passou hoje, agenda para amanhã
      if (alarmDate < now) alarmDate.setDate(alarmDate.getDate() + 1);

      alarmTimestamp = alarmDate.getTime();
    }

    if (index === -1) {
      //adiciona nova tarefa com hora e data
      const now = new Date();
      const formattedDate = now.toLocaleString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const taskObjt = {
        text: newTask,
        date: formattedDate,
        alarmTime: alarmTime || "",
        alarmTimestamp: alarmTimestamp || null,
        alarmTriggered: false, // nova tarefa, alarme não disparado
      };

      this.setState({
        tasks: [...newTasks, taskObjt],
        newTask: "",
        alarmTime: "",
      });
    } else {
      newTasks[index].text = newTask;
      newTasks[index].alarmTime = alarmTime || "";
      newTasks[index].alarmTimestamp = alarmTimestamp;
      newTasks[index].alarmTriggered = false; // reseta ao editar
      this.setState({
        tasks: [...newTasks],
        index: -1,
        newTask: "",
        alarmTime: "",
      });
    }
  };

  handleEdit = (e, index) => {
    const { tasks } = this.state;

    let alarmTimeStr = tasks[index].alarmTime || "";
    if (tasks[index].alarmTimestamp) {
      const date = new Date(tasks[index].alarmTimestamp);
      const h = date.getHours().toString().padStart(2, "0");
      const m = date.getMinutes().toString().padStart(2, "0");
      alarmTimeStr = `${h}:${m}`;
    }
    this.setState({
      index,
      newTask: tasks[index].text,
      alarmTime: alarmTimeStr,
    });
  };

  mudaInput = (e) => {
    this.setState({ newTask: e.target.value });
  };

  mudaAlarmTime = (e) => {
    this.setState({ alarmTime: e.target.value });
  };

  handleDelete = (e, index) => {
    const { tasks } = this.state;
    const newTasks = [...tasks];
    newTasks.splice(index, 1);
    this.setState({ tasks: [...newTasks] });
  };

  render() {
    const { newTask, tasks, alarmTime, notifications } = this.state;

    return (
      <div className="main">
        <h1>Lista de Tarefas</h1>

        <Form
          handleSubmit={this.handleSubmit}
          mudaInput={this.mudaInput}
          newTask={newTask}
          alarmTime={alarmTime}
          mudaAlarmTime={this.mudaAlarmTime}
        />
        <Tarefas
          tasks={tasks}
          handleEdit={this.handleEdit}
          handleDelete={this.handleDelete}
        />

        {/* Mensagem opcional explicando notificações */}
        <p style={{ textAlign: "center", marginTop: "20px", color: "#555" }}>
          Notificações automáticas ativadas via ntfy.sh
        </p>
        {/* Renderiza notificações recebidas */}
        <div className="notifications">
          <h2>Notificações</h2>
          {this.state.notifications.length === 0 ? (
            <p>Nenhuma notificação recebida ainda.</p>
          ) : (
            <ul>
              {this.state.notifications.map((n) => (
                <li key={n.id}>
                  <strong>{n.title}</strong>: {n.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }
}
