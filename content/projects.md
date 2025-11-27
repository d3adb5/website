---
draft: false
date: 2023-03-06

title: Personal projects, pet projects, side projects, etc.
subtitle: Basically things I've had a hand in, one way or another!

navigation:
  index: 3
  right: false
  title: Projects

extensions:
  - flickity

stylesheets:
  - github-cards
---

_Presented to you in no particular order,_ here are some of the things I've
worked on that I believe are worthy of some note. Most of it is hosted on
GitHub, so I use the GitHub API to fetch data about them --- user avatar,
stars, languages used in the repository --- and present them neatly in cards on
a carousel.

For projects not originally mine, I'll explain my involvement or impact on them
in place of a project description. Since I'm trying to keep it concise, that
may be limited to two or three sentences, which is sometimes hardly fair.

## Personal projects

Code that against my better judgment I decided to publish for the world to see.
If you want to see more, check out my [GitHub profile][gh-profile].

{{< flickity >}}
  {{< github path="d3adb5/homelab" >}}
  {{< github path="d3adb5/helm-unittest-action" >}}
  {{< github path="d3adb5/app-of-apps" >}}
  {{< github path="d3adb5/website" >}}
  {{< github path="d3adb5/dotfiles" >}}
  {{< github path="d3adb5/smarky" >}}
  {{< github path="d3adb5/st" >}}
  {{< github path="d3adb5/scripts" >}}
  {{< github path="d3adb5/brainfuck" >}}
  {{< github path="d3adb5/devops-playground" >}}
{{< / flickity >}}

This section is limited to public repositories. Private repositories will be
covered later on.

[gh-profile]: https://github.com/d3adb5

## Contributions to other projects

Here are some projects I've contributed to on GitHub, along with my involvement
in each and every one of them:

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
    path="phuhl/linux_notification_center"
    description="Fixed build issues, a couple visual bugs, and am working on implementing unit tests and refactoring the existing codebase."
  >}}
  {{< github
    path="stakater/application"
    description="Introduced chart unit tests, refactored chart, and reviewed some PRs. Was made a repository maintainer by Stakater."
  >}}
  {{< github
    path="d3adb5/stalonetray"
    description="After adding features and refactoring the settings module, I became the project's official maintainer. I'm sorry in advance."
  >}}
  {{< github
    path="mumble-voip/mumble-docker"
    description="Simplified their image's entrypoint script, making use of more Bash features and making it more legible overall."
  >}}
  {{< github
    path="binbashar/terraform-aws-tfstate-backend"
    description="Added full compatibility with the Terraform AWS provider v4, and a feature to generate backend configuration."
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

Most of my activity on GitHub is private. Not because of work --- the company I
work for doesn't use GitHub --- but because I find there's information I'd
rather keep private stored in them. Examples of such pieces of information are
IP addresses and domain names of virtual machines I have running that are
exposed to the Internet.

Since they are private, the following cards were made manually:

{{< flickity >}}
  {{< project-card
    github="d3adb5"
    project="d3adb5/secretlab"
    description="Private side of the homelab project, containing information I'd rather not publicize, purely for privacy reasons."
    languages="HCL, Terraform"
  >}}
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
the _Linux kernel IIO subsystem._ The specifics: the commits add arrays
containing Open Firmware device IDs that a couple of drivers for Analog devices
should support, as well as a macro to simplify the capacitance channel
specification. I have fellow members of my student group in university to thank
for that, as I'd previously not even considered contributing to the Linux
kernel.

A hobby of mine since roughly 2016 had been repurposing my family's old laptops
as _home servers_ to run services like Pihole, Syncthing, Transmission, Plex,
Kodi, among others. It breathes life into old computers and is a fun side
project. These days, I run a [Talos-backed homelab][talos-pt-1] using
refurbished micro-desktop PCs.

These are most of the projects I can talk about --- I'm obviously excluding the
projects the companies I've worked for have ownership of, since _I do not want
to break any NDAs._ For the most part, I'm working with Kubernetes, Jenkins,
Terraform, GitLab CI, GCP, AWS, and so on. Contact me if you wish to learn
more!

[talos-pt-1]: {{< relref "blog/assembling-a-homelab-part-1.md" >}}
