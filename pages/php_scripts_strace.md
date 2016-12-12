author: jack
topic: apache
topic: php
topic: performance
title: webpage strace

Slow Pages `strace` 
===================

When you're really desperate to know what's breaking a PHP script, here's a few strace lines to use to try to figure it out.

## Grab currently running Apache Processes ##

```bash
pgrep httpd | while read pid; do echo -n " -p "$pid; done | xargs strace -f -s4096 -ttt -o foo
```

## Trigger on condition and grab pids ##

In this one, you need to modify the loop to detect the proper process.

```bash
pid=""; while [ -z $pid ]; do pid=$(ps faux|grep user|grep -v grep|awk '{print $2}'); done; strace -p $pid -s4096 -ttt -o foo
```

## Run script and capture strace output ##

Sometimes, it's easier to simply run the script not through Apache - although not equally valid.

```bash
sudo -u $domainuser -o foo -ttt -f -s4096 php index.php 
```
