topic: cloudlinux
author: jack
title: cloudLinux

Uninstalling CloudLinux
=======================

Checking CloudLinux Removal
---------------------------

The following shows you all part of CloudLinux you have not removed.

```bash
rpm -qa --qf "[%{VENDOR} %{NAME} %{VERSION}-%{RELEASE}\n]"|sed 's/ Inc\. / /g'|awk '$1 ~/CloudLinux/'
```

CloudLinux Installation
-----------------------

If CloudLinux was ordered through us:

```bash
cd /usr/local/src
wget http://repo.cloudlinux.com/cloudlinux/sources/cln/cldeploy
sh cldeploy -i
reboot
```

If CloudLinux was ordered externally, use the key install method:

```bash
cd /usr/local/src
wget http://repo.cloudlinux.com/cloudlinux/sources/cln/cldeploy
sh cldeploy -k <activation_key> 
reboot
```

CloudLinux Removal
------------------

First, remove CloudLinux.

```bash
cd /usr/local/src
wget -O cldeploy http://repo.cloudlinux.com/cloudlinux/sources/cln/cldeploy
sh cldeploy -c
```

CloudLinux may have removed your CentOS repository - replace it, it's below:

```bash
cat <<EOM >/etc/yum.repos.d/yum.system.repo
[system-base]
name=CentOS-\$releasever - \$basearch - Base (Production system packages)
baseurl=http://syspackages.sourcedns.com/packages/mirrors/centos/$releasever/os/\$basearch/
gpgcheck=1
priority=3

[system-updates-released]
name=CentOS-\$releasever - \$basearch - Released Updates (Production system packages)
baseurl=http://syspackages.sourcedns.com/packages/mirrors/centos/$releasever/updates/\$basearch/
gpgcheck=1
priority=3

[system-extras]
name=CentOS-\$releasever - \$basearch - Extras (Production system packages)
baseurl=http://syspackages.sourcedns.com/packages/mirrors/centos/$releasever/extras/\$basearch/
gpgcheck=1
priority=3
EOM
```

Upgrade all CentOS RPMs:

```bash
yum upgrade
```

Rebuild Apache

```bash
/scripts/easyapache --build
```

Install a non-CloudLinux Kernel

```bash
yum --disableexcludes=all install kernel
```

Reboot to make sure you're not running a CloudLinux Kernel

```bash
uname -a
```

warning> The following four commands will bail out as you cannot approve them. View what's going to happen, add -y to the end if you want it to run.

Remove CloudLinux kernels

```bash
rpm -qa |awk '/^kernel.*lve/ {print $1}'|xargs yum erase
```

Reinstall any RPMs available through CentOS that are currently installed through CloudLinux

```bash
rpm -qa --qf "[%{VENDOR} %{NAME}\n]"|sed 's/ Inc\. / /g'|awk '$1 ~ /CloudLinux/ {print $2}'|xargs yum reinstall
```

Downgrade any CloudLinux RPMs to their CentOS version if possible

```bash
rpm -qa --qf "[%{VENDOR} %{NAME}\n]"|sed 's/ Inc\. / /g'|awk '$1 ~ /CloudLinux/ {print $2}'|xargs yum downgrade
```

Remove any remaining CloudLinux RPMs that do not have CentOS options:

```bash
rpm -qa --qf "[%{VENDOR} %{NAME}\n]"|sed 's/ Inc\. / /g'|awk '$1 ~ /CloudLinux/ {print $2}'|xargs yum erase
```

Upgrade any RPMs that have updates available:

```bash
yum upgrade
```