import React from "react";
import { FaEdit, FaWindowClose } from "react-icons/fa";
import PropTypes from "prop-types";
import "./Tarefas.css";



export default function Tarefas({tasks, handleEdit, handleDelete}) {
  return (
    <ul className="tasks">
      {tasks.map((task, index) => (
        <li key={index}>
          <span className="task-text">{task.text}</span>
          <span className="date">{task.date}</span>
          <span>
            <FaEdit className="edit" onClick={(e) => handleEdit(e, index)} />
            <FaWindowClose
              className="delete"
              onClick={(e) => handleDelete(e, index)}
            />
          </span>
        </li>
      ))}
    </ul>
  );
 }

Tarefas.propTypes = {
  tasks: PropTypes.array.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
}
