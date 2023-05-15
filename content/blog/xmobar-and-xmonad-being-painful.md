---
draft: false
date: 2023-02-26

title: Chronicles of XMonad and xmobar
subtitle: The user, the status bar, and the window manager

tags: [ Ricing, Haskell, XMonad, X11, xmobar ]

toc: false
---

This is a story about how the Haskell toolset, Arch Linux package maintainers,
and font rendering engines made me lose a few hours of my life. Of course, I
consider myself equally guilty, for my choices and stubbornness inevitably led
to the happenings I am about to relay onto you.

## Chapter 1: First Mistakes

It was a dark and stormy night somewhere in the world. I was sitting in front
of my laptop, speaking to a couple of friends over Mumble, when I accidentally
_knocked over the glass of soda_ I'd just fetched from the kitchen. It would
have been a minor inconvenience, had I not _spilled it directly onto my
laptop._ In a panic, I told my friends I'd be back later and immediately shut
the system down to avoid any short circuits.

Though I was able to clean up most of the mess, and properly avoided turning
the machine on in case there was still liquid inside, _the keyboard would
remain sticky for the rest of that laptop's life._ A keyboard replacement cost
too much money to justify the purchase, and I was due for an upgrade anyway.

When I got a new laptop, I decided this time around I wasn't going to waste
time customizing Windows. Instead I'd make the _switch to GNU/Linux
completely,_ and use all the cool tools I'd heard being talked about on IRC for
years. Rather than ask anybody what I should use, _I went with a Debian
netinst,_ and used the only window manager the name of which I could remember:
**XMonad.**

## Chapter 2: Growing Pains

_XMonad is a great window manager for the Haskell programmer._ In a way it
isn't a window manager unto itself, but rather a library for building your own
window manager in Haskell, with the configuration data type containing
functions for hooks that allow you to alter window managing behavior.  Should
you ever wish to fully control how your windows are managed on X11, and you're
either _a Haskell programmer or someone who truly wishes to become one,_ I
highly recommend XMonad.

You see, _I didn't fit into either of those categories_ when I started using
it, and for a couple months I was completely oblivious to the fact I was using
a programming language, not what I imagined to be XMonad's configuration
syntax. When I realized what it was, I was amazed, but at the same time
completely lost: I didn't know Haskell, and I had never come across functional
programming.

At some point, I decided _I was going to learn it,_ and fell in love with the
language. It allowed me to make my window manager do exactly what I wanted,
provided I could figure out its internal machinations. Erstwhile an advocate of
C as an end all be all language due to its simplicity, I might've abandoned
XMonad altogether had I been introduced to `dwm` sooner.

It was during this time of learning more about XMonad, window managers, and
Haskell that I found xmobar. It's an uncomplicated program that serves as a
status bar. Since it's written --- and can be extended --- in Haskell, it's a
common option for XMonad users.

My "Haskell studies" went well enough I was soon making changes to the modules
on the `xmonad-contrib` package. Some of those changes were submitted and even
merged upstream! Locally I started using `xmonad-git` and `xmonad-contrib-git`:
packages in the AUR that build the latest version of these two packages from
the `master` branch of their respective repositories. I just needed to point
them to my local work trees for testing.

## Chapter 3: Arch Linux and the Winds of Progress

One day I boot up my laptop as usual and try to `startx`, only to get a
mysterious error about missing shared library files. Recompilation of my XMonad
configuration wasn't working, as I knew how to do it only through `xmonad
--recompile`, and the `xmonad` binary was giving me the same linker error. I
turned to the `#xmonad` channel on IRC, then on Freenode. Turns out I wasn't
the only one that day inquiring about the same error messages!

Turns out the maintainers of Haskell packages on Arch Linux got tired of using
up obnoxious amounts of disk space by shipping static library files. At some
point they decided from GHC to Pandoc and XMonad, _every Haskell binary would
be dynamically linked_ against its dependencies, and every library package
would ship only the `.so` shared object files.

I shall take no part in the debate about whether dynamic linking is worse or
better than static linking. However, _Haskell makes dynamic linking a little...
problematic._ When packages are registered with GHC, their library files get
this seemingly random string of characters just before the `.so` extension ---
e.g. `libHSlibyaml-0.1.2-EKt9DNz2mMV6vcYqiiizdE-ghc9.0.2.so`. Maybe this is
done to ensure a specific build, or maybe it's just a way to make sure the GHC
ABI is what you'd expect. Whatever it is, _I don't like it._

The reason XMonad broke for so many users at the same time was because the
binary was dynamically linked against files that were no longer present: the
`haskell-*` packages that it depends on were updated, receiving completely new
set of random characters at the end, but the `xmonad` binary hadn't yet been
linked against them and pushed to the official repositories. _This was
resolved_ and now packages like `xmonad` are properly rebuilt on a timely
manner. However, _I said I started using `xmonad-git`!_ Rebuilding the package
then became my responsibility, and whenever dependencies were updated, XMonad
would stop working and I'd have to rebuild the whole package.

Eventually I started using Stack. It's a tool for managing GHC installations
and Haskell projects, and it's one of the choices to pick from when installing
XMonad. My XMonad configuration became a Stack package and _it just worked!_ I
could abandon the `xmonad` package from the official repositories and instead
rely on Stack to make a symlink in my `~/.local/bin` directory. By default,
everything was statically linked.

## Chapter 4: Font Rendering

Though I jumped off the Pacman train for XMonad, I had no reason to switch away
from the official package for my status bar, xmobar. It worked fine, with
linker errors seldom occurring. However, just a few days ago, the official
package was updated to version `0.46.0`, which brought with it the switch from
Xft to Pango as the font rendering engine --- a change merged upstream in
version `0.45.0`, previously not packaged. _Obviously, that couldn't have been
transparent._

No matter what font size I tried using, _DejaVu Sans Mono_ looked off, either
blurry or too big, completely different from how it looks on my terminal
emulator. Downgrading the package doesn't fix the issue, because then _you have
to downgrade all of its dependencies as well_ because of the dynamic linking
issue. If any of those dependencies are used by other packages, you'll have to
downgrade those as well. It's a mess.

So instead I went with `stack install xmobar-0.44.2` and called it a day. For
now I'm staying on that version, willing to backport bug fixes from upstream if
necessary. There's mention of [pangoxft][pangoxft] in an issue opened on the
xmobar issue tracker, so maybe there _is_ an upgrade path for me!

[pangoxft]: https://codeberg.org/xmobar/xmobar/issues/658

## Chapter 5: The Future

For the time being, using Stack to manage my Haskell projects is working out
okay, but I might switch to a distribution that still ships static library
files in their Haskell packages. Maybe Nix? Not sure.
