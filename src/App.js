import React, { Component } from 'react';
import axios from 'axios';
import qs from 'qs';
import { auth, provider } from './firebase';

const PlaidLink = require('react-plaid-link');

class App extends Component {
  constructor() {
    super();
    this.state = {
      user: null,
      OAuthToken: null,
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
        this.setState({ user, OAuthToken });
        this.verifyUser(OAuthToken);
      });
  }

  verifyUser(OAuthToken) {
    auth.currentUser.getIdToken()
      .then((idToken) => {
        const config = {
          url: `${process.env.REACT_APP_HOST}addUser`,
          payload: qs.stringify({ idToken, OAuthToken }),
        };
        axios.post(config.url, config.payload)
          .catch(err => console.log(err));
      });
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
        uniqueUserId: auth.currentUser.uid,
        institution,
      }),
    };
    axios.post(config.url, config.payload)
      .catch((error) => { console.log(error); });
  }

  logout() {
    auth.signOut()
      .then(() => {
        this.setState({
          user: null,
          transactions: [],
          transactionSums: {},
        });
      });
  }

  deleteProfile() {
    const config = {
      url: `${process.env.REACT_APP_HOST}deleteUserProfile`,
      payload: qs.stringify({ uniqueUserId: this.state.user.uid }),
    };
    axios.post(config.url, config.payload)
      .then(response => console.log(response))
      .then(() => { this.logout(); })
      .catch(e => console.log(e));
  }

  render() {
    return (
      <div className="App">
        <h1>Where's My Money</h1>
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
            <PlaidLink
              publicKey={process.env.REACT_APP_PLAID_PUBLIC_KEY}
              product="connect"
              webhook={process.env.REACT_APP_WEBHOOK}
              env="sandbox"
              clientName="Wheres My Money"
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
      </div>
    );
  }
}

export default App;
