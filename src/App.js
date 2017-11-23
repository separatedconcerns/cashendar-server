/* eslint-disable */
import React, { Component } from 'react';
import axios from 'axios';
import qs from 'qs';
import PlaidLink from 'react-plaid-link';
import { auth, provider } from './firebase';
// const PlaidLink = require('react-plaid-link');

class App extends Component {
  constructor() {
    super();
    this.state = {
      user: null,
      idToken: null,
      items: null
    };

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleOnSuccess = this.handleOnSuccess.bind(this);
    this.exchangePublicToken = this.exchangePublicToken.bind(this);
    this.deleteProfile = this.deleteProfile.bind(this);
  }

  componentDidMount() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user });
      }
    });
  }

  login() {
    auth.signInWithPopup(provider)
      .then((result) => {
        const user = result.user;
        const OAuthToken = result.credential.accessToken;
        this.setState({ user });
        this.verifyUser(OAuthToken);
      });
  }

  verifyUser(OAuthToken) {
    auth.currentUser.getIdToken()
      .then((idToken) => {
        this.setState({ idToken });
        const config = {
          url: `${process.env.REACT_APP_HOST}addUser`,
          payload: qs.stringify({ idToken, OAuthToken }),
        };
        return axios.post(config.url, config.payload)    
      })
      .then(response => {
        console.log(response.data);
      })
      .catch(err => console.log(err));
  }

  handleOnSuccess(token, metadata) {
    // send token to client server
    const institution = metadata.institution;
    this.exchangePublicToken(token, institution);
  }

  exchangePublicToken(publicToken, institution) {
    const config = {
      url: `${process.env.REACT_APP_HOST}exchangePublicToken`,
      payload: qs.stringify({
        publicToken,
        idToken: this.state.idToken,
        institution,
      }),
    };
    axios.post(config.url, config.payload)
    .then(response => console.log(response.data))
    .catch((error) => { console.log(error); });
  }

  logout() {
    auth.signOut()
      .then(() => {
        this.setState({
          user: null,
          transactions: [],
          transactionSums: {},
          idToken: null,
        });
      });
  }

  deleteProfile() {
    const config = {
      url: `${process.env.REACT_APP_HOST}deleteUserProfile`,
      payload: qs.stringify({ idToken: this.state.idToken }),
    };
    axios.post(config.url, config.payload)
      .then(response => console.log(response))
      .then(() => { this.logout(); })
      .catch(e => console.log(e));
  }

  render() {
    return (
      <div className="App">
        <h1>Cashendar</h1>
        <div className="wrapper">
          {this.state.user ?
            <button onClick={this.logout}>Log Out</button>
            :
            <button onClick={this.login}>Log In</button>
          }
        </div>

        {this.state.user ?
          <div>
            <div>{this.state.user.email}</div>
            {/* <div>{this.state.items[0][1].name}</div> */}
            <PlaidLink
              publicKey={process.env.REACT_APP_PLAID_PUBLIC_KEY}
              product="connect"
              webhook={process.env.REACT_APP_WEBHOOK}
              env={process.env.REACT_APP_PLAID_ENV}
              clientName="Cashendar"
              onSuccess={this.handleOnSuccess}
            />
          </div>
          :
          <div>Log in to link account</div>
        }
        {this.state.user ?
          <button onClick={this.deleteProfile}>Delete Profile</button> :
          <div />
        }
        <p />
        {process.env.REACT_APP_PLAID_ENV === 'sandbox' ? 
        <div className="environments">
          <div className="firebaseEnvironment">
            <b>Firebase environment:</b><br /> {process.env.REACT_APP_HOST}
          </div>
          <div className="plaidEnvironment">
            <b>Plaid environment</b>:<br /> {process.env.REACT_APP_PLAID_ENV}<br />
            <b>Plaid webhook</b>:<br />{process.env.REACT_APP_WEBHOOK}
          </div>
        </div>
        : <div> </div>}
      </div>
      
    );
  }
}

export default App;
