author: jack
topic: performance
title: disk activity

Disk Activity Tracking
======================

Sometimes a server is writing a lot to the disk, and it's not just swap usage. Often in these cases, `iotop` is simply too heavy.


Run this to gather data for 120 seconds.

```bash
dmesg -c > /dev/null; echo 1 >/proc/sys/vm/block_dump && sleep 120; echo 0 > /proc/sys/vm/block_dump
```

Then, run this to parse the output:

```bash
dmesg | egrep "READ|WRITE|dirtied" |sed 's/\[.*\]//g'| awk -F'[\( :]' '{print $2, $NF}'|sort|uniq -c| sort -rn
```

This processes the writes that happened in that time frame, and lists them by device and process so you know what is using the disk.

ok> You may re-run the first block to gather a new sample.

When you are done:

```bash
echo 0 > /proc/sys/vm/block_dump
dmesg -c > /dev/null
```

warning> If you leave block_dump on it will likely cause issues on the server. Run the above when you are done.
