#!/bin/bash
if [ "$TRAVIS_BRANCH" == "master" -a $"$TRAVIS_PULL_REQUEST" == "false" ]; then
  echo "$TRAVIS_BRANCH"
  cd functions
  echo $(pwd)
  ./node_modules/.bin/firebase deploy --only functions -P dev --token $FIREBASE_DEPLOY_TOKEN
  exit 0
else
  cd functions
  echo $(pwd)
  echo "Will only deploy if on master and not a PR"
  exit 0
fi