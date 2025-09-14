import React from "react";
import PropTypes from "prop-types";

import { FaPlus } from "react-icons/fa";
import "./Form.css";

export default function Form({handleSubmit, mudaInput, newTask}) {
  return (
    <form onSubmit={handleSubmit} action="#" className="form">
      <input
        type="text"
        placeholder="Adicione uma tarefa"
        onChange={mudaInput}
        value={newTask}
      />
      <button type="submit">
        <FaPlus />
      </button>
    </form>
  );
}

// Form.defaultProps = {
//   newTask: "",
// };

Form.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  mudaInput: PropTypes.func.isRequired,
  newTask: PropTypes.string.isRequired,
};
