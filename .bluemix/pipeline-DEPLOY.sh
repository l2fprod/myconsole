#!/bin/bash
npm install -g cf-blue-green
B_DOMAIN=mybluemix.net cf-blue-green "${CF_APP}"
