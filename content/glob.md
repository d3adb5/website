---
draft: false
date: 2025-10-27

title: Personal microblog without a character limit
subtitle: Stolen from a website belonging to someone I admire

navigation:
  index: 2
  right: false
  title: Glob

extensions:
  - mathjax

stylesheets:
  - microblog
---

Ponderances, ideas, cool things I found, plans I'll likely never execute, and
other things that don't quite fit elsewhere on the website nor warrant a full
article. It won't always be particularly profound or well-written. Refer to the
[website's introduction][index] for motivation.

[index]: {{< relref "_index.md" >}}

---

{{< microblog date="2025-12-15 - 00:05" >}}

After a year or two of a hate-hate relationship with Spotify --- which I'd
switched to to afford someone more convenience --- I have finally gone back to
self-hosting my own music library with [Navidrome][navidrome]. I tried using
[Lidarr][lidarr] for a little while, but its search feature has been broken
since a MusicBrainz API change a few months ago. To manage my music library and
properly tag files, I've gone back to using [Beets][beets], which I had used
years ago.

Upon discovering [Symfonium][symfonium] and [Supersonic][supersonic], I am now
pretty happy with my setup. I can continue rebuilding my old music library,
hosting it myself, and listening to music through my Sonos speakers.

[navidrome]: https://www.navidrome.org/
[lidarr]: https://lidarr.audio/
[beets]: https://beets.io/
[symfonium]: https://symfonium.app/
[supersonic]: https://github.com/dweymouth/supersonic

{{< /microblog >}}

{{< microblog date="2025-12-11 - 16:09" >}}

イツエの「海へ還る」より：

> おかえり、おかえり \
> こんなにも自由に君は泳げる\
> そんな事知らなかったでしょう

{{< /microblog >}}

{{< microblog date="2025-11-07 - 18:09" >}}

From _A Man for All Seasons,_ by Robert Bolt:

> Oh? And when the last law was down, and the Devil turned 'round on you, where
> would you hide, Roper, the laws all being flat? This country is planted thick
> with laws, from coast to coast, Man's laws, not God's! And if you cut them
> down --- and you're just the man to do it --- do you really think you could
> stand upright in the winds that would blow then? Yes, I'd give the Devil
> benefit of law, for my own safety's sake!
>
> --- Sir Thomas More

Believe it or not, I found this gem while watching [meeting #131][oggo-131] of
the (2nd session) 44th Canadian Parliament's Standing Committee on Government
Operations and Estimates (OGGO). You can read the [minutes of
proceedings][oggo-131-mins] if you prefer text. It led me to [this really nice
article][sutherland-rol] about the rule of law by the Sutherland Institute,
too, that I think is worth a read.

[The powerful scene this is from is on YouTube.][amas-devil]

[oggo-131]: https://parlvu.parl.gc.ca/Harmony/en/PowerBrowser/PowerBrowserV2?fk=12818324
[oggo-131-mins]: https://www.ourcommons.ca/documentviewer/en/44-1/OGGO/meeting-131/evidence
[sutherland-rol]: https://sutherlandinstitute.org/why-we-need-to-give-the-devil-the-benefit-of-law/
[amas-devil]: https://www.youtube.com/watch?v=WMqReTJkjjg

{{< /microblog >}}

{{< microblog date="2025-11-07 - 10:01" >}}

While looking for the lyrics to 優しい嘘 (Yasashii Uso) by 上原れな (Uehara
Rena), I ended up finding a [Smule][smule] page for it. On it, there were a few
[recordings of people singing the song][recordings] submitted years ago. These
are very sweet amateur renditions of the song, and I found myself smiling like
a parent listening to their children's school recital.

[This one might be my favorite.][wa2-rec]

[smule]: https://www.smule.com/
[recordings]: https://www.smule.com/song/uehara-rena-white-album-2-yasashii-uso-karaoke-lyrics/5985650_5985650/arrangement
[wa2-rec]: https://www.smule.com/recording/uehara-rena-white-album-2-yasashii-uso/1332711387_3874460253

{{< /microblog >}}

{{< microblog date="2025-10-27 - 11:11" >}}

I made it so I can enable MathJax on a per-page basis on this website. It's
really cool to be able to write mathematical notation. I used to use Pandoc to
convert Markdown with inlined LaTeX to PDF for notes and assignments back in
university, so this is a nice throwback to those days.

Look at it:

$$
\mathbbm{E}(X) = \sum_{x \in \mathcal{X}} x \cdot \mathbbm{P}(x)
\longrightarrow
\mathbbm{E}(f(X)) = \sum_{y \in f(\mathcal{X})} y \cdot \mathbbm{P}(y)
$$

Not that it'll get much meaningful use, but it's nice to have the option.

{{< /microblog >}}
