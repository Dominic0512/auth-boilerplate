#!/bin/sh
node_modules/.bin/nx run --verbose $SERVICE:start:prod:$NODE_ENV
