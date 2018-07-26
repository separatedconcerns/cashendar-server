[![Travis](https://travis-ci.org/separatedconcerns/cashendar-web.svg?branch=master)](https://travis-ci.org/separatedconcerns/cashendar-web)

Cashendar

Visualize your financial behavior in your Google Calendar.

Powered by React, Firebase, Google Cloud Functions, Plaid, and Google Calendar.


To setup:

1) npm install
1) Get an environment key from EnvKey for your development sub-environment
1) run 'npm run webhook' to get a webhook address
1) Go to EnvKey on your desktop
1) Go to the development section and navigate to your local sub-environment
1) Add your webhook address as the host (see other entries for the format)
1) run 'npm run getEnv <the key you got in the previous step>' and you will see a creds.json file in your src folder
1) run 'npm run start'

Deployment

-All merges into master are deployed to staging
-Merge master into the production branch in order to automatically deploy to production
