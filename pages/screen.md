author: jack
topic: screen
title: screen

Screen
======

Screen allows you to start a command within it, run that command, and have that command associated with the screen process. You may then detach from that process and leave the command running, or multiple people can be in that same screen.

Listing Sessions
----------------

List screen sessions with the command `screen -ls`. Output will be like:

```bash
There are screens on:
	493649.jack	(Attached)
	570248.spam	(Detached)
	.ea	(Detached)
3 Sockets in /var/run/screen/S-root.
```

info> Screen identifiers are either PID or nice name - `493315` or `ea`.

Create a Session
----------------

```bash
screen -S name
```

Deattach
--------

Within a screen, to deattach press `Ctrl`+`a` then just `d`.

You can easily see if you are in a screen by bashing either `Esc` or `Tab` - both will make your session flicker _only in a screen_.

info> `Ctrl`+`a` brings focus to the first screen you are in. If you are in a screen in a screen, hit `Ctrl`+`a` then `Ctrl`+`a` _then_ `d` to deattach from the _outside_ screen.


Attach
------

info> You may only attach to a session that is currently unattached.

```bash
screen -r identifier
```

Join
----

info> You may only join a session that is currently attached.

When you Join a screen, you are then _also_ attached to the screen.

```bash
screen -x identifier
```

Wipe
----

Sometimes a screen will be listed as dead, or will be problematic. Use the following command to remove it.

```bash
screen -wipe
```

Help
----

Further information is available via `screen --help`.