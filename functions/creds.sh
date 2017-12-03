#!/bin/bash
if [ "$TRAVIS_BRANCH" == "master" -a $"$TRAVIS_PULL_REQUEST" == "false" ]; 
then
  echo "$TRAVIS_BRANCH"
  chmod +x envkey-fetch-linux
  ./envkey-fetch-linux $ENVKEY_STAGING > creds.json
  exit 0
elif [ "$TRAVIS_BRANCH" == "production" -a $"$TRAVIS_PULL_REQUEST" == "false" ];
then
  echo "$TRAVIS_BRANCH"
  chmod +x envkey-fetch-linux
  ./envkey-fetch-linux $ENVKEY_PRODUCTION > creds.json
else
  echo "couldn't find creds"
  exit 0
fi