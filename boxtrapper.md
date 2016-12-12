author: jack
topic: cpanel
title: boxtrapper

BoxTrapper
==========

Disable across server
---------------------

```bash
\ls -d /home*|xargs -I {} find {} -maxdepth 2 -mindepth 2 -type d -name 'etc'|xargs -I{} find {} -name ".boxtrapperenable" -ls -delete
```