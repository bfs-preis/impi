# -*- mode: ruby -*-
# vi: set ft=ruby :

raise "vagrant-vbguest plugin must be installed --> run 'vagrant plugin install vagrant-vbguest'" unless Vagrant.has_plugin? "vagrant-vbguest"

Vagrant.configure("2") do |config|
  
  config.vm.box = "halvards/ubuntumate1604"
  config.vm.define "impi-devbox"
  config.vm.provision :shell, inline: "/usr/bin/apt-get update && /usr/bin/apt-get -y install apt-transport-https", privileged: true
  config.vm.provision :shell, path: "bootstrap.sh", privileged: false
  config.vm.provider "virtualbox" do |vb|
     vb.gui = true
     vb.memory = "4096"
	 vb.cpus = 2
	 vb.name = "impi-devbox"
   end
end
