/* eslint-disable */
import React, { Component } from 'react';
import axios from 'axios';
import qs from 'qs';
import PlaidLink from 'react-plaid-link';
import { auth, provider } from './firebase';
import creds from './creds.json'
// const PlaidLink = require('react-plaid-link');

class App extends Component {
  constructor() {
    super();
    this.state = {
      user: null,
      idToken: null,
      // items: null,
    };

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleOnSuccess = this.handleOnSuccess.bind(this);
    this.exchangePublicToken = this.exchangePublicToken.bind(this);
    this.deleteProfile = this.deleteProfile.bind(this);
    // this.listItems = this.listItems.bind(this);
  }

  componentDidMount() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user });
      }
    })
    auth.getRedirectResult().then(result => {
        if (result.credential) {
          const OAuthToken = result.credential.accessToken;
          this.verifyUser(OAuthToken);
        }
      })
}

  login() {
    auth.signInWithRedirect(provider);
  }

  verifyUser(OAuthToken) {
    auth.currentUser.getIdToken()
      .then((idToken) => {
        this.setState({ idToken });
        const config = {
          url: `${creds.REACT_APP_HOST}addUser`,
          payload: qs.stringify({ idToken, OAuthToken }),
        };
        return axios.post(config.url, config.payload)    
      })
      // .then(response => {
      //   let allItems = [];
      //   let itemsObjs = response.data.items;
      //   for (let key in itemsObjs) {
      //     allItems.push(itemsObjs[key]);
      //   }
      //   this.setState({items: allItems});
      //   console.log(this.state.items[0].name)
      // })
      .catch(err => console.log(err));
  }

  handleOnSuccess(token, metadata) {
    // send token to client server
    const institution = metadata.institution;
    this.exchangePublicToken(token, institution);
  }

  exchangePublicToken(publicToken, institution) {
    const config = {
      url: `${creds.REACT_APP_HOST}exchangePublicToken`,
      payload: qs.stringify({
        publicToken,
        idToken: this.state.idToken,
        institution,
        webhook: `${creds.REACT_APP_HOST}plaidWebHook`
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
          idToken: null,
        });
      });
  }

  deleteProfile() {
    const config = {
      url: `${creds.REACT_APP_HOST}deleteUserProfile`,
      payload: qs.stringify({ idToken: this.state.idToken }),
    };
    axios.post(config.url, config.payload)
      .then(response => console.log(response))
      .then(() => { this.logout(); })
      .catch(e => console.log(e));
  }

  // listItems() {
  //   <ul>  
  //   {this.state.items.map((item) => {
  //     <li key={item.institution_id}>
  //       {item.name}
  //     </li>
  //   })
  //   }
  //   </ul>
  // }

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

        {!this.state.user ?
          <div>Log in to link account</div>
          :
          <div>
            <div>{this.state.user.email}</div>
            {/* <div>{this.state.items[0][1].name}</div> */}
            <PlaidLink
              publicKey={creds.REACT_APP_PLAID_PUBLIC_KEY}
              product="connect"
              webhook={`${creds.REACT_APP_HOST}plaidWebHook`}
              env={creds.REACT_APP_PLAID_ENV}
              clientName="Cashendar"
              onSuccess={this.handleOnSuccess}
            />
            <button onClick={this.deleteProfile}>Delete Profile</button>
            <div className="items">
            Items eventually go here
            {/* {this.listItems()} */}
            </div>
          </div>
          
        }
        <p />
        {creds.REACT_APP_PLAID_ENV === 'sandbox' ? 
        <div className="environments">
          <div className="firebaseEnvironment">
            <b>Firebase host</b><br /> {creds.REACT_APP_HOST}
          </div>
          <div className="plaidEnvironment">
            <b>Plaid environment</b>:<br /> {creds.REACT_APP_PLAID_ENV}<br />
          </div>
        </div>
        : <div> </div>}
      </div>
      
    );
  }
}

export default App;
