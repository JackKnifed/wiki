author: jack
topic: cpanel ea
topic: easyapache 3

EasyApache 3
============

Pre-upgrade Backups
-------------------

Before any EasyApache run, please backup the current running configuration. This can be done with the following line:

```bash
mkdir -p /home/lwtemp; TS=$(date -u +%Y-%m-%d-%H:%M:%S%z); EACH=/usr/local/apache/conf/httpd.conf; [[ -x $EACH ]] && cp $EACH /home/lwtemp/httpd.conf.$TS; EACH=/usr/local/apache/conf/php.conf; [[ -x $EACH ]] && cp $EACH /home/lwtemp/php.conf.$TS; EACH=/usr/local/lib/php.ini; [[ -x $EACH ]] && cp $EACH /home/lwtemp/php.ini.$TS; FILE=/home/lwtemp/preEA.$USR; touch $FILE && chmod 600 $FILE; cat > $FILE <( echo -e "\n\n### Created: $TS ###\n"; EACH=/usr/local/cpanel/bin/rebuild_phpconf; [[ -x $EACH ]] && $EACH --current 2>&1; EACH=/usr/bin/php4; [[ -x $EACH ]] && $EACH -v 2>&1 && $EACH -m 2>&1; EACH=/usr/bin/php5; [[ -x $EACH ]] && $EACH -v 2>&1 && $EACH -m 2>&1; EACH=/usr/local/apache/bin/httpd; [[ -x $EACH ]] && $EACH -V 2>&1 && $EACH -l 2>&1; echo -e "\n### Specific Module Checks ###\n"; [[ -x /usr/bin/php ]] && /usr/bin/php -m|grep -e 'ffmpeg' -e 'memcache' -e 'magick' -e 'apc' -e 'xcache' -e 'eaccel' -e 'xcache'|tee -a $FILE;);
```

Formatted cleanly, it is:

```bash
mkdir -p /home/lwtemp;
TS=$(date -u +%Y-%m-%d-%H:%M:%S%z);
EACH=/usr/local/apache/conf/httpd.conf;
[[ -x $EACH ]] && cp $EACH /home/lwtemp/httpd.conf.$TS;
EACH=/usr/local/apache/conf/php.conf;
[[ -x $EACH ]] && cp $EACH /home/lwtemp/php.conf.$TS;
EACH=/usr/local/lib/php.ini;
[[ -x $EACH ]] && cp $EACH /home/lwtemp/php.ini.$TS;
FILE=/home/lwtemp/preEA.$USR;
touch $FILE && chmod 600 $FILE;
cat > $FILE <(
echo -e "\n\n### Created: $TS ###\n";
EACH=/usr/local/cpanel/bin/rebuild_phpconf;
[[ -x $EACH ]] && $EACH --current 2>&1;
EACH=/usr/bin/php4;
[[ -x $EACH ]] && $EACH -v 2>&1 && $EACH -m 2>&1;
EACH=/usr/bin/php5;
[[ -x $EACH ]] && $EACH -v 2>&1 && $EACH -m 2>&1;
EACH=/usr/local/apache/bin/httpd;
[[ -x $EACH ]] && $EACH -V 2>&1 && $EACH -l 2>&1;
echo -e "\n### Specific Module Checks ###\n";
[[ -x /usr/bin/php ]] && /usr/bin/php -m|grep -e 'ffmpeg' -e 'memcache' -e 'magick' -e 'apc' -e 'xcache' -e 'eaccel' -e 'xcache'|tee -a $FILE;
);
```

