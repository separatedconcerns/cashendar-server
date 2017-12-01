#!/bin/bash
if [ "$TRAVIS_BRANCH" == "master" -a $"$TRAVIS_PULL_REQUEST" == "false" ]; 
then
  echo "$TRAVIS_BRANCH"
  chmod +x envkey-fetch-linux
  ./envkey-fetch-linux $ENVKEY_STAGING > src/creds.json
  npm run build
  ./node_modules/.bin/firebase deploy -P dev --token $FIREBASE_STAGING_DEPLOY_TOKEN
  exit 0
elif [ "$TRAVIS_BRANCH" == "production" -a $"$TRAVIS_PULL_REQUEST" == "false" ];
then
  echo "$TRAVIS_BRANCH"
  chmod +x envkey-fetch-linux
  ./envkey-fetch-linux $ENVKEY_PRODUCTION > src/creds.json
  npm run build
  ./node_modules/.bin/firebase deploy -P production --token $FIREBASE_PRODUCTION_DEPLOY_TOKEN 
else
  echo "Will only deploy if not a pull request and branch is either master or staging"
  exit 0
fi