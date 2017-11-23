#!/bin/bash
if [ "$TRAVIS_BRANCH" == "master" -a $"$TRAVIS_PULL_REQUEST" == "false" ]; then
  echo "$TRAVIS_BRANCH"
  npm run build
  ./node_modules/.bin/firebase deploy -P dev --token $FIREBASE_DEPLOY_TOKEN
  exit 0
else
  echo "Not deploying since not on master"
  exit 0
fi