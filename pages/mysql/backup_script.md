title: mysql_backup
author: jack
tag: mysql

# backup script

``` bash
#!/bin/sh

# variables to set
BK_PATH="/backup/percona.5.6"

# number of copies to keep +1
RETENTION=8

# remote hostname
REMOTE_HOST='root@dest:${BK_PATH}'

TS=$(/bin/date -u +%Y-%m-%dT%H:%M:%S%z)

	echo "BACKUP STARTING"
	echo "-------> Current time -------> "$(/bin/date -u +%Y-%m-%dT%H:%M:%S%z)

# take the initial backup
	/usr/bin/innobackupex --slave-info --no-version-check --no-timestamp $BK_PATH/$TS/
	echo "-------> Current time -------> "$(/bin/date -u +%Y-%m-%dT%H:%M:%S%z)

# prepare the backup
	/usr/bin/innobackupex --slave-info --use-memory=2G --apply-log $BK_PATH/$TS/
	echo "-------> Current time -------> "$(/bin/date -u +%Y-%m-%dT%H:%M:%S%z)

# find all backups, sort, cut to the number above, and delete all before that
	/usr/bin/find $BK_PATH -mindepth 1 -maxdepth 1 -type d | /bin/sort -rn |/usr/bin/tail -n +$RETENTION|/usr/bin/xargs /bin/rm -rf
	echo "-------> Current time -------> "$(/bin/date -u +%Y-%m-%dT%H:%M:%S%z)

# rsync command needed to push backups to backup server or wherever
	/usr/bin/rsync -aHl --delete -e ssh $BK_PATH/  $REMOTE_HOST

	echo "-------> Current time -------> "$(/bin/date -u +%Y-%m-%dT%H:%M:%S%z)
	echo "BACKUP COMPLETE"
```
