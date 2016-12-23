#!/bin/bash
npm config delete prefix
npm set progress=false

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash
. ~/.nvm/nvm.sh
nvm install 6.7.0

npm install
npm run deploy
