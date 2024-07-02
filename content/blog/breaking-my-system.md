---
draft: false
date: 2024-05-04

title: Breaking and unbreaking my Arch installation
subtitle: An unsolved mystery and a solution?

tags: [ Linux, Technology ]

toc: true
---

A couple of weeks ago, I somehow managed to break my Arch Linux installation
through a simple `pacman -Syu`. I'm still not sure what caused it, but after a
quite normal package update, I rebooted the system and was met with a message
stating something along these lines, before I could even input my LUKS
passphrase:

```text
Failed to execute /bin/init (No such file or directory)
Failed to execute /sbin/init (No such file or directory)
Failed to execute /init (No such file or directory)
```

Considering the kernel image was loaded and was trying to load an init system,
this was likely a problem with the _initramfs._ For the unitiated, the _initial
RAM filesystem,_ also known as _initrd,_ for "initial ramdisk," is a temporary
file system that is loaded into memory during the boot process, to prepare the
system before the init system is loaded.

On a system like mine, with an encrypted root filesystem, the initramfs is
responsible for unlocking the encrypted LUKS volume so the Linux kernel image
can then mount the root filesystem. This should all happen before the system
root is mounted and `/bin/init` is executed. The init system could be one of
many, but on a default Arch Linux installation like mine, it is systemd:

```sh
$ file /bin/init
/bin/init: symbolic link to ../lib/systemd/systemd
```

So something seemed wrong with the initramfs, and thus my first instinct was to
`chroot` from another system and rebuild all the images with `mkinitcpio -P`. I
wouldn't need a live USB for this, as I had a dual-boot setup with NixOS, to
which I was in the admittedly slow process of migrating. Lucky me, I thought.

Visualizing the state of my system, I had:

```text
NAME          SIZE
nvme0n1     931.5G
├─nvme0n1p1     2G <--- /boot (EFI, broken initramfs?)
├─nvme0n1p2    16G <--- swap
├─nvme0n1p3   100G <--- LUKS
│ └─arch      100G   <- Arch Linux root (good?)
└─nvme0n1p4   150G <--- LUKS
  └─nixos     150G   <- NixOS root (good)
```

Booting up NixOS was working fine, so I mounted the Arch root and the boot
partition under `/mnt`, then tried to chroot into it, but instead of being
thrown into a shell within the Arch root, _I was met with a strange error that
disturbed my calm:_

```text
# mount /dev/mapper/arch /mnt
# mount /dev/nvme0n1p1 /mnt/boot
# mount -o bind /dev /mnt/dev
# mount -o bind /proc /mnt/proc
# mount -o bind /sys /mnt/sys
# chroot /mnt /bin/bash
chroot: failed to run command '/bin/bash': Input/output error
```

This was strange. I could mount the root filesystem, but not chroot into it.
**Have I run out of write cycles in the SSD?!** No, this NVMe SSD is almost
brand new, and I did manage to write to and read from it just fine, so that
cannot be it. I was also able to execute the binary file from NixOS just fine
by running `/mnt/bin/bash`, so it wasn't a problem with the binary itself.
Running `strace -f chroot /mnt /bin/bash` didn't give me any more information,
but it did show a ton of errors regarding accessing locale files in the
`/nix/store` directory, which was odd to me.

_Thinking perhaps this is a problem with NixOS itself,_ I looked up `chroot` on
the NixOS wiki, finding my way to [this article,][nixos-wiki-chroot] which
recommends the following commands to change root to **another NixOS
installation:**

```sh
mount -o bind /dev /mnt/dev
mount -o bind /proc /mnt/proc
mount -o bind /sys /mnt/sys
chroot /mnt /nix/var/nix/profiles/system/activate
chroot /mnt /run/current-system/sw/bin/bash
```

This latter part is very important. I knew it made no sense to run that
"activate" script on something that is not NixOS, but I thought perhaps this
was the way chrooting from NixOS was meant to be done. So **without backing
anything up,** I bind-mounted `/nix` from the outer NixOS installation at
`/mnt/nix` and ran it.

**DO NOT DO WHAT I DID,** because this was a huge mistake. Not only did I still
get the same error, I also managed to further break the Arch Linux installation
as the NixOS `activate` script overwrote files under `/etc`, `/var`, `/bin`,
`/lib`, and many other places with symlinks to the Nix store, which I needn't
note does not exist in the Arch root unless you're using Nix on Arch --- which
I am not.

Alright, so I had a broken system and I just poked additional holes into it. If
NixOS wasn't going to help me, perhaps an installation media for Arch Linux
would. _Let's create one and try to chroot from it._

[nixos-wiki-chroot]: https://nixos.wiki/wiki/Change_root

## The saga of the live USB

I looked for a spare USB stick and found _one with a capacity of 16 GB._ Trust
me, this detail will be relevant later. As per usual, I downloaded the latest
Arch Linux ISO from [the official website][archlinux-download] and flashed it
to the USB stick using `dd`:

[archlinux-download]: https://archlinux.org/download/

```text
# dd if=archlinux-2024.04.01-x86_64.iso of=/dev/sdb status=progress
# sync
```

Pretty standard procedure, right? Well, I booted off this USB stick and after
the loud and disturbing beep that plays upon successfully booting up the
installation media, I picked the first option on GRUB and...

```text
error: invalid magic number
error: you need to load the kernel first

Press any key to continue...
```

Sadly there was [no prompt for me to input 3.][magic-number] Pressing any key
to continue would just go down the boot menu. I tried the other options to load
the installation media, but they were all afflicted by this same error. Looking
it up online only brought me to forums where replies amounted to "your live USB
is broken, make a new one." Quite insightful.

[magic-number]: https://www.youtube.com/watch?v=J8lRKCw2_Pk

Maybe I did screw something up when flashing this guy, I thought, so I decided
to flash another ISO to the USB stick: the GParted live ISO. My partitions were
in need of a resize anyway, I might as well try and see if the problem
_magically_ goes away. **It didn't:** the same error was there, and I couldn't
get past the bootloader.

_A-ha! NixOS must be the problem!_ It is an immutable system, if there is such
a thing as a magic number generated randomly, it is likely to be the same for
every NixOS installation...? I don't know, this is a simple hypothesis and I
was desperate. My work machine is a Macbook, so let's just flash the Arch Linux
ISO from there!

### macOS absolutely sucks

For whatever reason I believed `dd` not to be available on macOS --- this is
incorrect, it is available and I should've tried using it, so take this section
with a grain of salt --- so I decided to use [balenaEtcher][etcher], which my
wife had used before to create a bootable USB stick for Ubuntu. Everything
looked promising, I granted the stupid permissions it asked for, and it failed
to flash by saying `/dev/disk2` was not writable. **Even running the program
with `sudo` had the same result.**

Okay, perhaps UNetbootin would work. I downloaded the macOS version, ran it,
and it failed to detect the USB stick no matter which USB port I plugged it
into. I checked permissions for the inodes, ran everything I could as root, but
it's like the system was working against me. After struggling with this for a
few hours, I gave up and called my wife to ask if I could use her Windows
machine to flash the USB stick.

[etcher]: https://etcher.balena.io/

### The sudden death of a USB stick

After being granted permission, I downloaded the Arch Linux ISO and flashed it
using [Rufus][rufus]. The process was quick and painless, and I was able to
boot off the USB stick without any issues. My first order of business now that
I could boot off the installation media was to create BtrFS snapshots to backup
my data. The one thing I wanted to separate from those snapshots was the
`/home` directory, so I needed to make it into a separate subvolume.

```text
# cryptsetup open /dev/nvme0n1p3 archlinux
# mount /dev/mapper/archlinux /mnt
# mv /mnt/home /mnt/old-home
# btrfs subvolume create /mnt/home
# cp -rp --reflink=always /mnt/old-home/* /mnt/home
!!! No space left on device !!!
```

Strange, this `cp` command was supposed to create a copy-on-write clone of the
directory, meaning no new space would be consumed to begin with. Perhaps
metadata needed to be created anyway, and I was running out of space in the 100
GB root partition. So I decided *it was time to resize these partitions* and
maybe get rid of NixOS for good; **time to flash the GParted live ISO.**

I move back to the Windows machine, plug in the USB stick, and... *its name and
filenames look like Minecraft incantations.* Against my better judgment, I
flashed the GParted live ISO to the USB stick using Rufus, and afterwards its
**reported capacity went mysteriously from 16 GB to 32 GB.**

I plugged it into my computer expecting the worst, but I was able to boot off
of it without any issues.

[rufus]: https://rufus.ie/

## GParted and LUKS

GParted is perfectly capable of unlocking LUKS volumes and mounting the
partitions that it finds within. I unlocked the Arch Linux root partition and
clicked around to schedule its resize. All it needed to do was:

1. Increase the size of the containing partition in the partition table;
2. Unlock the LUKS volume to reveal the partition within;
3. Extend the LUKS volume's awareness of the containing partition;
4. Resize the filesystem within the contained partition.

Except GParted refused to resize LUKS volumes for whatever reason. The error I
got was said to have been fixed a few years ago, and I was on the latest
version of GParted already. I thought perhaps if I went back to an Arch Linux
live installation media, I could install GParted and resize the partitions from
there. **Except now the USB stick no longer worked,** so I needed to find yet
another USB stick from which to boot. This took longer than I would've liked,
and *in the end I got the same error anyway.*

## The "fix"?

In the end I used the new installation media (on a new USB stick) to resize the
partition manually:

```text
# fdisk /dev/nvme0n1   # Delete and recreate the partition!
# cryptsetup open /dev/nvme0n1p3 archlinux
# cryptsetup resize archlinux
# mount /dev/mapper/archlinux /mnt
# btrfs filesystem resize max /mnt
```

This was enough for me to be able to create the subvolume I wanted to and the
copy-on-write clone of the `/home` directory. I then proceeded to create more
subvolumes for the root filesystem and take snapshots of what I had before.

None of what I tried doing to fix the existing system worked, but how could it
when I wiped a lot of it when activating a NixOS profile? I still don't know
why I tried that, but I did, and I paid the price. I'm still not sure what went
wrong, but all I could do in the end was create a completely fresh installation
of Arch Linux and restore my data from the snapshots I took.

```text
# cryptsetup open /dev/nvme0n1p3 archlinux
# mount /dev/mapper/archlinux /mnt
# mkdir /mnt/snap
# btrfs subvolume snapshot /mnt /mnt/snap/archlinux-broken-root
```

A copy of the Pacman database was also taken, so I could then reinstall all the
packages I had before. While this resulted in mostly the same setup as before,
I am now using the `sd-encrypt` hook for `mkinitcpio` instead of the `encrypt`
one, since the latter wasn't working for me anymore, and some mysterious
problems came up with Plex Media Player where I am unable to play any media.
