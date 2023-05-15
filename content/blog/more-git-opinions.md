---
draft: false
date: 2022-11-01

title: Updated Git opinions and lessons learned
subtitle: More unanswerable questions, and some personal answers

tags: [ Versioning, Git, Opinions, Technology ]

toc: false
---

This is yet another foray into Git matters. I must say that, albeit not by
much, my opinions have changed since [the last time I wrote down my thoughts on
Git.][rebase-article] While I'm still an advocate for linear history ---
provided it doesn't come at considerable expense --- I've come to revel in my
laziness, appreciate the power of a Git merge, and hold in contempt the
inability of suites like GitLab, GitHub, and BitBucket to handle conflict
resolution in merge commits.

The summary of updates to my views is as follows:

- Perhaps we shouldn't so vehemently avoid pushing to "special" branches like
  _master_ or _develop,_ or even _release/x.y.z_. One ought to follow rules as
  determined by the team's chosen workflow, but surely there are instances
  where going by the book is less appropriate than to do otherwise.

- Linear history has its advantages, but as long as the people working on the
  repository are frugal in their use of _git merge,_ it's not such a big
  detriment to the project's history. Sometimes it's easier to merge than to
  rebase and go back to ensure each commit is still functional, accurate, and
  purposeful.

- Following made-up rules in all cases, workflow or not, is _silly_ and
  _generally a waste of time and brainpower._ You should do what is sensible
  and comes at no cost to the team's productivity. If that means letting go of
  some pride for being the one who memorizes and follows mnemonics, then so be
  it. You're not competing for anyone's approval, unless you're playing office
  politics, in which case, you're probably not reading this.

These statements might come to some as inflammatory. Perhaps you conflate your
identity, self-respect, ego, or self-esteem with your knowledge of Git. It's
infantile to do so, but I'm not here to judge --- I've been guilty of that
myself. _Carry on if you disagree and don't care to be convinced otherwise._

For those who care, I'll explain the reasoning behind each bullet point in the
sections that follow.

[rebase-article]: {{< ref "git-rebase-vs-merge.md" >}}

## Why you might want to push to special branches

No, I'm not here to say you should start pushing to _master_ willy-nilly,
bypass the CI pipeline, forget about quality and status checks, and get those
commits to production now to skip all the bureaucracy. That's a terrible idea
and one for which I shall never be a proponent. For most simple workflows,
_master is the only special branch,_ so what am I talking about?

I'm talking about more complicated workflows, or when a developer royally
screws up the master branch --- work with Git for long enough and you'll see it
happen. Let's exemplify so we're not lost in the abstract.

A brief explanation of the legacy GitFlow workflow:

1. There are two long lived branches: _master_ and _develop_. The former is
   always in a deployable state, and the latter is the branch where all
   development, aside from hotfixes, is done.

2. Working on a new _feature?_ Create a feature branch off of _develop,_ work
   on it, and merge it back into _develop_ when it's ready. It's okay if there
   were new commits in _develop_ by the time you merged your feature, but
   beware of merge conflicts and bugs.

3. Your project is gearing up for a release. To avoid features in development
   from affecting it, you create a new release off of _develop,_ and perform
   any bug fixes and final adjustments you need to make on it. Once you're
   ready to actually perform the release, merge it into _master,_ tag it with a
   version number, and merge it into _develop_ to ensure the changes made for
   release are carried over to the next one.

4. **Oh no, something's wrong with production!** Quick, create a _hotfix_ off
   of the production branch --- _master_ --- and once you fixed the issue,
   merge it back there as well as _develop_. We wouldn't want our next release
   to be afflicted by the same bug, would we?

And that's it. It's a simple workflow, though it's fallen out of favor and is
now considered a legacy Git workflow. Let's come up with a scenario where one
or more developers messed things up a bit, so you can clearly see what I mean.

You have two developers, Alice and Bob. They are both working on a new feature,
which started off the same commit in _develop_. The repository has a single
YAML file, and each is tasked with changing a line in it. This is the situation
for their branches:

```text
* beafa18 feat: change second key in example.yaml         # Bob
| * cdbbf17 feat: change first key in example.yaml        # Alice
|/
*   8d43282 Merge branch 'feature/example' into develop   # develop
|\
| * 36b8ebf feat: add example.yaml
|/
* b9455e8 initial commit
```

They've both finished their work, as you can see, with a single commit. Their
work was independent of one another's, and it is very safe to merge the changes
together, except... _there's a merge conflict._ Turns out even though their
work was independent, they edited lines that were right next to one another,
and Git determined the changes were made to the same location.

Once again we'll avoid getting lost in the abstract. These are the versions of
`example.yaml` in _develop_, _feature/new-first_, and _feature/new-second_,
respectively and side by side:

```text
example:             example:                      example:
  first-key: foo       first-key: new-first-key      first-key: foo
  second-key: bar      second-key: bar               second-key: new-second-key
```

Okay, so what do we do? We just reviewed the changes made by each developer and
we want to merge them into _develop_ so that the next release has both of them.
Assume this wasn't such a trivial change and that each developer spent a good
amount of effort implementing and testing their changes, and that albeit
trivial to you, the way to resolve the conflict is not obvious to them.

You could merge Alice's changes into _develop,_ then ask Bob to resolve the
conflicts in his branch, be it by rebasing or merging, before you merge his
changes as well. **You push conflict resolution onto Bob.**

Alternatively, merge Bob's changes and then ask Alice to resolve the conflicts
herself before her merge takes place. This is analogous to the solution above.
**You push conflict resolution onto Alice.**

Maybe you'll do the conflict resolution yourself, but in either of their
branches instead of having the developers do it. You'll get to respect your
golden rule of not pushing to _master_ or _develop_ --- it's not possible to
make the second merge while resolving conflicts if you're depending on the
suite (GitLab, GitHub, etc.) --- and you'll end up with one of the following
histories.

_If you go the merge route,_ merging _develop_ into Bob's branch after merging
Alice's changes:

```text
*   9b8f4b3 Merge branch 'develop' into feature/new-second
|\
| *   0803738 Merge branch 'feature/new-first' into develop
| |\
| | * cdbbf17 feat: change first key in example.yaml
| |/
* / beafa18 feat: change second key in example.yaml
|/
*   8d43282 Merge branch 'feature/example' into develop
|\
| * 36b8ebf feat: add example.yaml
|/
* b9455e8 initial commit
```

The process you need to undergo:

1. Through the suite, merge Alice's pull request.
2. Fetch from the remote, checkout Bob's branch, and merge _develop_ into it.
3. Fix the merge conflicts locally.
4. Push the changes to Bob's branch on the remote.
5. Merge Bob's pull request.

_If you go the rebase route,_ rebasing Bob's branch on top of _develop_ after
merging Alice's changes:

```text
*   3858212 Merge branch 'feature/new-second' into develop
|\
| * 6e91ebd feat: change second key in example.yaml
|/
*   0803738 Merge branch 'feature/new-first' into develop
|\
| * cdbbf17 feat: change first key in example.yaml
|/
*   8d43282 Merge branch 'feature/example' into develop
|\
| * 36b8ebf feat: add example.yaml
|/
* b9455e8 initial commit
```

The process you need to undergo:

1. Through the suite, merge Alice's pull request.
2. Fetch from the remote, checkout Bob's branch, and rebase it on top of
   _develop_.
3. Fix the merge conflicts locally.
4. Force-push the changes to Bob's branch on the remote.
5. Merge Bob's pull request.

By rebasing, you achieved linear history in this example, but you're not really
trying to maintain that, and history might turn non-linear after a few merges
that have no conflicts, so **let's not preach linear history here.** It'll do
us no good, and in real world scenarios it's not always possible.

If we're not denying ourselves the possibility of fast forwarding or pushing to
_develop_, we can always merge the two branches together ourselves, resolving
the conflicts, and pushing the result to the remote. This is what it could look
like in the end:

```text
*   bfc381f Merge branches 'feature/new-first' and 'feature/new-second' into develop
|\
| * beafa18 feat: change second key in example.yaml
* | cdbbf17 feat: change first key in example.yaml
|/
*   8d43282 Merge branch 'feature/example' into develop
|\
| * 36b8ebf feat: add example.yaml
|/
* b9455e8 initial commit
```

The process you need to undergo:

1. Locally merge Alice and Bob's changes into _develop_.
2. Fix the merge conflicts as they appear.
3. Push the changes to _develop_ on the remote.

Here, we have a single merge commit joining two branches together --- so we're
not dealing with an octopus merge --- and we're not losing any information
regarding what work was done, where it started and where it ended. **Do you
want to revert the changes Bob made because it introduced bugs?** No problem,
_the revert command can be used for merge commits_ and you need only tell it
which path to the common ancestor contains the changes you want to revert.

I will not preach to you that this is the way things should be done. Advanced
Git users --- such as the maintainers of the Linux kernel --- use mailing lists
to select what they're going to merge into their local clones, and [are known
to perform octopus merges now and then.][cthulhu-merge] They don't even use any
Git suites to maintain the code or anything.

What I will tell you is that this doesn't go against the GitFlow workflow, it
just goes against suites. Don't get me wrong, they're useful, but they're not
deities to be worshipped. They're tools, and you can choose not to use them for
what they're not good at. GitLab isn't able to resolve conflicts for you, and
it won't allow you to resolve conflicts yourself when merging branches, but
_that doesn't mean it should never be done._

We'll come back to that point in a little bit. Let's talk about linear history.

[cthulhu-merge]: https://marc.info/?l=linux-kernel&m=139033182525831

## Linear history isn't always a good thing

Hopefully you read the previous section and you've kept an open mind to the
idea of merging branches instead of rebasing every single time. Git's ability
to merge changes together is one of the reasons it's so popular, after all. I
would like you to keep the following in mind as you debate the matter in your
own head:

> Tools like Git aim to make our lives easier, and collaborative work possible
> without major headaches. It is not without its flaws, and workflow rules are
> not set in stone. Sometimes more productivity may be reached if we bend the
> rules a little bit. _As with any other tool, proceed on a case-by-case
> basis._

That was a quote by me. I just typed it. Hopefully it caught your attention and
you read it from start to finish. Keep it in mind. It's important. Refer to the
following maxims if you need to, and not just while working with Git:

- There is no one true way to do things, and you should not be afraid to
  experiment or to be proven wrong.
- Goals are more important than rules. If the rules get in the way of our
  goals, we should be willing to change them.
- People are more often praised for achieving their goals than for following
  rules that effectively hindered them.

That said, _I am a law abiding citizen,_ and I quite like to follow the rules.
Okay, enough with the antics, onto linear history.

I was just put to work on a project that uses a variant of GitFlow. Looking at
the commit history gave me a headache, with all the merge commits strewn
around. The person I was put to work with, when told to keep up with _develop_,
merged it into his branch --- sometimes even multiple times --- instead of
rebasing onto it.

If you tried looking at the graph of commits, you'd see so many train tracks
running in parallel that it would be hard to tell where one branch started and
where it ended, especially when it had many other merge commits along its
history. _Could that have been avoided?_

**The short answer is no.** There are way too many projects being worked on at
the same time, and way too many developers working on them for us to be able to
ask each and every one of them to rebase their branches onto _develop_ every
time a merge occurs. It's just not practical. Let's embrace the mess instead.

Aside from the fact that it's not practical, it's also not necessary. What
would the team gain in productivity from having a linear commit history? People
are too busy gearing up for releases and working on new features to stop and
read the commit history. Hotfixes are performed as soon as they're necessary,
and rarely do developers need to point out what commit introduced the bug.

The bitter truth is Git isn't even considered much help for these guys during
their debugging process. And why should it, when the commit history is so messy
they can't tell what's going on? Even _bisect_ is of little help, because
they're fine with keeping broken commits in their branches if the latest
mergeable tree passes the status checks.

This is not a rant about incompetent people, about a broken tool, about
preserving history as it happened, or about the flaws of GitFlow. I once again
suggest you read [this article on avoiding the rebase command,][avoid-rebase]
but with everything I just said in mind.

[avoid-rebase]: https://medium.com/@fredrikmorken/why-you-should-stop-using-git-rebase-5552bee4fed1

## On golden rules

The last point I listed at the beginning of this article was:

> Following made-up rules in all cases, workflow or not, is _silly_ and
> _generally a waste of time and brainpower._ You should do what is sensible
> and comes at no cost to the team's productivity.

Another disclaimer: I'm not encouraging you to break the rules set forth by
your company, your boss, your team, or the customer. I am also not trying to
insult those who are able to remember and follow protocol. I bring you,
however, my criticism of some widely accepted rules that I believe are not so
golden after all.

- You should _never_ push to _master_ or other special branches.

I believe this was already addressed in the previous section. The gist of it is
there are situations where this might be desirable, especially if someone made
a mistake and merged or pushed something they shouldn't have. Project
maintainers, able to bypass the limitations imposed by the suite being used ---
if any --- can easily revert the changes and fix the problem before everybody
else is affected.

Even if you are altering history, the impact may be null or minimized if your
collaborators are moderately proficient with Git.

- You should _never_ force push to a branch.

What if I just rebased my branch onto another commit, but had previously pushed
it upstream?

- You should use forks instead of branching upstream.

If you want to ensure only the project maintainers have write access to the
upstream repository, then yes, you should use forks. It'll also allow your
developers to not worry about branch name clashing, so it seems there are some
benefits here after all, right? Well, _what good is a suite if you can't use it
to protect some of the branches?_

Additionally, when working solely with forks, not granting developers read
access to their coworkers' forks by default means discouraging collaboration,
as they'll have to request fiddling with permissions to cherry-pick or rebase
onto other people's work.

In the end, what is the problem with branching upstream? It'll make setting up
CI/CD pipelines easier. Besides, how often do people give the same name to
their branches? Naming conventions are born naturally, if not part of
onboarding.

- You should _never_ rebase public branches.

What is a public branch? Git makes no such distinction, so the proponent of
this "golden rule of rebasing" should be more specific. Often they're talking
about branches that other people are working on, but even that is not so
clearly defined. Some projects have a weird definition of what is "public",
too. If I pushed it even once, is it public?

This is just silly. I'll rephrase this supposed golden rule in a way that makes
more sense, but will drive the point of its silliness home:

> Don't mess with other people's work, you could create problems for them.

Does this platitude have any place being taught in Git courses? Of course you
shouldn't change the history of a branch that other people are working on. All
you have to teach, realistically, is that _the rebase command recreates commit
objects and consequently rewrites history._ If you can't teach that without
giving your pupils a rule of thumb, I'd say you're not doing a very good job,
and perhaps even insulting their intelligence.

- You should squash your PR's commits before merging it.

And rewrite history for no good reason? It is a good idea to have only commits
that pass the continuous integration checks, but imagine you're merging a pull
request with months worth of work. You'd end up with a code bomb for a commit
ending up in master. Talk about a useless output for the _blame_ command.

That's it, folks. Hope you enjoyed the rant.
