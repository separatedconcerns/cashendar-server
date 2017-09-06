import React, { Component } from 'react';
import { auth, provider } from './firebase.js';
import axios from 'axios';
import qs from 'qs';
var PlaidLink = require('react-plaid-link');

class App extends Component {
  constructor() {
    super();
    this.state = {
      user: null
    };

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleOnSuccess = this.handleOnSuccess.bind(this);
    this.exchangePublicToken = this.exchangePublicToken.bind(this);
  }

  verifyUser() {
    auth.currentUser.getIdToken()
      .then(idToken => {
          const config = {
            url: 'http://localhost:5000/testproject-6177f/us-central1/addUser',
            payload: qs.stringify({idToken: idToken})
          };
          axios.post(config.url, config.payload)
            .catch(err => console.log(err));
        });
  }

  login() {
    auth.signInWithPopup(provider)
      .then(result => {
        const user = result.user;
        this.setState({user});
        this.verifyUser();
      });
  }

  logout() {
    auth.signOut()
      .then(() => {
        this.setState({user: null});
      });
  }

  componentDidMount() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.setState({user});
      }
    });
  }

  exchangePublicToken(publicToken) {
    let config = {
      url: 'http://localhost:5000/testproject-6177f/us-central1/exchangePublicToken',
      payload: qs.stringify({publicToken: publicToken})
    };
    axios.post(config.url, config.payload)
    .catch(error => { console.log(error);});
  }

  handleOnSuccess(token, metadata) {
    // send token to client server
    this.exchangePublicToken(token);
  }

  render() {
    return (
      <div className='App'>

        <div className='wrapper'>
          {this.state.user ?
            <button onClick={this.logout}>Log Out</button>
          :
          <button onClick={this.login}>Log In</button>
          }
        </div>

        {this.state.user ?
          <div>
            <div>{this.state.user.email}</div>
            <PlaidLink
              publicKey={process.env.REACT_APP_PLAID_PUBLIC_KEY}
              product='connect'
              env='sandbox'
              clientName='Wheres My Money'
              onSuccess={this.handleOnSuccess}
            />
          </div>
        :
        <div>Log in to link account</div>
        }
      </div>
    );
  }
}

export default App;
