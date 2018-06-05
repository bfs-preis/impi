#!/usr/bin/env bash
ln -s /vagrant /home/vagrant/Desktop/Source
# git
sudo apt-get install -y git-core curl

#nvm
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
echo "source /home/vagrant/.nvm/nvm.sh" >> /home/vagrant/.profile
source /home/vagrant/.profile

#node lts 8.11.2
nvm install --lts

#projecto
npm install -g projecto
npm install -g rimraf

npm install -g yarn

sudo apt-get install libatk-adaptor libgail-common topmenu-gtk-common topmenu-gtk2 -y

#vscode
curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg
sudo mv microsoft.gpg /etc/apt/trusted.gpg.d/microsoft.gpg
sudo sh -c 'echo "deb [arch=amd64] https://packages.microsoft.com/repos/vscode stable main" > /etc/apt/sources.list.d/vscode.list'
sudo apt-get update
sudo apt-get install code --assume-yes

sudo bash -c "cat > /etc/default/keyboard" <<EOF
# KEYBOARD CONFIGURATION FILE
# Consult the keyboard(5) manual page.
XKBMODEL="pc105"
XKBLAYOUT="ch"
XKBVARIANT=""
XKBOPTIONS=""
BACKSPACE="guess"
EOF


#xdg-mime default code.desktop text/plain 
sudo update-alternatives --set editor /usr/bin/code

echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p

