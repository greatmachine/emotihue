#!/usr/bin/env bash

# $1 = domain

CSR_EXTENSION=".csr"
CSR_FILENAME=$1$CSR_EXTENSION

KEY_EXTENSION=".key"
KEY_FILENAME=$1$KEY_EXTENSION

CRT_EXTENSION=".crt"
CRT_FILENAME=$1$CRT_EXTENSION

echo "Creating cert: $CSR_FILENAME $KEY_FILENAME $CRT_FILENAME..."

openssl req -new -sha256 -nodes -out $CSR_FILENAME -newkey rsa:2048 -keyout $KEY_FILENAME -config <( /vagrant/_provision/ssl-scripts/customizeOpenSSLConfig.sh $1 )
openssl x509 -req -in $CSR_FILENAME -passin pass:x -CA ~/ssl/rootCA.pem -CAkey ~/ssl/rootCA.key -CAcreateserial -out $CRT_FILENAME -days 500 -sha256 -extfile <( /vagrant/_provision/ssl-scripts/customizeV3.sh $1 )
