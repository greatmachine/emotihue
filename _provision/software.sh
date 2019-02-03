#!/bin/bash

# apt update and general setup
echo "Updating apt, installing ntpdate..."
apt-get update
apt-get install -y ntpdate
ntpdate ntp.ubuntu.com
