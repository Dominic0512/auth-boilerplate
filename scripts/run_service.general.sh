#!/bin/sh
pwd
ls -la node_modules
node_modules/.bin/nx run --verbose $SERVICE:start:prod:$NODE_ENV
