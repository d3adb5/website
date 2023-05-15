---
draft: false
date: 2022-05-13

title: "On linear history with Git: rebase, merge, squash"
subtitle: To rebase or not to rebase, that is the question...

tags: [ Versioning, Git, Technology, Opinions ]

toc: false
---

**DISCLAIMER:** I do not claim to be an expert on Git, nor do I claim to have a
lot of experience in source code management tools. This article is being
written as I decide what I want for my own projects, and how I position myself
on the application of each "philosophy", so to speak. This topic is
controversial in ways I hadn't even imagined before.

_Note:_ Decent knowledge of Git and its terminology is assumed here. Some
commands might be shown, but explanations about what a `commit`, a `branch`,
etc. are will not be present. Links to documentation will be added on occasion.

## What is linear history?

A repository's commit history is said to be linear (sometimes semi-linear) when
there are no parallel branches of development with visible changes. In other
words, changes follow a _strict order,_ which may or may not be chronological.
Put more succinctly, you are able to follow the `commit` history without having
to branching out at any point in time.

An example of linear history:

```
* a64cdd6 feat(bar): extend new feature
* 8bce4d5 feat(bar): introduce new feature
* 12757f0 feat(foo): send processed info to server
* f26b0a5 feat(foo): process some information
* 3016bae chore: starting this repository
```

These commits are in a clear and direct order: `3016bae`, then `f26b0a5`, and
so on until we reach `a64cdd6`. We can perfectly understand the project's
evolution, especially if we can count on well crafted commit messages.

Speaking of commits, projects of every scale tend to follow workflows that ---
at least on paper --- follow the general guidelines of "`commit` often,
`branch` out for every feature." As we run`git merge` to incorporate changes,
soon we'll have created "train tracks" in our Git history.

However, if we try to preserve linearity when merging, we'll likely request a
`rebase` before every `merge`. In the end, picking merge commits over a
_fast-forward_ merge, our history will take a shape that we often refer to by
"semi-linear":

```
*   1d26fed merge: feature/bar into master
|\
| * be56591 feat(bar): extend new feature
| * ad2cf56 feat(bar): introduce new feature
|/
*   189e487 merge: feature/foo into master
|\
| * 36d49e6 feat(foo): send processed info to server
| * 1528f6c feat(foo): process some information
|/
* 3ad35f0 chore: starting this repository
```

There are technically parallel branches, but changes are _always on only one of
them,_ while the other is a direct link between the _merge-base_ of our
significant branch and its end point. That way, we do not lose the ability to
follow changes made to the work tree sequentially.

To do so, you need only "flatten" the history above. The result, without taking
commit hashes into consideration, is the same as the first commit history shown
here. The "layers", "levels", branches, however you wish to call them, serve
the function of identifying each _arc_ of the development process, or at least
the times we stopped to review what was done.

### Train tracks

You might not know it by this name, but the following is an example of a commit
history that we call "train tracks":

```
*   1805ccb merge: bar into master
|\
| * 9232bac feat(bar): more stuff
| * 87ddf92 feat(bar): do stuff
* | 2cb78b7 something changed again
* |   1e7e0e8 merge: foo into master
|\ \
| * | 4b0d990 feat(foo): add something else
| * | 51fb8b4 feat(foo): something something
| |/
* / 26339fc whoops, something changed here
|/
* f51dc43 chore: start
```

Notice how difficult it is to read changes made to the code in a well ordered
manner. It isn't impossible, and it isn't _wrong:_ Git was designed to be able
to merge vastly different development branches, since many people working on
the same file tree cannot always stop to update their local histories. Instead
you work while hoping there aren't _merge conflicts_ in the end.

## What is the meaning of history to you? What about Git?

Before we list the pros and cons of having linear history, I believe it is
necessary to discuss the subjective aspect of commit history. Git is a version
control software, but the question of _which versions should be stored_ is very
relevant.

Some possible answers:

- Every change made to the code by a developer who considered it sufficient to
  constitute a commit.
- Every version of the code that passes the automated tests.
- Every change made in the software development lifecycle, be it something we
  can read sequentially or not.
- Everything we believe is relevant, even if it breaks automated tests,
  compilation, or functionality.

Perhaps the reasoning behind each answer can be explained by their use of Git.
Do we wish to preserve _history_ as it really happened, or do we wish to
compose the clean and comprehensible _story_ of how our project was developed?
If we find a bug, do we search for the change that introduced it by using `git
bisect` and automated tests, or do we just look for the piece of code that is
causing the bug?

**In my opinion,** the history should show the evolution of the project and not
every developer's involvement. I say that because I see commits as part of
documentation, and changes scattered across 30 pages is more difficult to read
than well structured sections in a clear order.

In an ideal world, no commit would introduce bugs, and Git hooks could be used
to run tests before every new commit. In reality, be it a result of
carelessness, whim, or `rebase`, we frequently create commits that break the
tests that _hopefully_ exist. [This article][stop-using-rebase] explains some
drawbacks of using `git rebase`, but it does so from a standpoint of someone
who uses Git to find the source of an error, or like a "safety net."

I ask the reader:

1. Those who defend the _merge_ strategy claim that there are few people who
   know how to _rebase._ How many people do you know who not only know of the
   _bisect_ command, but also how to use it?

2. Using Git as a debugging tool depends on a well written test for _bisect_,
   which is compatible up to its starting point, as well as on developers who
   test their changes before each commit. Do you see that as a common thing?

3. Those who defend the _merge_ strategy claim _rebase_ is "rewriting history".
   It is indeed, but if history is messy and involves changes that break the
   build or testing process, wouldn't _bisect_ fail us anyway?

4. We can _squash_ commits before they're merged and in doing so guarantee
   they're going to work, so we can _bisect_ with more confidence, but... isn't
   that also rewriting history?

It is a well written article that raises a good point, but that creates a
requirement even harder to meet than being able to perform a measly _rebase._
After all, if every developer tested their own changes before committing them,
_why would we need CI builds?_

[stop-using-rebase]: https://medium.com/@fredrikmorken/why-you-should-stop-using-git-rebase-5552bee4fed1

## What happens in practice

I will sound pessimistic and arrogant in saying this, but the majority of
developers, no matter the company, will create commits without testing their
changes, without reviewing them, without updating their local history before
creating a new branch. Try not to read this as criticism, as I myself am guilty
of these same sins. Instead, read my words as mere paraphrasing of the maxim
"it is only human to make mistakes."

Building upon this mutual understanding of "we're going to screw up," we can
imagine real situations that might take place when applying one strategy over
the other, and even name them:

1. _Free-for-all, chaos,_ or _harsh reality:_ to preserve history as it is,
   keeping every change made by the developer, even if their branch originates
   80 commits ago, and 80% of changes to be incorporated have to do with
   conflict resolution. Since _squash_ and maybe even CI builds are absent, it
   is not possible to guarantee each commit in the repository passes the
   testing phase.

   - It is **not** possible to follow the history sequentially.
   - It is **not** easy to find errors using _bisect._
   - Each developer's history is _preserved._

2. _Compressed changes_ or _code bombs:_ before each merge, no matter where the
   source branch started, _squash_ and _rebase_ the proposed commits, so a
   single commit is merged in the end. CI builds will guarantee the final
   commit --- that becomes a code bomb with potentially thousands of lines ---
   passes the testing phase.

   - It _is_ possible to follow the history sequentially, **but** there'll most
     likely be code bombs here and there.
   - It _is_ relatively easy to find errors using _bisect,_ **but** they end up
     hidden in big diffs.
   - The history of each developer is **not** preserved, for commits end up
     being dropped.

3. _Linearity at last:_ to perform a _rebase_ before each merge, guaranteeing
   changes to be incorporated find their starting point at the most recent
   version of their target branch, even if that means abandoning commits that
   previously passed the automated testing phase.

   - It _is_ possible to follow the history sequentially.
   - It _is_ possible to pinpoint errors using _bisect_, but there might be
     plenty of false positives due to broken commits.
   - The history of each developer is **not** preserved, as commits will likely
     need to be recreated.

4. _The automated tests dictatorship:_ linearity is no longer the focus, and
   instead the aim is for **every** commit to pass the automated testing phase.
   The developer must guarantee each commit being proposed passes the available
   tests, and that there are no merge conflicts. Afraid to be called an
   imbecile, the developer makes all the changes they need to at once and runs
   the tests before submitting a single commit, which could've easily been the
   result of a _squash,_ like in the situation described in item 2.

   - It _is_ possible to follow the history sequentially, **but** there'll
     likely be code bombs.
   - It _is_ relatively easy to find errors using _bisect,_ **but** they end up
     hidden in big diffs.
   - The history of each developer is _scary, but preserved._

Right now, I'm leaning towards situation number 3, thinking it's the lesser of
all evils.
