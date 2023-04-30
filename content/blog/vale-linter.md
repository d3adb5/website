---
draft: false
date: 2023-02-07

title: Trying out Vale as a prose linter
subtitle: Let's see how far we're going to take this!

toc: false
---

I have recently discovered a linting tool for prose called [Vale][vale]. The
way I discovered it was by going through [Stakater][stakater]'s public
repositories on GitHub. More specifically the [stakater/vocabulary][vocabrepo]
repository, which contains a [Vale vocabulary][doc-vocab] for Vale's spell
checker not to yell at them for using Kubernetes resource names in prose.

While I'm not a huge fan of tools that judge my writing, I do feel there are
some recurrent typos I could eliminate without need for a code review prior to
merging a new article to this website. And so I have decided to try out Vale
when I'm writing new pages and blog posts like this one. As a bonus that comes
with my Vale configuration, I get information on text readability, among other
things.

Currently, my Vale configuration is as follows:

```ini
StylesPath = .local/share/vale/styles
MinAlertLevel = suggestion

Packages = proselint, alex, Readability

[*{.md,.markdown}]
BasedOnStyles = Vale, proselint, alex, Readability
```

Despite the amount of jargon in these pages, I've decided _not_ to start a
vocabulary file like the aforementioned company. Instead I'll just comb through
the diagnostics [nvim-lint][nvim-lint] produces before creating a Git commit,
ignoring complaints about words I know to be correctly spelled, like _Stakater_
and _Neovim._ Only once it becomes annoying --- let's hope I never write about
the editor I use or about random companies --- will I consider setting up an
`accept.txt` file in my style directory.

[vale]: https://vale.sh
[stakater]: https://stakater.com
[vocabrepo]: https://github.com/stakater/vocabulary
[doc-vocab]: https://vale.sh/docs/topics/vocab/
[nvim-lint]: https://github.com/mfussenegger/nvim-lint

## Integrating it with Neovim

To integrate it with my editor, I use [nvim-lint][nvim-lint], which already
configures Vale to work with any given buffer, and all you have to do it
configure Vale itself as well as the autocommand that will trigger the linter
based on a list of events. This is what I'm currently using:

```lua
local lint = require 'lint'
-- ...
autocmd({ "TextChangedI", "TextChanged" }, {
  desc = "Attempt linting when changes were made to the text.",
  callback = function () lint.try_lint() end,
  group = "common"
})
```

And to enable Vale for files with the `markdown` filetype:

```lua
local lint = require 'lint'

lint.linters_by_ft = {
  markdown = {'vale'}
}
```

## Experience so far

I wish Vale would follow the LSP specification and provide things like code
actions. With the current setup, all my editor gives me are the diagnostics
that Vale generates, which are not entirely useful. For instance, if it finds a
word it doesn't know --- this could be a misspelling or a word that's not in
any configured vocabulary --- it'll ask you **"Did you really mean 'blah'?"**
and call it a day.

Not very helpful, but when you're combing through the diagnostic messages,
you'll be able to catch typos yourself. The work of spotting them is offloaded
to Vale, and you can focus on writing or editing. _This isn't representative of
Vale's capabilities,_ as it's much more powerful when fitting your prose to a
style guide. I just don't use one for my website.

If I ever write robust documentation for a project, and it could benefit from a
style guide like Microsoft's or Google's, I'll come back here to praise or
complain about Vale. For now, as a spell checker for _Neovim,_ it… works.
