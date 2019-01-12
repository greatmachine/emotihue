#!/bin/bash

# install nginx
echo "Installing NGINX..."
apt-get install -y nginx

# create cert dirs
echo "Creating directories for SSL certificates..."
mkdir /etc/nginx/ssl
cd /etc/nginx/ssl

# split argument by comma to get list of domains we need to make, then iterate and create cert stuff
IFS=',' domains=($1)
for domain in "${domains[@]}";
     do
          echo "Creating config and self-signed cert for $domain..."
          cp /vagrant/_provision/config/nginx/localhost/$domain.conf /etc/nginx/sites-available/
          ln -s /etc/nginx/sites-available/$domain.conf /etc/nginx/sites-enabled/
          /vagrant/_provision/ssl-scripts/createSelfSignedCert.sh $domain
     done

# reload nginx
echo "Reloading NGINX...";
nginx -s reload
