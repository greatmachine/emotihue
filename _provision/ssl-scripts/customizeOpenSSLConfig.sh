#!/usr/bin/env bash

# $1 = domain

cat <<EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn

[dn]
C=US
ST=New York
L=New York
O=Deutsch
OU=Deutsch
emailAddress=localdevelopment@doesntexist.com
CN = $1
EOF
