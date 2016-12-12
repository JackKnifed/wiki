author: jack
topic: svn
topic: cPanel
topic: source-control
title: cPanel SVN

cPanel EA3 SVN Setup
====================

Of note, this only works 
So, to set this up - create the SVN folders, and give them the correct permissions.
These steps will have to be repeated for each cPanel user that wants an SVN repository.

```bash
su - cpanel_user
```

## Folder Setup

```
mkdir -p ~/repo/
svnadmin create ~/repo
touch ~/svn-auth
touch ~/svn-perms
chown -R svnuser.nobody ~/svn
chown  svnuser.nobody ~/svn-auth
chown  svnuser.nobody ~/svn-perms
chmod -R 660 ~/svn/
```
     
## Authentication

success> Authentication establishes a username and password that work together.

Authentication lies in the file `~/svn-auth`.

Run the following for each user
This will prompt for a password.
Remember to replace `$username`.

```
/usr/local/apache/bin/htpasswd -m /home/svnuser/svn-auth $username
```
     
## Permissions

success> Permission grants someone access to resources, if they are authenticated as a specific user.

Authentication is handed by the file `~/svn-perms`.

To give the user `admin` `r/w` access to the entire repo:
     
```
[/]
admin = rw
```

Grants `jimbo` `rw` on `reponame:/branches/testrepo`.
Grants `bertha` `read-only`.
Permissions propagate down recursively.

```
[reponame:/branches/testrepo]
jimbo  = rw
bertha = r
```

You can override permissions from above at any time.
Given the above and the below, `bertha` will be able to make changes to `module`.

```
[reponame:/branches/testrepo/module]
bertha = rw
```

[This page](http://svnbook.red-bean.com/en/1.7/svn.serverconfig.pathbasedauthz.html) goes into further detail on permissions.
     

## Apache Configuration
     
Now, we just need to configure Apache to serve this SVN repository.
To do that, we need to configure this within the vhost.
On cPanel, this is done by following the instructions from the vhost in your httpd.conf:

```
# To customize this VirtualHost use an include file at the following location
# Include "/usr/local/apache/conf/userdata/std/2/svnuser/svndomain.com/*.conf"
```

So we first:

```
mkdir -p /usr/local/apache/conf/userdata/std/2/svnuser/svndomain.com/
touch /usr/local/apache/conf/userdata/std/2/svnuser/svndomain.com/svn.conf
```

Then, within the file, we put:
     
```conf
<IfModule mod_dav_svn.c>
	<Location /svn>
		# sets this up to do SVN stuff at the location path above
		# if you want a different path, change it
		DAV svn

		# points to the SVN directory - change this to the proper directory
		SVNPath /home/cpuser/svn-repo

		# Authenticate them with the file, and require them to be a valid user
		AuthType Basic
		AuthName "Subversion repository"
		AuthUserFile /home/cpuser/svn-auth-file
		# change the above line to point to the proper file

		# Apply the special SVN permissions - change this to the proper file
		AuthzSVNAccessFile /home/cpuser/svn-perms-file

		# Require them to have logged in with the AuthUserFile stuff,
		# otherwise, it's gonna deny them
		Require valid-user

		# Finally some ModSecurity changes
		<IfModule mod_security2.c>
			SecRuleRemoveById 340004 300003
		</IfModule>
	</Location>
</IfModule>
```

You also need to compile in the following modules:

* `mod_dav_svn`
* `mod_authz_svn`

Finally, update the Apache configuration.

```
/scripts/rebuildhttpdconf
```

Finally, **restart Apache**.

## Test the Repository


You're probably also going to want to import something locally to the repo, so like:

```
mkdir emptyfolder
svn import emtpyfolder file:///full/path/to/repo/
```

After that, you can check out the repository and work against it if you want.
