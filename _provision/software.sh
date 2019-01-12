#!/bin/bash

# apt update and general setup
echo "Updating apt, installing ntpdate..."
apt-get update
apt-get install -y ntpdate
ntpdate ntp.ubuntu.com

# node + npm
echo "Installing node and npm..."
apt-get install -y nodejs npm
npm install -g n
n 8.10

# install and config supervisor
echo "Installing supervisor..."
apt-get install supervisor -y
mkdir /var/log/services/
groupadd supervisor
usermod -a -G supervisor vagrant
cp /vagrant/_provision/config/supervisor/localhost/supervisord.conf /etc/supervisor/
cp /vagrant/_provision/config/supervisor/localhost/*-service.conf /etc/supervisor/conf.d/
service supervisor stop
service supervisor start
