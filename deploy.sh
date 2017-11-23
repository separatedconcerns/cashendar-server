#!/bin/bash
if [ "$TRAVIS_BRANCH" == "master" && "$TRAVIS_PULL_REQUEST" == "false"  ]; then
  npm run build
  ./node_modules/.bin/firebase deploy -P dev --token $FIREBASE_DEPLOY_TOKEN
fi

