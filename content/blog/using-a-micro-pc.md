---
draft: false
date: 2022-08-13

title: How does a micro form factor PC perform?
subtitle: A desktop the size of a lunch box with surprising performance!

toc: false
---

Not too long ago, I started looking into building myself a reasonable desktop
so I could finally graduate from my ThinkPad X220. Don't get me wrong, the X220
is pretty neat and will still work for a long time, but sometimes its fan would
go turbo mode while running relatively simple programs like Telegram Desktop
and Discord. You could chalk that up to the applications not being well
optimized _--- and that is specially true for the latter example ---_ but at
some point you give in and start looking to replace the hardware that was
already meant for just office work **when it came out back in 2011.**

{{< figure
  src="/media/thinkpad-x220.webp"
  link="/media/thinkpad-x220.webp"
  caption="The X220 is a 12.5in laptop with a nice keyboard. Pretty portable!"
>}}

My main concern with getting a desktop was the fact I don't have a lot of space
where I currently live. There's barely enough space on my desk for a mini-ITX
case, and those already become complicated builds when you want to maintain
extensibility. _Why was I looking for extensibility, however?_ I kind of wanted
the ability to, in the distant future, get myself a nice GPU so I could play
enhanced versions of console games through emulation. I barely have time to
play on my Switch, so why go the extra mile here, right?

The idea of getting a GPU in the future became clearly unimportant, and all I
wanted in a desktop now was for it to be as compact as possible while staying
serviceable. If the CPU went bust, I wanted to be able to replace it, perhaps
even upgrade it. So too with the RAM, with the storage, with the WiFi card. I
thought there was nowhere to go but a mini-ITX case, except...

{{< figure
  src="/media/optiplex-3080.webp"
  link="/media/optiplex-3080.webp"
  caption="The Dell Optiplex 3080 Micro has a volume of just over 1 liter."
>}}

I was lucky enough to come across the existence of work oriented small desktops
made by Lenovo, HP and Dell. Their lines of small form factors are referred to
by YouTube channel ServeTheHome as _TinyMiniMicro,_ for they are ThinkCenter
Tiny, EliteDesk Mini, and Optiplex Micro. They're fully working desktops that
take up just over a liter of space, and are marketed to businesses as
workstation PCs.

For these machines, extensibility was sacrificed for the sake of saving space:

- You can't pick your own motherboard, though you might be able to find
  compatible boards in the same line of products.
- The only PCIe slots available are mini PCIe, and will likely be used just for
  an NVMe SSD and a WiFi card. No GPUs here.
- You'd be hard pressed to find alternative cooling solutions to the OEM's in
  the market, which leads us to...
- Your PSU is a laptop charger, so you're pretty much restricted to low-power
  CPUs.

In other words, a lot of the cons of a laptop are there, but think "work
laptop" and not some Alienware type thing. HP does offer models of their
EliteDesk PCs with a laptop version of the GTX 1660 Ti, but on a machine this
small I imagine the multiple fans would go turbo mode. At that point, with how
much you'll be spending, it's probably best to go with a console or build a
custom desktop.

Despite the cons of a laptop, there are some pros of a desktop: the CPU and the
RAM sticks are socketed, so you can replace or upgrade them at any point.
Nothing's soldered in place. You can easily replace / upgrade the thermal paste
that comes applied from the factory, and clean the fan when it starts getting
dusty and noisy. The benefits sort of end there, though.

So I went and got myself a _Dell Optiplex 3080 Micro_ with 16 GB of RAM, an
Intel AX200 WiFi card, a 250 GB NVMe SSD, and an i5-10500T. Would've gone for
an i7 machine, but it wasn't available at the time and I ended up being
perfectly happy with the performance I get out of this i5. Maybe I'm biased,
after all I jumped 8 generations from i5-2540M to an i5-10500T, from 2 cores /
4 threads to _6 cores / 12 threads,_ from 8 GB on DDR3 to _16 GB on DDR4._ This
is also the first time I'm using an NVMe drive, even though it's a low end one.

PC users who play video games will find no use for this sort of machine. Those
who are using it for CPU-heavy applications might scoff at the puny i5, but I'm
a programmer and other than running unit tests and the applications I work
with, all I do is play Tetris, run text editors, language servers, and listen
to music. Does it work well? _It works amazingly well for me!_ Maybe you can
compile more quickly than I do, but does your desktop take up less space than a
2 liter bottle of soda? Didn't think so.

## Minecraft

While it's not something I play often or at all, it's good to know that if at
any point I feel like playing it, I can: with vanilla Minecraft and OptiFine
alike, the average FPS I get with modest settings is 75. It dips below that
somewhat frequently, however. Setting my monitor's refresh rate down from 75 to
60 Hz, I'm able to maintain a steady 60 FPS with the same configuration.

*Note:* I'm using a monitor with a resolution of 2560x1080. Running Minecraft
at a lower resolution, be it windowed or having set a lower resolution for the
monitor through XRandR, will naturally get you better results.

## Citra

Nothing to really brag about, but I can also run games with Citra at 4x native
resolution and a good framerate. Since I have a 3DS, I don't _need_ to emulate
the games through Citra, but I was able to keep 100% performance on _The Legend
of Zelda: Ocarina of Time 3D_ at 4x native res while streaming the emulator's
window to Twitch through OBS. **No, I'm not a Twitch streamer,** I just wanted
to show someone the game, and I don't have a capture card.

## PCSX2

Back when my PS2 had been sold, didn't work, or was just stored away in a way
that made it a hassle to fetch it and set it up, I tried emulating _Kingdom
Hearts_ and _Kingdom Hearts 2_ on my Core 2 Duo PC. I didn't have a graphics
card, not that it would've mattered much, and the games ran... at maybe 12 FPS?
It just didn't work out, even after I got a desktop with a Core i3.

Well, _both games work alright on this wee PC!_ ~~Haven't fiddled with them all
that much because for some reason my controller's analog stick is behaving more
like a D-pad in-game, but at some point I'll figure that out and go back to
it.~~ I'm building PCSX2 from source using the `pcsx2-git` package, and the
issue I was observing is no more (at least on `v1.7.0.dev.r4138.g8b2966e29-1`),
so hooray!

Using a 60fps patch for the game --- which does lead to some tolerable glitches
--- I'm able to run it at a constant 60fps at 1x native resolution with 4x
anisotropic filtering, full PS2 mipmapping, Vsync, etc. It's no heavy toll on
the wee computer, as I'm *also able to capture and stream the game with OBS* at
960x540@60Hz.

## Conclusions

For someone who spends most of their time on the terminal --- be it writing
scripts, obsessively updating packages, or doing important work with cloud
infrastructure --- a powerful machine isn't really necessary until you start
testing programs locally. Even for those who use GUIs, work related programs
will have no trouble running like butter on the i5-10500T or similar
processors. The cherry on top is that you're also capable of playing some less
demanding games and emulating PS2, 3DS, GameCube, etc.

The one thing that would make it ideal would be for it to have an internal UPS,
or for the AC adapter to have that capability out of the box. Not very
feasible, but I'll just get a UPS whenever I can. It's been a while since I had
to fear losing any work because of a power outage.

I like my wee PC. It's nice. *There are many like it, but this one is mine.*
