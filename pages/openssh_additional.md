topic: ssh
author: jack
title: ssh additional

Additional OpenSSH
==================

Overview
--------

There is a bunch of information with OpenSSH that we don't typically use on servers. Most of it isn't really necessary. So it hides here.

SSH/SSHD Config
----------

On servers, your configuration file for OpenSSH server is typically located at `/etc/ssh/sshd_config`. If you need to adjust something for the server, you can likely adjust it there.

On computers that you're going to SSH from (you're going to use the SSH client) the main SSH configuration is usually at `/etc/ssh/ssh_config`. However, anything you can do there, you can do in `~/.ssh/config` - so it's probably best to just make your changes there.

Host Sections
-------------

Within your SSH config file, you can set options outside of Host sections. But you probably don't want to. So, don't. Split up your SSH connections by Host sections, and then you can configure different things for different things.

Write-Protected/Broken Pipe
---------------------------

Sometimes, on an idle SSH connection you get disconnected you say? Use `ServerAliveInterval` to send a packet every so often so you don't get automatically disconnected. You can do this with:

```
#Value below in seconds.
ServerAliveInterval 30
#Value below is the number of times ServerAliveInterval is done per session.
ServerAliveCountmax 1200
```

Shared SSH Sockets
------------------

Normally, when you connect to a server via SSH, it connects via a network socket just for that SSH connection. Instead of doing that, you can configure SSH to create the network socket when SSH'ing to a server, then share that between different SSH connections to the same server. Then, if you connect to the server a second time with SSH, it will use the already open connection - think `rsync`, `scp`, `vncviewer`, `git` in addition to SSH.

To set this up, add the following lines to your SSH config in a Host section:

```
ControlPath ~/.ssh/.master-%r@%h:%p
ControlMaster auto
ControlPersist 1
```

Additionally, if you have this set up, and want to disable it - let's say you want to test a new SSH key:

```
ssh -o "ControlMaster=no" user@host
```

Hashed Public Keys
------------------

If your `~/.ssh/known_hosts` looks like it's hashed like so:

```
|1|rNMjbSOiccDtv2c8qfbDENzLMKh=|nU-aqGDAXASMnKreS4gBPC8mBiY= ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAvcXoPQ3SSxG9XjWdcQsRNSRBu9R0fWaQapcesMrja1t0Z9mXyU6igqZHxu3adi3OQSxDLb/UsIYiSZScoQnE0SyGy1XpzNuCMvQ9WUVv+6BkVx1VYTbhWDU+t/pT9D3tOuORoqo5HdcKub2ppmjWNqiifI3UVUFMWAfAVbqFG+PYphBcxHA75ZYu+Fwhn5Gsoz+grCpmnxf0cI3O1MDGEY7TeK/pertBPlKirX4lXxUdQ8fp/TTXl+GyHk21BQaRCm1SHE0MqyyJieQpcPRTliIFg5PLFcZtS9I7g7RWxv5l5tuhna+c9jzoZZkYmoxrlX63sa2XDwUHGWxP10yQa4w=
```

This is because you have `HashKnownHosts` set to `yes`.

Strict Host Key Checking
------------------------

When you SSH to a location you haven't been to before, you might see a message like:

```bash
jack@jack:~$ ssh root@deering
The authenticity of host 'deering (67.225.255.50)' can't be established.
RSA key fingerprint is cb:45:20:ac:e8:17:0b:7a:4f:63:d8:6d:78:91:6a:94.
Are you sure you want to continue connecting (yes/no)?
```

This is letting you know that you haven't been there, and prompting you before connecting and remebering that location. You can disable this notification by adding `StrictHostKeyChecking no` to your SSH configuration.

### Disabling Host Key Checking ###

If you want to go the next step, at home, you can disable host key checking all together by running:

```bash
rm -f ~/.ssh/known_hosts
ln -s /dev/null ~/.ssh/known_hosts
```

Warning: You shouldn't do this at Liquid Web - we want to know when Host Keys change. This circumvents security we have in place here. If you do this here at LW, you should probably just quit.


Customer server's Host Section
------------------------------

I usually find it's easiest to have a section in your SSH config just for customer boxes - and putting my ControlPath stuff there. You can negate a Host match with a `!` in front of the host name, like so:

```
#default
Host * !jack* !*deleteos.com !vps !colo
	Port 22
	User root
	ControlPath ~/.ssh/.master-%r@%h:%p
	ControlMaster auto
	ControlPersist 1
```

OSX Changing the SSH port
-------------------------

On OSX, `LaunchDaemon` lauches `OpenSSH` and overrides any port number you put in there. As such, you have to set this somewhere else - in the file `/System/Library/LaunchDaemons/ssh.plist`. In this file, I'm configured to use port `3006`.

```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>Disabled</key>
	<true/>
	<key>Label</key>
	<string>com.openssh.sshd</string>
	<key>Program</key>
	<string>/usr/libexec/sshd-keygen-wrapper</string>
	<key>ProgramArguments</key>
	<array>
		<string>/usr/sbin/sshd</string>
		<string>-i</string>
	</array>
	<key>Sockets</key>
	<dict>
		<key>Listeners</key>
		<dict>
			<key>SockServiceName</key>
			<string>3006</string>
			<key>Bonjour</key>
			<array>
				<string>ssh</string>
				<string>sftp-ssh</string>
			</array>
		</dict>
	</dict>
	<key>inetdCompatibility</key>
	<dict>
		<key>Wait</key>
		<false/>
	</dict>
	<key>StandardErrorPath</key>
	<string>/dev/null</string>
	<key>SHAuthorizationRight</key>
	<string>system.preferences</string>
	<key>POSIXSpawnType</key>
	<string>Interactive</string>
</dict>
</plist>
```