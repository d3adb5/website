---
draft: false
date: 2024-09-25

title: "Talos Linux Homelab Pt. 1: An introduction"
subtitle: Yes, another on-premises cluster, what's new?

tags: [ DevOps, Homelab, Kubernetes, Talos, Technology ]

toc: false
---

There comes a time in a technology enthusiast's life when they decide to build
a homelab. Chances are if you're reading this, you've either googled the term
and know what I'm talking about --- so I promise not to take long in this
introduction --- or you're following me (stalking much?) and don't necessarily
care.

In any case, I've long had _VPSes_ to host my personal projects and services
like Plex for myself and close friends. It's always seemed much cheaper than
purchasing the equipment and hosting on-premises. Recently I've even set up a
Kubernetes cluster using [k0s, a Kubernetes distribution][k0s] made to be
simple and lightweight. Latency, bandwidth limits and weak hardware have
compelled me to build one instead.

[k0s]: https://k0sproject.io/

## Hardware

I don't have the space for a server rack, nor the time to shop for enterprise
equipment bargains on Facebook Marketplace and similar platforms. Much less the
patience to deal with the noise and heat of server equipment. So since I
recently [upgraded my desktop from an _Optiplex 3080 Micro_ to a custom
build,][desktop-blog] I decided to repurpose it as my starting point.

[desktop-blog]: {{< ref "building-a-computer.md" >}}

The next step was to bargain hunt for small form factor PCs that could be used
to compose the cluster. I found a few _Lenovo Tiny M920q PCs_ on Facebook
Marketplace for a good price, as well as an _Optiplex 7070 Micro_ on sale by
another seller. I bought 3 of the Lenovo PCs, and that Optiplex, to have a
total of 5 nodes.

I bought a bigger shoe rack off Amazon and used the old one as a shelf for
these machines. Now I have something of a homelab corner:

{{< figure
  src="/media/homelab-corner.webp"
  link="/media/homelab-corner.webp"
  caption="The homelab corner, between the new shoe rack and some boxes."
>}}

It looks messy, I know, but I did my best. The lower shelf will hopefully be
populated by a NAS sometime in the next year. You might have noticed the Lenovo
computers each came with a DVD drive. _Isn't that refreshing?!_

You might also notice there's a _network switch_ above one of the Optiplex
computers in the picture above. That's a cheap NETGEAR GS108 switch I bought
off Amazon, alongside a 5-pack of CAT6 cables. I have no need for more than a
Gigabit, and these machines don't have 2.5GbE or 10GbE ports anyway, before you
ask. I had to buy a very long Ethernet cable to connect to the ISP's router,
too. I hope to get a better router in the future.

I have to say, hoooking up all these machines to the switch felt very
satisfying. Maybe it's the clicky sound of the RJ45 connectors, or the fact
that with every click another machine was added to the network. I don't know,
but it at least doesn't look too messy:

{{< figure
  src="/media/homelab-network-wires.webp"
  link="/media/homelab-network-wires.webp"
  caption="The short, flat cables are actually quite nice to work with."
>}}

Lucky for me these guys, with one exception, all have the same CPU, an
_i5-8500T,_ and 16 GB of RAM. The exception is my old Optiplex 3080, which has
a more powerful _i5-10500T_ and 64 GB of RAM. I'll be using that one as the
sole control plane node, and hope that in the future I can find more of the
same model for cheap to make the control plane highly available.

## Software

At first I thought I was going to reproduce the k0s installation I've got on my
VPSes, and found that unfortunate. Going through the hassle of installing
something like Debian with an SSH daemon, then use roughly the same Ansible
playbooks? **I'd learn nothing new!** At first I thought it was a good
opportunity to use _NixOS,_ but then I stumbled upon [Talos Linux][talos], a
Linux distribution built for Kubernetes that is _production ready._

Talos is one of those _immutable_ distributions, and its machine configuration
is declarative, much like any other Kubernetes resource. It's got a
_convergence mechanism_ in `talosctl`, and is mature enough that it is used in
production already. _So I went ahead and set it up!_ This is what the Talos
dashboard looks like for the machine in the control plane currently:

{{< figure
  src="/media/talos-dashboard-ottawa.webp"
  link="/media/talos-dashboard-ottawa.webp"
  caption="When the node is plugged into a display, this is what you'll see!"
>}}

In the next part of this series of blogposts, I'll go through the process of
configuring the machines and setting up the cluster. If you want to go through
the files I'm using, you can look at [this repository on GitHub.][gh-repo]

[talos]: https://talos.dev
[gh-repo]: https://github.com/d3adb5/homelab
