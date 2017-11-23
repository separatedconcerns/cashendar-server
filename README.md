[![CircleCI](https://circleci.com/gh/buttercutters/wheres-my-money.svg?style=svg)](https://circleci.com/gh/buttercutters/wheres-my-money)

[![codecov](https://codecov.io/gh/buttercutters/wheres-my-money/branch/master/graph/badge.svg)](https://codecov.io/gh/buttercutters/wheres-my-money)

Wheres My Money

Visualize your financial behavior in your Google Calendar.

Powered by React, Firebase, Google Cloud Functions, Plaid, and Google Calendar.


To setup:

1) npm install
2) npm start

To add new environment variables:

1) Add the environment variable to EnvKey
2) Add the environment variable to the permitted list in config/webpack.config.dev.js (ctrl-f for "new EnvkeyWebpackPlugin")
3) Do the same for config/webpack.config.prod.js
4) Only use your personal dev key from EnvKey. Staging and Production keys are for CI.