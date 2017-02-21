author: jack
topic: apache
title: apache
topic: webserver

# Apache

Apache is a webserver.
A webserver is a server that listens on a port, speaks the HTTP protocol, and is designed to route all requests that come to it.

## Archtecture

Apache's code is structured one of three different ways.
When you build Apache, you pick an MPM - and you cannot swap out MPMs after compile or build in more than one.
Each MPM is like a divergent branch in the source code for Apache - they are compiled in at compile time.

Apache 2.0 introduced MPMs, mostly because at the time they wanted to rewrite the core but did not know how they wanted to approach it.

## MPM Prefork

Prefork is actually a MPM that's simply based on the previous internal archtecture.
The previous archtecture was designed and written before multi-threading, hyperthreading, and various other advancements.
Mostly it was optimized to run on a Pentium 4.

Prefork does put each request in a seperate thread, however those threads do not run concurrently.
Because of this, processing multiple requests requires that Prefork context-switch between the different threads.
Additionally, Apache has to context switch back to the polling thread it uses to listen for new incoming connections.
Thus, as the number of connections to Apache increases, eventually Apache cannot reasonably handle more requests.
This produces a general ceiling for `max_clients` on Prefork - usually `150` - `200`.

## MPM Worker