import React, { Component } from 'react';
import './App.css';
import firebase from './firebase.js';
import axios from 'axios';
import qs from 'qs';

class App extends Component {
  constructor() {
    super();
    this.state = {
      currentItem: '',
      username: '',
      items: []
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getMessages = this.getMessages.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
  }

  getMessages() {
    // axios.get('http://localhost:5000/testproject-6177f/us-central1/returnMessages')
    // .then(response => {
    //   console.log(response);
    //   this.setState({
    //     items: response.data
    //   });
    // })
    // .catch((error) => {
    //   console.log(error);
    // });

    const itemsRef = firebase.database().ref('items');
    itemsRef.on('value', (snapshot) => {
      let items = snapshot.val();
      let newState = [];
      for (let item in items) {
        newState.push({
          id: item,
          currentItem: items[item].currentItem,
          username: items[item].username
        });
      }
      this.setState({
        items: newState
      });
    });
  }

  componentDidMount() {
    this.getMessages();
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  sendMessage(data) {
    let config = {
      // url: 'http://localhost:5000/testproject-6177f/us-central1/addMessage',
      url: 'https://us-central1-testproject-6177f.cloudfunctions.net/addMessage',
      payload: qs.stringify(data)
    };

    axios.post(config.url, config.payload)
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
  }

  handleSubmit(e) {
    e.preventDefault();

    let data = {
      currentItem: this.state.currentItem,
      username: this.state.username
    };

    this.sendMessage(data);

    this.setState({
      currentItem: '',
      username: ''
    });
  }

  render() {
    return (
      <div className='App'>
        <section className='add-item'>
          <form onSubmit={this.handleSubmit}>
            <input type='text' name='username' placeholder='Whats your name?' onChange={this.handleChange} value={this.state.username} />
            <input type='text' name='currentItem' placeholder='What are you bringing?' onChange={this.handleChange} value={this.state.currentItem} />
            <button>Add Item</button>
          </form>
        </section>
        <section className='display-item'>
          <div className='wrapper'>
            <ul>
              {this.state.items.map((item) => {
                return (
                  <li key={item.id}>
                    <h3>{item.currentItem}</h3>
                    <p>brought by: {item.username}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </div>
    );
  }
}

export default App;
