import React, { Component } from 'react';
import './App.css';
import firebase from './firebase.js';

class App extends Component {
  constructor() {
    super();
    this.state = {
      currentItem: '',
      username: '',
      items: []
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    process.env
  }

  componentDidMount() {
    const itemsRef = firebase.database().ref('items');
    itemsRef.on('value', (snapshot) => {
      let items = snapshot.val();
      let newState = [];
      for (let item in items) {
        newState.push({
          id: item,
          title: items[item].title,
          user: items[item].user
        });
      }
      this.setState({
        items: newState
      });
    });
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    const itemsRef = firebase.database().ref('items');
    const item = {
      title: this.state.currentItem,
      user: this.state.username
    }
    itemsRef.push(item);
    this.setState({
      currentItem: '',
      username: ''
    });
}

  render() {
    return (
      <div className="App">
        <section className="add-item">
          <form onSubmit={this.handleSubmit}>
            <input type="text" name="username" placeholder="What's your name?" onChange={this.handleChange} value={this.state.username} />
            <input type="text" name="currentItem" placeholder="What are you bringing ?" onChange={this.handleChange} value={this.state.currentItem} />
            <button>Add Item</button>
          </form>
        </section>
        <section className='display-item'>
          <div className="wrapper">
            <ul>
              {this.state.items.map((item) => {
                return (
                  <li key={item.id}>
                    <h3>{item.title}</h3>
                    <p>brought by: {item.user}</p>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      </div>
    );
  }
}

export default App;
