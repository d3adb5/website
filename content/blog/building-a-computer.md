---
draft: false
date: 2024-08-01

title: Building myself a desktop PC
subtitle: Midlife crisis? Waste of money?

tags: [ Hardware, Rants, Technology, Equipment ]

toc: false
---

This year I decided to build myself a computer, and use it to start playing
some graphically demanding PC games. The plan had existed for a while, but was
accelerated after I broke my Arch Linux installation on my Dell Optiplex 3080
Micro --- I blogged about it previously --- and decided I needed to ensure I
had backup installations and SSDs to fall back onto in times of need. In this
article I'll talk about what happened.

It might come as a surprise to some of the people who know me that I never
built my own desktop computer before. While I won't claim to have the same
knowledge as people who build computers as a job or hobby --- that can be quite
the _expensive_ hobby --- I've known my way around computer hardware after
messing with plenty of laptops and a pre-built desktop my mother gifted me
circa 2013. Building the computer from scratch itself wasn't a challenge, but
shopping for the right parts, saving the money up, and convincing myself it was
a good idea to go click "place order" sure was.

{{< figure
  src="/media/desktop-pc.webp"
  link="/media/desktop-pc.webp"
  caption="The _behemoth_ that is the PC on my desk, next to a can of coke."
>}}

I wrote on this blog about the performance of a micro form factor PC before.
That's been my main computer since late 2021 or early 2022, and was an upgrade
from a ThinkPad X220 that I bought used in 2018. That machine still works well,
and I'm likely to repurpose it to start a homelab, having it serve as a node in
a Kubernetes cluster. I can't stick a GPU into that, however, and though the
CPU is socketed, the chassis drastically limits the size of the CPU heatsink.
So here's the configuration of the desktop I built:

- *Motherboard:* ASUS PRIME X670E-PRO Wi-Fi, for no particular reason.
- *CPU:* AMD Ryzen 9 7950X, for the core count and AVX-512 support.
- *GPU:* AMD Radeon RX 7900 GRE, beefy, and with good Linux support.
- *RAM:* Kingston FURY Renegade 2x32 GB 6000 MT/s, because it was in the QVL.
- *SSD:* WD Black SN850X 2 TB, because I wanted an additional fast drive.
- *PSU:* Corsair RM850x, picked randomly from the Cybenetics list.
- *AIO:* be quiet! Pure Loop 2 FX 360, chosen because I heard their fans are
  quiet.
- *Case:* Fractal Pop XL Air, whimsically chosen while browsing cases in
  person.

I also added some case fans and an extra 3 fans to the AIO for a push/pull
configuration. If you want this list presented in a better way, well, [this is
the PC Part Picker link.][pcpartpicker] Note that I'm not an RGB kind of
person. The only reason I went for the _Pure Loop 2 FX_ was because the _Pure
Loop 2_ was out of stock, and the only reason I went for a triple pack of the
_Light Wings_ fans for the AIO was to use the same model of fan for all 6 fans
attached to the radiator.

[pcpartpicker]: https://ca.pcpartpicker.com/list/2KJC7R

## Naming the machine

All my previous machines were easy to name: either I picked a theme for all
home servers (e.g. Japanese northeastern prefectures) and went with that, or I
named it after the product line (e.g. `optiplex`, `inspiron`). This time there
was no theme --- I have no space currently for any home servers --- and there's
no OEM to name it after. So I had to take inspiration from one of the goals I
had for this machine: to be fail-safe, or in other words immortal.

A quick lookup of myths about immortality led me to the _Epic of Gilgamesh,_ a
tale about a king who becomes obsessed with immortality and ultimately accepts
that he can't live forever. Heck, if that doesn't fit the theme of _"redundant
wherever it is possible,"_ I don't know what does. So I gave this desktop the
hostname `gilgamesh`.

## Redundancy

Does this mean I'll have two drives in a RAID 1 configuration, perhaps with a
spare GPU, motherboard and CPU, maybe even a spare power supply, AIO and a UPS?
**Well, no, I'm not rich.** What I'll endeavor to do is make the machine itself
as reliable to myself as possible. That means _should any reasonable component
fail, I can most likely still boot into a working system._ This is how I'm
planning to achieve such a feat:

1. There should be multiple operating system installations, with at least one
   of them on a separate partition or drive. Since third party support,
   necessary for some firmware updates, is much better on Windows, I have
   installed _Windows 10 IoT Enterprise LTSC_ --- what a mouthful --- on a
   separate partition.

2. While the main bootloader (`systemd-boot`) will be used to boot into any of
   the available operating systems, there should be a spare installed just in
   case. _EFI greatly helps with this,_ as MBR would've otherwise allowed for
   only one primary bootloader. Add the Windows bootloader to the list and I
   should have 3 bootloaders to choose from.

3. If the filesystem for one of the operating systems gets corrupted --- more
   likely to happen with the BTRFS partitions being used for GNU/Linux
   distributions --- there is a bootable operating system on the machine still.
   Since Windows cannot use BTRFS, _its mere existence already satisfies this
   requirement._

4. There should always be a bootable live USB lying around close by, for system
   rescue purposes. This of course isn't about the machine itself, but it's
   worth mentioning that there's a little tray in the PC case I chose, and
   that's where my USB drives, including this installation media, are now kept.

5. The machine should be able to function without a GPU, in case the GPU fails.
   This means the CPU should have integrated graphics. _The AMD Ryzen 9 7950X
   has integrated graphics,_ so we're covered.

All of these items are in one way or another about ensuring that the machine
won't be a brick should something fail. I'm not going to be able to replace the
motherboard, CPU, GPU, RAM, PSU, AIO, or case fans on the spot, but in the
event that I make a mistake and break something on the software side, it almost
guarantees that I can still get some work done.

Besides, **Gilgamesh fails to achieve immortality,** so I shouldn't beat myself
up over not getting there either.

## The Mediatek MT7921K

Apparently AMD and MediaTek have been working together for a few years and have
a deal that encourages OEMs to use MediaTek's WiFi chips in their laptops and
motherboards. The ASUS PRIME X670E-PRO Wi-Fi has the _Mediatek MT7921K_
adapter, and while it works okay, it's not as good and consistent as the Intel
WiFi adapters. I chose to deal with the MediaTek chip for the time being.

When testing hibernation on an encrypted swap partition, I found that upon
rebooting not only did my resume configuration fail (for separate reasons), I
found that suddenly my kernel detected no WiFi interface. Rebooting into
Windows did not help. Trying to reboot back into Arch Linux showed that bootup
wouldn't get to my USB keyboard until the "USB initialization failed" messages
had gone on for about a minute. **The only thing that worked was unplugging the
computer from the wall and plugging it back in.**

Turns out power management for the MediaTek chip is a bit wonky, and once it
is... powered down or put into a low power state, it has trouble coming back
on. It's a good thing this is a desktop PC, because _the only way I found to
curb this issue was to disable power management for the WiFi chip._ Here is how
I did that:

- On Arch Linux, I [followed the wiki][archwiki-pm] and installed `iw` then
  added the following to `/etc/udev/rules.d/81-wifi-powersave.rules`:

  ```
  ACTION=="add", SUBSYSTEM=="net", KERNEL=="wl*", RUN+="/usr/bin/iw dev $name set power_save off"
  ```

  By the way, if you want to know if power management is enabled for your
  adapter, you can run `iw dev` to get a list of devices and, let's say your
  device is `wlan0`, you can run this to get your answer:

  ```
  $ iw dev wlan0 get power_save
  Power save: off
  ```

- On Windows, I went to the device manager, found the MediaTek WiFi adapter,
  went to the power management tab, and unchecked the box that said "Allow the
  computer to turn off this device to save power." I think. I'm not sure, it's
  been a few days and with Windows your mileage may vary.

It hasn't powered off on me while using the computer, and rebooting, resuming
from hibernation, and so on have worked without a hitch ever since. Despite
that, I recommend upgrading to another Wi-Fi adapter as I eventually will if
and when I no longer wish to put up with this chip's problems.

[archwiki-pm]: https://wiki.archlinux.org/title/Power_management#Network_interfaces
