import React, { Component } from "react";

import "./Main.css";
import Form from "../components/Form";

import Tarefas from "../components/Tarefas";

export default class Main extends Component {
  state = {
    newTask: "",
    tasks: [],
    index: -1,
  };

  componentDidMount() {
    const tasks = JSON.parse(localStorage.getItem("tasks"));

    if (!tasks) return;

    this.setState({ tasks });
  }

  componentDidUpdate(prevProps, prevState) {
    const { tasks } = this.state;

    if (tasks === prevState.tasks) return;

    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  handleSubmit = (e) => {
    e.preventDefault();

    const { tasks, index } = this.state;

    let { newTask } = this.state;
    newTask = newTask.trim();

    if (tasks.indexOf(newTask) !== -1) return;

    const newTasks = [...tasks];

    if (index === -1) {
      this.setState({ tasks: [...newTasks, newTask], newTask: "" });
    } else {
      newTasks[index] = newTask;
      this.setState({ tasks: [...newTasks], index: -1, newTask: "" });
    }
  };

  handleEdit = (e, index) => {
    const { tasks } = this.state;

    this.setState({ index, newTask: tasks[index] });
  };

  mudaInput = (e) => {
    this.setState({ newTask: e.target.value });
  };

  handleDelete = (e, index) => {
    const { tasks } = this.state;
    const newTasks = [...tasks];
    newTasks.splice(index, 1);
    this.setState({ tasks: [...newTasks] });
  };

  render() {
    const { newTask, tasks } = this.state;

    return (
      <div className="main">
        <h1>Lista de Tarefas</h1>

        <Form
          handleSubmit={this.handleSubmit}
          mudaInput={this.mudaInput}
          newTask={newTask}
        />
        <Tarefas
          tasks={tasks}
          handleEdit={this.handleEdit}
          handleDelete={this.handleDelete}
        />
      </div>
    );
  }
}
