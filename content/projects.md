---
draft: false
date: 2023-03-06

title: Personal projects, pet projects, side projects, etc.
subtitle: Basically things I've had a hand in, one way or another!

navigation:
  index: 2
  right: false
  title: Projects

extensions:
  - flickity
---

Presented to you in no particular order, here are some of the things I've
worked on, in one way or another, that I think are worthy of some note. I'll
add descriptions for each project, or for my involvement in it if it's not
originally mine.

Let's start with _personal_ projects on _GitHub!_ This will make up most of the
projects listed here, as most free and open source projects are hosted on
GitHub --- for better or for worse --- and that's where I host mine as well.
For each repository, the languages used are listed below the project
description in order of most used to least used. These appear as detected by
GitHub and may not be accurate.

**DISCLAIMER:** There's a little bit of JavaScript in this page as a result of
trying to make a nice looking GitHub project carousel, but the page should work
just fine without it as well. _Feel free to scroll through (dragging works
too):_

{{< flickity >}}
  {{< github path="d3adb5/smarky" >}}
  {{< github path="d3adb5/helm-unittest-action" >}}
  {{< github path="d3adb5/website" >}}
  {{< github path="d3adb5/dotfiles" >}}
  {{< github path="d3adb5/devops-playground" >}}
  {{< github path="d3adb5/st" >}}
  {{< github path="d3adb5/scripts" >}}
  {{< github path="d3adb5/brainfuck" >}}
{{< / flickity >}}

The number of stars in the repositories above is pretty low, eh? If you think
any of these are useful or cool, _please consider starring them on GitHub!_ It
boosts my ego and shows me people are at least a little bit interested in what
I'm working on.

I have other repositories that aren't listed here, be it because they're
private or because I didn't think they were worth highlighting on this page.
I'll speak about the private repositories further down, but first, _here are
some projects I've contributed to on GitHub,_ along with my involvement in each
and every one of them:

{{< flickity >}}
  {{< github
    path="stakater/reloader"
    description="Got a couple of PRs merged, fixing issues in both Reloader and in its Helm chart."
  >}}
  {{< github
    path="profclems/glab"
    description="Added a feature to allow specifying a Git remote name when creating a repository on GitLab. This apparently went official!"
  >}}
  {{< github
    path="xmonad/xmonad-contrib"
    description="Contributed a couple modules I wrote and changes I made to existing ones! XMonad is my window manager of choice."
  >}}
  {{< github
    path="stakater/application"
    description="Introduced chart unit tests, refactored chart, and reviewed some PRs. Was made a repository maintainer by Stakater."
  >}}
  {{< github
    path="kolbusa/stalonetray"
    description="Added a feature to ignore tray icons based on their window class."
  >}}
  {{< github
    path="mumble-voip/mumble-docker"
    description="Simplified their image's entrypoint script, making use of more Bash features and making it more legible overall."
  >}}
  {{< github
    path="lucasoshiro/oshit"
    description="Git reimplementation in Haskell. I'm responsible for the unit tests, CI pipeline, and huge codebase refactors."
  >}}
  {{< github
    path="screensy/screensy"
    description="Translated screensy's UI into Portuguese."
  >}}
  {{< github
    path="vaugusto92/cpp-assert"
    description="Added CI workflows and improvements to project structure and build process. This is an assertion library made by a friend."
  >}}
  {{< github
    path="viniciustrainotti/terraform-aws-static-website-module"
    description="Helped with initial development, reviewing PRs, and with support for multiple domains and Terraform versions."
  >}}
  {{< github
    path="taksan/xwiki-helm"
    description="Added CI through GitHub Actions and improvements to the Helm chart."
  >}}
  {{< github
    path="soarqin/ReGBA"
    description="Added support for the trigger buttons as codified in the PlayGo handheld."
  >}}
  {{< github
    path="Hilbertmf/8bitsFightClub"
    description="Submitted a PR changing project structure, adding a POM file, and adding a CI pipeline."
  >}}
{{< / flickity >}}

I'm leaving out some old repositories and repositories that have since been deleted.

## Private repositories

One could say most of my activity on GitHub is private. That's not because of
work, since the company I work for doesn't use GitHub, but more so because I
find there's information I'd rather keep private stored in them. Examples of
such pieces of information are IP addresses and domain names of virtual
machines I have running that are exposed to the Internet.

Anyway, here's a list:

{{< flickity >}}
  {{< project-card
    github="d3adb5"
    project="d3adb5/services"
    description="Ansible configuration to deploy and manage Docker-backed services on my servers. CI/CD done through GitHub Actions."
    languages="Ansible, GitHub Actions"
  >}}
  {{< project-card
    github="d3adb5"
    project="d3adb5/dmenu"
    description="A fork of dmenu, using libxcb where possible instead of Xlib. Some popular patches were also applied and maintained."
    languages="C, Makefile"
  >}}
  {{< project-card
    github="d3adb5"
    project="d3adb5/cmddisplay"
    description="A library to create and manipulate virtual displays on the command line. Written for tutored students to use in their projects."
    languages="C, Makefile"
  >}}
  {{< project-card
    github="d3adb5"
    project="d3adb5/deskbot"
    description="A modular IRC bot written from scratch in Python. Written as a pet project to learn the language and be productive."
    languages="Python"
  >}}
  {{< project-card
    github="d3adb5"
    project="d3adb5/discord-bot"
    description="A modular Discord bot written using discord.py. Featured channel management and scaling capabilities with multiple bot accounts!"
    languages="Python"
  >}}
  {{< project-card
    github="d3adb5"
    project="d3adb5/ahk"
    description="A collection of AutoHotkey scripts, from when I used Windows 7. Had to figure out some obscure Windows APIs to use for it."
    languages="AutoHotkey"
  >}}
{{< / flickity >}}

Some of these are no longer maintained, but are recorded here for posterity.

## Other projects

I'm also listed as a co-author of a couple of commits accepted into staging in
the _Linux kernel IIO subsystem!_ The specifics: the commits add arrays
containing Open Firmware device IDs that a couple of drivers for Analog devices
should support, as well as a macro to simplify the capacitance channel
specification. I have fellow members of my student group to thank for that, as
I'd previously not even considered contributing to the Linux kernel.

A hobby of mine since roughly 2016 is repurposing my family's old laptops as
_home servers_ to run useful services like Pihole, Syncthing, Transmission,
Plex, Kodi, among others. It breathes life into old computers and is a fun side
project.

Anyway, these are all I can talk about --- I'm obviously excluding the projects
the companies I've worked for have ownership of, since _I don't want to break
any NDAs._ For the most part, I'm working with Kubernetes, Jenkins, Terraform,
AWS, and so on. _Contact me_ if you wish to learn more!
