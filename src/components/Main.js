import React, { Component } from 'react';

import './Main.css';
//form
import {FaPlus} from 'react-icons/fa';

export default class Main extends Component {


  state = {
      newTask: '',
    }

  mudaInput = (e) => {
    this.setState({ newTask: e.target.value });
  }

  render() {
    return (
      <div className="main">
        <h1>Lista de Tarefas</h1>

        <form action='#' className='form'>
          <input type="text" placeholder="Adicione uma tarefa" onChange={this.mudaInput} value={newTask}/>
          <button type="submit">
            <FaPlus />
          </button>
        </form>
      </div>
    );
  }
}
