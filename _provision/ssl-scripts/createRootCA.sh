#!/usr/bin/env bash
mkdir ~/ssl/

openssl genrsa -des3 -passout pass:x -out ~/ssl/rootCA.key 2048
openssl req -x509 -passin pass:x -new -nodes -key ~/ssl/rootCA.key -sha256 -days 1024 -out ~/ssl/rootCA.pem -subj "/C=US/ST=NY/L=New-York/O=Dschool/OU=Dschool/CN=localhost"

#copy PEM to /vagrant for use on host OS
cp ~/ssl/rootCA.pem /vagrant/
