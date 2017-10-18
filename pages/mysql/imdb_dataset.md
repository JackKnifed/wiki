## Import IMDB dataset ##

First off, kicked off a new server to play with, pt-query-digest.jhayhurst.com.
Kicked it in zone b lansing, so it's kvm, but that doesn't matter (ever).
Made it Ubuntu cause dealwithit.gif. Once that's up, make sure you've got 5.6+.
(Use [dotdeb repos](http://dotdeb.org/instructions/) Or Percona)

```
apt-get install percona-server-server-5.5
```

OH SHIT SON THAT CREATED THE DATABASE AND PUT THINGS IN IT. What now then you say? Enable the slow query log?

```
slow_query_log_file	= /var/log/mysql/mysql-slow.log
long_query_time = 0
log_slow_rate_limit = 10
```

what's that `log_slow_rate_limit` stuff you ask?
Well, imagine, what if you could, instead of logging queries that take longer than 10 seconds, log every 10th query? or 50th query? Awesome, right?

## GET SOME TEST DATA ##

So, first, I go find some sample data. Let's say I find the site:

[http://www.mysqlperformanceblog.com/2011/02/01/sample-datasets-for-benchmarking-and-testing/](http://www.mysqlperformanceblog.com/2011/02/01/sample-datasets-for-benchmarking-and-testing/)

Let's drill into IMDB! So, I find this ftp site:

[ftp://ftp.fu-berlin.de/pub/misc/movies/database/](ftp://ftp.fu-berlin.de/pub/misc/movies/database/)

That is all their data, in .csv's

So, I download that with:

```
wget -O listing ftp://ftp.fu-berlin.de/pub/misc/movies/database/
```

Then I cut that up a bit to get a listing of all the files (just the files) and no folders:

```
sed -i.lwbak '/href=/ !d' listing
sed -i -e 's/^.*href="//g' -e 's/">.*$//g' listing
sed -i '/\.gz$/ !d' listing
```

Which leaves me with a nice list of files in ftp to hit. Now, I could just get these gzipped files with:

```
cat listing | xargs wget
```

But as anyone knows, this is going to start those ftp downloads with wget in parallel - which will spike that bandwidth, and kill IMDB.
(psst screen?) I'm not gonna kill IMDB, so I script a for loop with some delay:

```
for each in $(cat listing); do sleep 15; wget $each; done
```

It's not complex, but it does it in serial, and I want to be nice. Now, to load in the data, I'm going to turn to:

[http://imdbpy.sourceforge.net/support.html](http://imdbpy.sourceforge.net/support.html)
[http://imdbpy.sourceforge.net/docs/README.sqldb.txt](http://imdbpy.sourceforge.net/docs/README.sqldb.txt)

So, install that shit:

```
apt-get install python-easy_install python-mysqldb
```

then down load the source from the first link, unpack it, and run some:

```
./setup.py --without-cutils --without-lxml install
```

Then, create your database, and start it to importing:

```
mysqladmin create imdb
imdbpy2sql.py --mysql-innodb -d /usr/local/src/imdb.dataset/ -u 'mysql://root:cuib6teexaika8oofoB9ouHi@localhost/imdb'
```

And it's importing. Hope you ran that in a screen. Cause it took me:

```
2917min, 20sec (wall) 57min, 58sec (user) 10min, 30sec (system)
```

Or 48 hours, 37 minutes (by the script). Two days. Seriously.