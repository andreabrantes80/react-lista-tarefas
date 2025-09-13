import React, { Component } from 'react';

import './Main.css';

//form
import {FaPlus, FaEdit, FaWindowClose} from 'react-icons/fa';

export default class Main extends Component {


  state = {
    newTask: '',
    tasks: [
      'Fazer café',
      'Estudar React',
      'Acessar comunidade Rocketseat',
      'Ler um livro',
      'Ir na academia',
    ],
    }

  mudaInput = (e) => {
    this.setState({ newTask: e.target.value });
  }

  render() {
    const { newTask, tasks } = this.state;

    return (
      <div className="main">
        <h1>Lista de Tarefas</h1>

        <form action='#' className='form'>
          <input type="text" placeholder="Adicione uma tarefa" onChange={this.mudaInput} value={newTask}/>
          <button type="submit">
            <FaPlus />
          </button>
        </form>

        <ul className='tasks'>
          {tasks.map(task => (
            <li key={task}>{task}
            <div>
              <FaEdit className='edit' />
              <FaWindowClose className='delete'/>
            </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
