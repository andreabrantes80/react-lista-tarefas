import React, { Component } from 'react';

import './Main.css';

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

        <form action='#'>
          <input type="text" placeholder="Adicione uma tarefa" onChange={this.mudaInput} />
          <button type="submit">Adicionar</button>
        </form>
      </div>
    );
  }
}
