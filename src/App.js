import React, { Component } from 'react';
import { auth, provider } from './firebase.js';
import axios from 'axios';
import qs from 'qs';
var PlaidLink = require('react-plaid-link');

class App extends Component {
  constructor() {
    super();
    this.state = {
      user: null,
      transactions: [],
      transactionSums: {},
      OAuthToken: null
    };

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleOnSuccess = this.handleOnSuccess.bind(this);
    this.exchangePublicToken = this.exchangePublicToken.bind(this);
    this.getTransactionsFromDatabase = this.getTransactionsFromDatabase.bind(this);
    this.sumTransactions = this.sumTransactions.bind(this);
  }

  componentDidMount() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.setState({user});
      }
    });
  }

  login() {
    auth.signInWithPopup(provider)
      .then(result => {
        const user = result.user;
        const OAuthToken = result.credential.accessToken;
        this.setState({user, OAuthToken});
        this.verifyUser(OAuthToken);
      })
  }

  verifyUser(OAuthToken) {
    auth.currentUser.getIdToken()
      .then(idToken => {
          const config = {
            url: 'http://localhost:5000/testproject-6177f/us-central1/addUser',
            payload: qs.stringify({idToken: idToken, OAuthToken: OAuthToken})
          };
          axios.post(config.url, config.payload)
            .catch(err => console.log(err));
        });
  }

  handleOnSuccess(token, metadata) {
    // send token to client server
    this.exchangePublicToken(token);
  }

  exchangePublicToken(publicToken) {

    let config = {
      url: 'http://localhost:5000/testproject-6177f/us-central1/exchangePublicToken',
      payload: qs.stringify({
        publicToken: publicToken,
        uniqueUserId: auth.currentUser.uid
      })
    };
    axios.post(config.url, config.payload)
    .then(() => this.getTransactionsFromDatabase())
    .catch(error => { console.log(error);});
  }

  getTransactionsFromDatabase() {
    let config = {
      url: 'http://localhost:5000/testproject-6177f/us-central1/getTransactionsFromDatabase',
      payload: qs.stringify({
        uniqueUserId: auth.currentUser.uid
      })
    };
    axios.post(config.url, config.payload)
    .then((response) => {
      this.setState({transactions: response.data});
      this.sumTransactions();
    })
    .catch((error) => {
      console.log(error);
    });
  };

  sumTransactions() {
    let transactionSums = {};
    this.state.transactions.forEach((transaction) => {
      if (transactionSums[transaction.date]) {
        transactionSums[transaction.date] += transaction.amount;
      } else {
        transactionSums[transaction.date] = transaction.amount;
      }
    });
    this.setState({transactionSums: transactionSums});
  }

  logout() {
    auth.signOut()
      .then(() => {
        this.setState({
          user: null,
          transactions: [],
          transactionSums: {}
        });
      });
  }

  render() {
    return (
      <div className='App'>
        <h1>Where's My Money</h1>
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
        <div className='Transactions'>
          {this.state.transactions.map((transaction, idx) => (
            <transaction key={transaction.transaction_id}>
              {idx === 0 || transaction.date !== this.state.transactions[idx - 1].date ?
                <div><u>{`Total spent on ${transaction.date} ==> `}
                     <b>{`$${this.state.transactionSums[transaction.date]}`}</b></u><br/></div> : <div></div>
              }
              {`\xa0\xa0\xa0 ${transaction.date} | \xa0 ${transaction.name} \xa0\xa0 $`}
              <em>{transaction.amount}</em><br/>
              {(this.state.transactions.length - 1 === idx || transaction.date !== this.state.transactions[idx+1].date) && <div><br/></div>}
            </transaction>
          ))}
        </div>

      </div>
    );
  }
}

export default App;
