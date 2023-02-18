+++
draft = false
date  = 2023-02-17

title    = "Experiencing 64 GB of RAM + 80 GB of swap"
subtitle = "I am become Java, pursuer of RAM"

toc = false
+++

For the past couple of days I have been using a machine with _64 GB of RAM,_
and _80 GB of swap space._ This amount of computer memory is more than I have
ever conceived using. No, **I'm not gaming on it,** and I'm not a Java
developer running IntelliJ IDEA with 20+ projects open at the same time.
However, language servers and other applications I use on a daily basis have
made me rethink how much memory I really need.

The swap space there is not really to allow me to run more programs at the same
time --- they would be slowed down by the disk access anyway --- but rather to
have it in case I need it. I do have two swap areas, setup as follows:

- 16 GB of swap space on an NVMe SSD, _encrypted with a random key_ at every
  boot, with high priority for swap.
- 64 GB of swap space on a SATA SSD, encrypted with a fixed password, with low
  priority for swap used for hibernation.

The 16 GB of swap space on the NVMe SSD is the one actually meant to be used
should I start to run out of regular available memory. Meanwhile, the 64 GB of
encrypted swap on the SATA SSD was originally meant only for hibernation, but
since it would remain unused up until then, might as well put it to use should
my workloads really eat up all the memory.

## What uses so much memory? Why 64 GB?

Since the middle of 2022 I've been using a [micro form factor PC][optiplex]
called the Dell Optiplex 3080 Micro. Dell offers multiple configurations for
it, for storage, RAM, and CPU. You'll be paying a premium price no matter what,
but the cheapest will ship with _4 or 8 GB_ of memory, a _256 GB SSD_ for
storage, and a _Core i3-10300T_ for the processor. The most expensive one, if
I'm not mistaken, ships with a _Core i9-10900T._

The configuration I got came to me with _16 GB of RAM_ --- more than I had ever
had in any machine in my life --- just _256 GB_ for the SSD, and a _Core
i5-10500T,_ which to this day impresses me with its performance. However, I'm
guilty of running memory hungry applications all at the same time:

- Language servers to add functionality to Neovim through the LSP protocol.
- Kubernetes clusters for testing and development, through _kind_ and
  _minikube._
- Docker containers for testing and development, for things such as databases
  or whatever I'm working on.
- Slack, Telegram Desktop, Whatsie, Google Messages, sometimes even Microsoft
  Teams and Discord.
- Multiple Firefox instances, both for personal use and for work.
- Spotify or Tidal for music.

The list goes on. Plenty of these are memory hungry only due to their use of
Electron, thus making each and every one of them isolated instances of Chromium
or whichever engine they use, which is **tragic.** No matter how much I try, I
cannot truly run away from this trend of shipping Electron and tons of
JavaScript in the name of "cross-platform" development. Maybe soon I'll get
tired of it and switch to opening new Firefox windows in other workspaces
instead.

[optiplex]: {{< relref "using-a-micro-pc.md" >}}

## Setting up encrypted swap

To avoid leaving any unscrambled memory contents on the disk through swap or
hibernation, swap space should be encrypted. Previously, I setup a partition
for swap on the SSD through `cryptsetup luksFormat`, running `mkswap` on the
unlocked device afterwards. However, since the _new 16 GB swap area_ will not
be used for hibernation, the information on that partition is of no consequence
to the system and may be discarded at boot.

For added security, then, I now make use of a systemd feature: an encrypted
swap partition mounted with dm-crypt in plain mode with a random key at every
boot. This is accomplished with the following `/etc/crypttab`:

```
# name  device          password      options
swap    PARTLABEL=swap  /dev/urandom  swap,discard,cipher=aes-xts-plain64,size=512
```

The `swap` option implies `plain`, and makes it so systemd runs `mkswap` after
unlocking the device in plain mode. Thus the mapped device is ready to be used
with `swapon`. Add to this an entry for the partition used for hibernation ---
this one _will need a fixed password,_ as its contents do matter at boot ---
and then `/etc/fstab` becomes:

```
/dev/mapper/swap    none swap discard,pri=32767 0 0
/dev/mapper/slumber none swap discard,pri=0     0 0
```

Note that the regular `swap` space there has a higher priority than the
partition used for hibernation. That way, during normal operation you have both
swap areas available to you, but the one on faster storage will be prioritized
over the slow one.

## Upgrading my storage drive

I took the opportunity to upgrade the original storage drive to a [WD Black
SN770 1 TB NVMe SSD][hddb-wd] --- what a mouthful --- from the [ADATA IM2P33F3A
256 GB NVMe SSD][hddb-adata] that came with the computer. Not because I needed
a faster drive, but because I was in desperate need of more space thanks to
Docker and a couple VMs.

The _SN770_ isn't the fastest drive out there, but it's much faster than the
ADATA that came with the system, fast enough for my needs, and on top of that
it's affordable, costing roughly 100 CAD. The SATA SSD I'm using is a _Samsung
850 EVO 500 GB,_ which I had previously been using on my _ThinkPad X220._ I
don't think I'll run out of space, but in the future I might get a 4 TB SATA
SSD for storage purposes, when prices are much lower than their NVMe
counterparts.

[hddb-wd]: https://www.harddrivebenchmark.net/hdd.php?hdd=NVMe%20WD%20BLACK%20SN770%201TB&id=30900
[hddb-adata]: https://www.harddrivebenchmark.net/hdd.php?hdd=IM2P33F3A+NVMe+ADATA+256GB&id=27387
