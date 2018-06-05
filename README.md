# impi
#Requirements:

###Install NVM
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.6/install.sh | bash

###Install Node 8.9
nvm install lts/carbon

###Global Packages
npm install -g yarn

edit .bashrc
    --> export PATH="$PATH:$(yarn global bin)"


npm install -g @angular/cli
npm install -g projecto

ng set --global packageManager=yarn
