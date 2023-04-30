---
draft: false
date: 2022-06-18

title: Using Git outside of programming
subtitle: How collaborative work heavily benefits from Git

toc: false
---

It is public knowledge that versioning is important when writing documents, be
it source code for a project written in a programming language, drafts of a
book, or meeting minutes. GitHub, for instance, uses Git for their _site
policy, documentation,_ and _roadmap,_ none of which involve or focus on
programming. But what if we don't care too much about versioning itself?

Keeping a history of versions of a piece of work doesn't come to mind so
naturally, especially for those of us who don't want to show whatever we're
working on to anybody until we're perfectly happy with it. We forget that the
history being preserved serves us far more than it does anybody else: did you
come up with a good idea for working around X limitation? _Write it down!_

To programmers, applying Git to any one project is trivial and effortless. The
fact is that it takes some understanding of the tool to explore its true
potential, and for non-programmers, the command line is the biggest barrier of
entry. Why struggle with learning just what buttons to press when _Google Docs_
lets you just type away and automatically keeps a history of changes? I don't
like that. It's nice that the tool can do that for you, but what about
_collaborating in parallel_ with multiple people who move at their own pace?

## Moving at your own pace

Git is decentralized, meaning you can have multiple repositories to pull from
at a time. They each contain Git objects created by the people who have write
access to them, and the _maintainers_ of each repository can choose to pull
from another for a _merge_ at any point, however they like. There's no true
centralized control, which is incredibly liberating, as we are able to maintain
different versions of the overarching repository itself.

Combined with the fact Git is able to merge histories that branched apart an
arbitrarily long time ago, so long as we resolve any conflicts that might turn
up, what this allows for is a bunch of people working on their repositories at
their own pace:

- Got a team working on writing articles for section A of your site? They can
  have a fork of their own to work on, and periodically request the core
  maintainers pull from specific branches of that fork to merge the articles
  into the main site.

- Somebody outside your project wants to contribute to it? They can fork the
  repository, make their changes, and at any point submit a pull request, which
  your team can review, and soon that stranger can become a part of the team.

- A specific feature will take weeks to finish, but other people want to focus
  on a completely unrelated part of the work? Let it happen in tandem and deal
  with the merge conflicts later on! Git will help you merge all the work.

Heck, this website, while personal, is versioned through Git and if anybody
wants to add anything to it, they can always submit a pull request over on
GitHub. It is no Wikipedia or news outlet, but the possibility is there.

## Getting the interface out of the way

The answer to the problem of non-programmers finding it hard to use Git is
simple: create a friendly interface that uses Git in the back for versioning.
You'll never reach the flexibility and manageability of using Git directly, so
leave that to the core maintainers of the repository keeping everything
together.

GitHub, GitLab and other suites have Web interfaces for you to use for general
purpose, while wiki tools like Wiki.js have ways for you to integrate Git and
the articles you can store on the service, be it as a storage module or as the
true backbone of the operation. These let people use Git even if they don't
know they're using it, and for others it's a gateway to later picking up Git
directly.

Am I one to vehemently support this or do it myself? Not really. If you know of
it and you can see the potential benefits, take the time to learn it, I say.
Sounds like a holier-than-thou attitude, but I'm sure the main reason
non-programmers who could benefit from it do not use Git in their projects
is... _they just don't know it exists._
