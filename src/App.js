import React, { Component } from 'react';
// import firebase from './firebase.js';
import axios from 'axios';
import qs from 'qs';
var PlaidLink = require('react-plaid-link');

class App extends Component {
  constructor() {
    super();
    this.state = {
      currentItem: '',
      username: '',
      items: []
    };
    // this.handleChange = this.handleChange.bind(this);
    this.handleOnSuccess = this.handleOnSuccess.bind(this);
    // this.getMessages = this.getMessages.bind(this);
    // this.sendMessage = this.sendMessage.bind(this);
    this.exchangePublicToken = this.exchangePublicToken.bind(this);
  }

  // getMessages() {
  //   // axios.get('http://localhost:5000/testproject-6177f/us-central1/returnMessages')
  //   // .then(response => {
  //   //   console.log(response);
  //   //   this.setState({
  //   //     items: response.data
  //   //   });
  //   // })
  //   // .catch((error) => {
  //   //   console.log(error);
  //   // });
  //
  //   const itemsRef = firebase.database().ref('items');
  //   itemsRef.on('value', (snapshot) => {
  //     let items = snapshot.val();
  //     let newState = [];
  //     for (let item in items) {
  //       newState.push({
  //         id: item,
  //         currentItem: items[item].currentItem,
  //         username: items[item].username
  //       });
  //     }
  //     this.setState({
  //       items: newState
  //     });
  //   });
  // }
  //
  // componentDidMount() {
  //   this.getMessages();
  // }
  //
  // handleChange(e) {
  //   this.setState({
  //     [e.target.name]: e.target.value
  //   });
  // }
  //
  exchangePublicToken(publicToken) {
    console.log('line 61');
    let config = {
      url: 'http://localhost:5000/testproject-6177f/us-central1/exchangePublicToken',
      payload: qs.stringify({publicToken: publicToken})
    };

    axios.post(config.url, config.payload)
    .catch((error) => {
      console.log(error);
    });
  }

  // handleSubmit(e) {
  //   e.preventDefault();
  //
  //   let data = {
  //     currentItem: this.state.currentItem,
  //     username: this.state.username
  //   };
  //
  //   this.sendMessage(data);
  //
  //   this.setState({
  //     currentItem: '',
  //     username: ''
  //   });
  // }

  handleOnSuccess(token, metadata) {
    // send token to client server
    console.log('token', token);
    console.log('metadata', metadata);
    this.exchangePublicToken(token);
  }

  render() {
    return (
      <div className='App'>

        <PlaidLink
          publicKey={process.env.REACT_APP_PLAID_PUBLIC_KEY}
          product='connect'
          env='sandbox'
          clientName='Wheres My Money'
          onSuccess={this.handleOnSuccess}
        />


        {/* <section className='add-item'>
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
        </section> */}
      </div>
    );
  }
}

export default App;
