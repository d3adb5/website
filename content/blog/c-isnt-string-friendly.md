---
draft: false
date: 2023-05-11

title: Writing your program in C can make it slower
subtitle: Or rather, it can compell you to make it slower!

toc: false
---

If you asked me what I thought of programming about a decade ago, my _young,
inexperienced, zealot self_ would have likely told you everybody should be
programming in C, so that all programs could be really fast, and that
programmers who complained about the language were just too lazy to deal with
memory allocation and pointers. **How mistaken I was!**

I'm pretty sure I attributed every bit of slow software or transition to _lazy
Java programmers:_

> Here, I'm gonna press the right button on the remote and let's wait for the
> animation to be over. See how many seconds that took? That's the fault of
> Java and lazy programmers. If it had been written in C...
>
> --- Me, pointing to a smart TV interface

My views have naturally changed since then. The folly of youth can only last so
long, after all: making mistakes and finding alternative routes teaches you
more quickly than any other avenue. Haskell taught me how an elegant language
can still be [compiled into optimal programs,][haskell-profiling] and time
showed me optimization at an algorithmic and architectural level has much
greater an impact on performance.

What I with to allude to in this post, however, has **nothing to do with
compiler optimizations,** and only a little to do with algorithmic complexity.
Much is said about how C continues to be the go-to language for performance
sensitive applications, but I feel like not enough is said about the inherent
laziness of programmers making the language sometimes a poor choice.

[haskell-profiling]: https://book.realworldhaskell.org/read/profiling-and-optimization.html

## A concrete example of what I'm talking about

The example that led me to this realization is a niche, but frustrating one ---
personally frustrating, as I just submitted a 900+ lines patch to it ---
[stalonetray,][stalonetray] a standalone system tray for X11. Specifically how
it translates parameter values to enumerated values. That likely gives it away
to the C programmers reading this.

The following snippet was taken from [`src/settings.c`][snippet]:

{{< highlight c "linenos=inline,linenostart=147" >}}
if (!strcmp(str, "none"))
    **tgt = DOCKAPP_NONE;
else if (!strcmp(str, "simple"))
    **tgt = DOCKAPP_SIMPLE;
else if (!strcmp(str, "wmaker"))
    **tgt = DOCKAPP_WMAKER;
else {
    PARSING_ERROR("none, simple, or wmaker expected", str);
    return FAILURE;
}
{{< /highlight >}}

For the sake of those who for some reason can't easily read C, the above
snippet goes through the following steps:

1. If the string `str` is equal to `"none"`, set the value of `**tgt` to the
   value of `DOCKAPP_NONE`.
2. Otherwise, if the string `str` is equal to `"simple"`, set the value of
   `**tgt` to the value of `DOCKAPP_SIMPLE`.
3. Otherwise, if the string `str` is equal to `"wmaker"`, set the value of
   `**tgt` to the value of `DOCKAPP_WMAKER`.
4. Otherwise, print an error message and return `FAILURE`.

It is important to note that despite the presence of string literals, _C
strings are not first-class values in C._ They are pointers to the first
character of said string, and the string is said to end when a character with
the value of `0` (also written `'\0'`) is found. There is no simpler
implementation than this one in a programming language.

Because of that, _string comparison is really character subtraction:_ a naive
definition for the C standard library's _`strcmp`_ function --- its totally
creative name stands for string comparison --- is as follows:

```c
int strcmp(const char *a, const char *b)
{
    for(; *a && *b && *a == *b; a++, b++);
    return *a - *b;
}
```

A little cryptic? We do have an empty _`for`_ loop there, and make use of
pointer arithmetic. Here's an equivalent implementation, but with inline
comments explaining each step of our algorithm:

```c
int strcmp(const char *left, const char *right)
{
    // While the left and right strings are not over, and their first character
    // is the same...
    while ( *left != '\0' && *right != '\0' && *left == *right ) {
        // Discard their first characters in this function.
        left  = left  + 1; // left + 1 points to the next char in the string.
        right = right + 1; // right + 1 points to the next char in the string.
    }

    // Characters in C are just bytes, so we can subtract their numeric values
    // and implicitly cast the result to int. Return such a difference.
    return *left - *right;
}
```

This is a linear algorithm, with complexity _O(n)._ A comparison between equal
strings is the worst case scenario, as the function iterates both strings until
it finds two different characters or the end of either string.

So the chain of _`if`_ statements in the snippet I showed you isn't just ugly,
it's not the most efficient way to do what the code purports itself to do.
_Let's forget whether performance matters for this particular scenario,_ as
that isn't relevant at this time. Assuming there is a real chance of the number
of enumerations --- and consequently the chain of conditionals --- increasing,
the code starts to accumulate wasted CPU cycles. A hash table would be much
more efficient, *but would it read as well?*

[stalonetray]: https://github.com/kolbusa/stalonetray
[snippet]: https://github.com/kolbusa/stalonetray/blob/4e92d630c8fe701d55e0f4493d989310adea3663/src/settings.c#L147-L156

## The lazy programmer

_Programmers strive to be lazy._ Computer programming is a way to automate
otherwise tedious tasks: let the machine do the work we don't want to do
ourselves, as it can crunch numbers much faster than we can. It is only natural
for us to want to forget about how the underlying machine works, and focus on
declaring what we want to do **in the most concise way possible.**

This last sentence, combined with what has already been said, is the crux of my
argument: we seek efficiency in our code, but _more importantly we seek
efficiency in the use of our time and energy._ If we can achieve what we want
with fewer words, we'll hardly think twice about it. In the particular case of
the snippet I showed you, the programmer likely thought one or more of:

- Premature optimization is the root of all evil.
- There is no need for performance here, this parser runs only once.
- The tradeoff between performance and readability is not worth it.
- This is more maintainable than writing a hash table.
- Let's avoid reinventing the wheel or adding another dependency.

And so the chain of conditionals was born! **Hardly a cardinal sin.**

### But would it really be unmaintainable?

[This][uthash] is a simple generic hash table implementation called _uthash,_
which could've been added as a dependency to make the code more readable. Have
a read through the project's files. A specific `const char * -> int`
implementation wouldn't be too different from what you see there, except
perhaps for the appearance of fewer preprocessor macros.

Summarizing, the programmer wouldn't have a great time writing it, or reading
it in the future.

[uthash]: https://github.com/troydhanson/uthash/blob/master/src/uthash.h

### So what should we do?

I hate to say this, but _use a modern language if you can._ The C programming
language is here to stay, likely for a long time after Rust and Go become more
widespread. It's a great systems programming language, but if you're going to
use it, you already know what setbacks, if any, stand in your way. Compare the
stalonetray snippet to these naive, carelessly written snippets.

#### Python

Hash tables exist as dictionaries, a built-in data structure, with an easy to
read literal representation that resembles JSON.

```python
from enum import Enum

class DockAppMode(Enum):
  # ...

dockapp_mode_dict = {
  "none": DOCKAPP_NONE,
  "simple": DOCKAPP_SIMPLE,
  "wmaker": DOCKAPP_WMAKER
}

def parse_dockapp_mode(s):
  return dockapp_mode_dict[s]
```

#### Haskell

Hash tables exist as the `Map` type from `Data.Map`, but we have more modern
tools to do what we want. Here are a few possibilities, starting with a _derived
instance of the `Read` typeclass:_

```haskell
-- With this, just use 'None', 'Simple', or 'WMaker' for the strings!
data DockAppMode = None | Simple | WMaker deriving (Show, Read)
```

We can also take advantage of pattern matching and let the compiler figure out
how to optimize it for us. No need to compare strings ourselves with another
function, or write a chain of `if-then-else` statements:

```haskell
parseDockAppMode :: String -> Maybe DockAppMode
parseDockAppMode "none"   = Just None
parseDockAppMode "simple" = Just Simple
parseDockAppMode "wmaker" = Just WMaker
parseDockAppMode _        = Nothing
```

Finally, using a map:

```haskell
import Data.Map

_dockAppModeMap :: Map String DockAppMode
_dockAppModeMap = fromList [("none", None), ("simple", Simple), ("wmaker", WMaker)]

parseDockAppMode' :: String -> DockAppMode
parseDockAppMode' = (_dockAppModeMap !)
```

#### Java

Hash tables exist as the `HashMap` class, and strings are a first-class type:

```java
import java.util.HashMap;

class Example {
    enum DockAppMode {
        NONE, SIMPLE, WMAKER
    }

    private static final HashMap<String, DockAppMode> dockAppModeMap = new HashMap<String, DockAppMode>() {{
        put("none", DockAppMode.NONE);
        put("simple", DockAppMode.SIMPLE);
        put("wmaker", DockAppMode.WMAKER);
    }};

    public DockAppMode parseDockAppMode(String s) {
        return dockAppModeMap.get(s);
    }
}
```

I am not writing any more than that.

#### Rust

The language some claim will become the new C. While there is no syntactic
sugar for hash tables, the standard library has [a `HashMap`
collection][rust-hashmap] we can use, and like Haskell it also offers [pattern
matching.][rust-patterns] I can't even pretend to know Rust, and my silly
attempts at compiling something for this were rejected by Rust's compiler.

[rust-hashmap]: https://doc.rust-lang.org/book/ch08-03-hash-maps.html
[rust-patterns]: https://doc.rust-lang.org/book/ch18-03-pattern-syntax.html
