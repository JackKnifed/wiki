author: jack
topic: linux

# Encrypted Partition

First, generate and note a recovery passphrase with something like:

```
pwgen -y 24 24
```

Identify your target disk you want to encrypt and make it a dm-crypt volume:

```
cryptsetup luksFormat /dev/sdb1 

WARNING!
========
This will overwrite data on /dev/sdb1 irrevocably.

Are you sure? (Type uppercase yes): YES
Enter LUKS passphrase: 
Verify passphrase: 
```

Create the keyfile for auto-mounting:

```
touch /etc/mysql.keyfile
chmod 600 /etc/mysql.keyfile 
chown root:root /etc/mysql.keyfile
dd if=/dev/urandom of=/etc/mysql.keyfile bs=1024 count=4
4+0 records in
4+0 records out
4096 bytes (4.1 kB) copied, 0.000479566 s, 8.5 MB/s
```

Lock it down and add it:

```
chmod 400 /etc/mysql.keyfile 
chattr +i /etc/mysql.keyfile
cryptsetup luksAddKey /dev/sdb1 /etc/mysql.keyfile 
Enter any passphrase: 
```

Open the dm-crypt volume:

```
cryptsetup luksOpen /dev/sdb1 mysql-crypt
Enter passphrase for /dev/sdb1: 
```

Create a filesystem:

```
mkfs.ext4 /dev/mapper/mysql-crypt 
mke2fs 1.41.12 (17-May-2010)
Filesystem label=
OS type: Linux
Block size=4096 (log=2)
Fragment size=4096 (log=2)
Stride=1 blocks, Stripe width=0 blocks
15597568 inodes, 62381312 blocks
3119065 blocks (5.00%) reserved for the super user
First data block=0
Maximum filesystem blocks=4294967296
1904 block groups
32768 blocks per group, 32768 fragments per group
8192 inodes per group
Superblock backups stored on blocks: 
    32768, 98304, 163840, 229376, 294912, 819200, 884736, 1605632, 2654208, 
    4096000, 7962624, 11239424, 20480000, 23887872

Writing inode tables: done                            
Creating journal (32768 blocks): done
Writing superblocks and filesystem accounting information: done

This filesystem will be automatically checked every 31 mounts or
180 days, whichever comes first.  Use tune2fs -c or -i to override.
```

Create the mount point and mount it to put data in the volume:

```
mkdir /mysql-drive/
mount /dev/mapper/mysql-crypt /mysql-drive/
mkdir /mysql-drive/mysql.datadir/
```

Copy the data into the partition - MySQL is still the example here.
```
rsync -aHlP /var/lib/mysql/ /mysql-drive/mysql.datadir/
sending incremental file list

sent 15739 bytes  received 23 bytes  31524.00 bytes/sec
total size is 394661608  speedup is 25038.80
```

Now that the data is in the partition, no more loading with cheating:

```
umount /mysql-drive/
cryptsetup luksClose mysql-crypt
```

And you may want to redirect another location to a location on that drive:

```
rmdir /var/lib/mysql/
ln -s /mysql-drive/mysql.datadir /var/lib/mysql
ls -lah /var/lib/mysql 
lrwxrwxrwx 1 root root 26 Jul 10 14:22 /var/lib/mysql -> /mysql-drive/mysql.datadir
```

For automatic mounting, you'll need a line in `/etc/crypttab`:

```
mysql-crypt /dev/sdb1 /etc/mysql.keyfile luks
```

The following line in `/etc/fstab` is also required:

```
/dev/mapper/mysql-crypt             /mysql-drive    ext4    defaults,noatime 0 2
```

Finally, a ticket note should be added with instructions to mount the partition and the recovery passphrase:

```
cryptsetup luksOpen /dev/sdb1 mysql-crypt
mount /dev/mapper/mysql-crypt /mnt/mysql-drive
```
