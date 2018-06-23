#!/bin/bash -ex
npx babel index.js > deploy/index.js
cd deploy
clasp push
clasp version
clasp redeploy `clasp deployments | grep web | head -n1 | awk '{ print $2 }'` `clasp versions | tail -n1 | awk '{ print $1 }'` web
