# -*- mode: ruby -*-
# vi: set ft=ruby :

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure("2") do |config|
     # VM OS
     config.vm.box = "ubuntu/artful64"
     config.vm.hostname = "emotihue.local"

     config.vm.provider "virtualbox" do |v|
       v.memory = 4096
       v.cpus = 1
       v.name = "emotihue"
     end

     # port forwarding
     config.vm.network "forwarded_port", guest: 80, host: 8080 #UI (redirects to ssl)
     config.vm.network "forwarded_port", guest: 443, host: 8443 #UI

     # install software
     config.vm.provision "shell" do |shell|
          shell.name = "Software Setup"
          shell.path = "_provision/software.sh"
     end

     # Create root CA
     config.vm.provision "shell" do |shell|
          shell.name = "Root CA Creation"
          shell.path = "_provision/ssl-scripts/createRootCA.sh"
     end

     # install + setup nginx
     config.vm.provision "shell" do |shell|
          shell.name = "NGINX Setup"
          shell.path = "_provision/nginx.sh"
          shell.args = "emotihue.localhost"
     end

     # set localhost environment variable for services not running under supervisor
     config.vm.provision "shell", privileged: false, inline: "echo 'export RUNMODE=localhost' >> ~/.bash_profile"

     # Enable Dynamic Swap Space to prevent Out of Memory crashes
     config.vm.provision "shell", inline: "sudo apt install swapspace -y"

     # Setup host manager on both guest and host
     config.hostmanager.manage_host = true
     config.hostmanager.manage_guest = true
     config.hostmanager.aliases = ['emotihue.localhost']
     config.vm.provision :hostmanager, run: "always"

     # MAC ONLY: set up port forwarding so vagrant can handle requests to :80 and :443
     #if defined? VagrantPlugins::Triggers
       # port forwarding setup and removal for running on your host primary IP address
       config.trigger.after [:up, :reload, :provision] do |trigger|
            trigger.ruby do |env,machine|
              system('echo "
   rdr pass inet proto tcp from any to any port 80 -> 127.0.0.1 port 8080
   rdr pass inet proto tcp from any to any port 443 -> 127.0.0.1 port 8443
   " | sudo pfctl -ef - >/dev/null 2>&1; echo "Add Port Forwarding (80 => 8080)\nAdd Port Forwarding (443 => 8443)"')
              system('sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ./rootCA.pem')
             end
       end
       config.trigger.after [:halt, :suspend, :destroy] do |trigger|
            trigger.ruby do |env,machine|
              system('sudo pfctl -F all -f /etc/pf.conf >/dev/null 2>&1; echo "Removing Port Forwarding (80 => 8080)\nRemove Port Forwarding (443 => 8443)"')
              system('sudo security delete-certificate -c localhost')
         end
       end
     #end

end
