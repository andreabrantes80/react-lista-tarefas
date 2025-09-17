import React from "react";
import { FaEdit, FaWindowClose } from "react-icons/fa";
import PropTypes from "prop-types";
import "./Tarefas.css";



export default function Tarefas({tasks, handleEdit, handleDelete}) {
  return (
    <ul className="tasks">
      {tasks.map((task, index) => {
        // converte timestamp do alarme para HH:MM
        let alarmTimeStr = "";
        if (task.alarmTimestamp) {
          const date = new Date(task.alarmTimestamp);
          const h = date.getHours().toString().padStart(2, "0");
          const m = date.getMinutes().toString().padStart(2, "0");
          alarmTimeStr = `${h}:${m}`;
        }
        return (
          <li key={index}>
            <span className="task-text">{task.text}</span>
            {alarmTimeStr && <span className="date">⏰ {alarmTimeStr}</span>}
            <span className="date">{task.date}</span>
            <span>
              <FaEdit className="edit" onClick={(e) => handleEdit(e, index)} />
              <FaWindowClose
                className="delete"
                onClick={(e) => handleDelete(e, index)}
              />
            </span>
          </li>
        );
      })}
    </ul>
  );
 }

Tarefas.propTypes = {
  tasks: PropTypes.array.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
}
