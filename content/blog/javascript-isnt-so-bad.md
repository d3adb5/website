---
draft: false
date: 2023-07-03

title: Was I wrong about JavaScript?
subtitle: It's clear we're not getting rid of it anytime soon

tags: [ Opinions, Web, JavaScript, Technology ]

toc: false
---

JavaScript was first introduced 27 years ago, initially as _LiveScript,_ in a
beta version of Netscape, and later as _JavaScript,_ presumably as a marketing
ploy to capitalize on the rising popularity of _Java._ Its goal was to make it
so webpages wouldn't be static paintings users scrolled through, but rather
interactive experiences that could react to user input.

This was a noble pursuit in many ways. **We're talking about 1995** here, when
the Web was so young CSS hadn't even been implemented yet --- the first version
of CSS was implemented in 1996! In fact, if like me you were thinking "there
was already user interactivity in HTML through Web forms", you'd be wrong:
official support for the `<form>` and `<input>` tags was only added to HTML in
November 1995 --- in version 2.0 of the HTML standard --- _two months after
LiveScript,_ and just a month before its rename and official stable release.

You can catch a glimpse of what it was like to browse the Web in those days by
visiting [theoldnet.com][theoldnet], a website dedicated to preserving early
Internet surfing. You can take a look at [Geocities][geocities] here. Check out
the page source. Have you ever used the `<dd>` or `<dt>` tags? Remember `<b>`
and being told by everyone to use `<strong>` instead? Perhaps you've used
`<area>` before? **I sure haven't.**

It was easy for me to judge JavaScript for slowing down my browsing experience,
forcing me to wait for a page to load before I could even read it, and for
making my browser use more memory than it realistically needed. HTML and CSS
were already pretty solidified and featureful by the time I was surfing the
Web. _JavaScript is a product of its time, and evolved due to both necessity
and stubbornness._

[theoldnet]: http://theoldnet.com
[geocities]: http://theoldnet.com/get?url=geocities.com&year=1995&scripts=false&decode=false

## Main gripes and prejudice

The HTML and CSS standards evolve more slowly than JavaScript's. It's not like
the JavaScript language itself is evolving rapidly to compensate for the other
two's turtle-like pace, far from it: because JavaScript was designed to closely
resemble and mimic general purpose programming languages, unlike HTML and CSS,
it was often _the only way to achieve certain behaviours._ Consequently, Web
developers focused on it and likely had deeper knowledge of it than the other
two.

_Want to make a button toggle some paragraph on the screen?_

You can use the `<details>` tag, introduced in HTML5, with references in Stack
Overflow _dating back to 2011._ Careful, though, because **Firefox didn't start
supporting it until 2016,** experimentally at first, then officially two months
later. The HTML spec ensures browsers will let you toggle the paragraph
element.

```html
<details>
  <summary>Click me</summary>
  <p>Paragraph to toggle</p>
</details>
```

Alternatively, if the above option is not semantically correct for your use
case, you may want to use a little CSS trick: create a hidden checkbox input, a
label for it, and place your paragraph somewhere you can select it with CSS.

```html
<input type="checkbox" id="toggle"/>
<label for="toggle">Click me</label>
<p>I'm going to be hidden by default, watch this!</p>

<style type="text/css">
  /* Hide the checkbox from the user */
  input#toggle { display: none; }

  /* Hide the paragraph unless the checkbox is checked */
  input#toggle ~ p         { display: none;  }
  input#toggle:checked ~ p { display: block; }
</style>
```

It's quite a hack, but it works and I'm even using it in this website. The
`:checked` pseudo-class and the general sibling combinator (`~`) were supported
since around 2006, but the `<label>` tag wasn't widely supported until _roughly
2010._

However, **in 2006 you could already do this with JavaScript:**

```html
<input type="button" onclick="toggleFunction()" value="Click me"/>
<p id="paragraph">I can be toggled, watch this!</p>

<script type="text/javascript">
  window.onload = function() {
    document.getElementById("paragraph").style.display = "none";
  }

  function toggleFunction() {
    var x = document.getElementById("paragraph");
    if (x.style.display == "none") {
      x.style.display = "block";
    } else {
      x.style.display = "none";
    }
  }
</script>
```

It's no surprise that JavaScript is used for what is known as _polyfills,_ or
_shims:_ code that implements a feature for a browser that supports JavaScript,
but not the feature itself. Given people don't really update their software or
their machines as often as we wish they would, polyfills will probably be
around forever.

This practice gives birth to the attitude "if it can be done with JavaScript,
why bother with HTML and CSS?" and the belief that JavaScript is the only
language you need to know to be a Web developer. And then, when animations,
transitions, toggles, scrollovers, and all other interactive elements are
implemented with JavaScript, _it's no wonder the Web is slow and bloated._

And so I became prejudiced against JavaScript. I've criticized people for not
being able to use words to convey some of their ideas, and I've criticized Web
developers for not being able to use plain HTML and CSS for their pages,
forcing JavaScript down my throat. _"If your page isn't functional when
JavaScript is disabled, perhaps your page isn't worth visiting at all,"_ I
would arrogantly say.

## Change of mind, change of heart

A new JavaScript framework every Tuesday, a new popular library every couple of
months, all of them promising to make your life easier, and then everybody
bashing on poor _jQuery_ for being outdated. My opinion didn't change, but how
could it if I wouldn't even try looking at _Angular_ or _React,_ which a couple
classmates raved about?

It was only when I was put to work on a project that required [React][react]
that I had no choice but to learn it. No, I didn't like it, but I had to admit
that it was relatively painless to create dynamic interfaces, especially when
components were already available for me to use. Heck, I even watched a video
on SolidJS and for a couple hours was determined to use it for a page on this
website.

**I'm still not a fan of JavaScript,** and will attempt to use it sparingly.
_However, I'm no longer a hater:_ Web technologies are evolving and I don't
want to be left behind. Some of it is actually really cool, and I'm excited to
see what the future holds. I highly dislike the fact that developers push the
Web as the convergence point for all platforms, but given all the competing
standards and technologies, it's an understandable position and one we have to
embrace for the time being.

Did you know there's [a WebAssembly port of FFmpeg?][ffmpeg-wasm] Isn't that
crazy?!

[react]: https://reactjs.org
[ffmpeg-wasm]: https://ffmpegwasm.netlify.app/
