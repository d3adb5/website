---
draft: false
date: 2023-06-25

title: How a keyboard layout ruined my daily life
subtitle: A cautionary tale of adhering to standards

tags: [ Rants, Technology, Linux, Keyboards ]

toc: true
---

I've been using computers for quite some time. Though BBSes, Usenet, IRC, and
many forums came way before I was even born --- I'm relatively young, come on
--- I was a netizen before the shift towards video conferencing and voice
calls. Consequently I grew up primarily using the keyboard to communicate with
people online. _Growing up in Brazil,_ I was raised using the _modern ABNT2
keyboard layout_ to type Portuguese, and that has sadly stuck with me.

The keyboard with which I am typing this article is a _US ANSI_ keyboard, **but
you can type on it as though it were ABNT2.** The reason for that lies in the
fact that instead of using the _US International_ layout, like most reasonable
people would, I changed the original layout's keymap just enough to resemble
ABNT2.

Looking back on it, it was a terrible idea. I'm confident I could switch to a
keyboard layout that actually resembles the labels on the keycaps, and that my
wife could use when she needs to use my computer, _but it's awkward and I don't
want to!_ What I have has been working fine for me for the better part of 2
years, and I'm not ready to jump ship yet, especially given it'll be a
hindrance at work and I'll have to climb up the learning curve.

## BR ABNT2, US ANSI, and me

Let's back up a bit and talk about the ABNT2 (ISO) and US ANSI layouts. That'll
help paint an accurate picture of what typing is like for most Brazilians, most
Americans, and then me. Below you'll find the ABNT2 layout, which has an ISO
Enter key --- i.e. a "vertical" one that looks like a boot.

It's a QWERTY layout that includes a _`Ç`_ key, as the grapheme is present in
Brazilian Portuguese, and moves diacritics around a bit due to their prominence
in our language. They're concentrated on the right side of the keyboard, and
are shown in the picture in red.

{{< figure
  src="/media/abnt2-keyboard.webp"
  link="/media/abnt2-keyboard.webp"
  caption="The keyboard layout used by the majority of Brazilians."
>}}

It is important to have these diacritics easily accessible so we can quickly
type words like _ímã, mérito, coração,_ and _àquela_ without having to move our
hands around too much. Try to imagine how these would be typed in the US ANSI
International keyboard layout.

I grew up typing on this type of keyboard, so I'm very used to it. And then I
was introduced to the world of mechanical keyboards, where boards use the US
layout for the most part, with ANSI being the most common variation for smaller
keyboards. Below is what a 60% US ANSI keyboard looks like. My current
keyboard, sized 65%, is not too different.

{{< figure
  src="/media/ansi-keyboard.webp"
  link="/media/ansi-keyboard.webp"
  caption="The keyboard layout used by the majority of Americans."
>}}

I wanted a nice mechanical keyboard, but also a small one, as no matter how
clean my desk is, it's always too small. My wife gifted me a TOFU65, a 65%
keyboard that uses the US ANSI layout. Its only real difference from the
standard 60% US ANSI layout is the inclusion of arrow keys and an extra column
of keys on the right side of the keyboard, giving us 4 extra keys.

On my keyboard, these extra keys are, top to bottom, _Home, PgUp, PgDown,_ and
_Del._

### Improvise, adapt, overcome

I guess I'm still at the "improvise" stage, since I'm bending the keyboard to
my will instead of adapting to a widely used international layout. Purely out
of laziness, might I add, as many people are more than comfortable typing
Portuguese and other languages with widespread diacritics on a US International
layout with dead keys.

This is when I show you what my typing experience looks like, after
superimposing the ABNT2 layout on top of the US ANSI one, making _Caps Lock_
into a dual function key providing both _Ctrl_ and _Esc_, and making _Tab_ a
dual function key providing both _Super / Win_ --- my XMonad modifier --- and
_Tab_ itself.

{{< figure
  src="/media/my-custom-layout.webp"
  link="/media/my-custom-layout.webp"
  caption="Sorry for the mixture of image resolutions, I did my best."
>}}

For those wondering about some missing symbols that are ever present in daily
conversation and important documents: _`/?|\`_ are all accessible through layer
3, activated by holding down the _Alt Gr_ key. This is not default behavior on
US ANSI, as far as I'm aware, at least not for _Z_ and _X,_ so it had to be
built into the layout as well.

This is essentially an entirely new ANSI keyboard layout for comfortably
migrating from ABNT2 to US ANSI, with added steroids in the form of additional
functionality. _It's not perfect, but it works well for me._

## Implementing a layout

Designing the keyboard layout itself is easy. The difficult part is actually
adding it to X11 --- we're avoiding Wayland and other operating systems --- but
what if we don't have to write the layout from scratch? The X.Org project has a
program called _xmodmap,_ which allows us to alter the _keycode_ to _keysym_
mapping that is performed by X11 in real time.

For a little bit of context, the keyboard sends _scancodes_ to the Linux
kernel, which translates them to _keycodes,_ and subsequently X11, through the
current layout's _keymap,_ translates them to _keysyms._ These are things like
`a`, `tilde`, `deadtilde`, etc. The keymap is what we make changes to in real
time through _xmodmap._

### The old fashioned way: xmodmap

You can find these instructions by looking up _"xmodmap"_ and going through the
first couple of results. Regardless, I'm going to place it here for reference.
The first thin you want to do is _dump the current map to a file:_

```bash
xmodmap -pke > current-keymap
```

The file the above command produces will have **a lot of lines,** most of which
are not going to be relevant to your use case. Use it to find the keys you want
to change through their current _keysyms._ Here are a few examples:

```text
keycode  20 = minus underscore minus underscore
keycode  21 = equal plus equal plus
keycode  22 = BackSpace BackSpace BackSpace BackSpace
```

Each token after the equals sign in the lines above corresponds to a _keysym,_
subsequently reachable through the keyboard _layer_ of the same index in the
line's order. I'm going to skip the technicalities here --- please forgive me,
keyboard enthusiasts and X11 connoisseurs --- and just say that _the first
three layers are really the relevant ones:_

1. The first layer is what you get with a simple key press.
2. The second layer is what you get when you press the key while holding down
   _Shift._
3. The third layer is what you get when you press the key while holding the
   compose key, which for ABNT2 is _Alt Gr._

So just change the lines you need to, **and delete everything else.** You can
then place the file somewhere like `~/.Xmodmap` (convention) and source it in
your X11 init script (`~/.xinitrc`):

```bash
#!/bin/sh

# ...
xmodmap ~/.Xmodmap
# ...

exec xmonad
```

### X Keyboard Extension (XKB)

I had some problems with _Fcitx4,_ an input management engine, mangling the
layers and somehow pushing me to layer 3 without pressing any modifiers.
Looking up known issues between _Fcitx_ and _xmodmap,_ I found out that the
latter is now considered an old fashioned, outdated way to modify keymaps.
Instead, we should be using the _X Keyboard Extension (XKB)._

XKB is a new way to define keyboard layouts, separating them into keycodes,
types, compatibility, geometry, symbols, and rules. You can find all of this
information in the necessary syntax through _xkbcomp,_ luckily, so one could
use this in a similar way to _xmodmap!_ Execute the following command to dump
the current layout information:

```bash
xkbcomp -xkb "$DISPLAY" -o current-layout.xkb
```

Just like with _xmodmap,_ you can discard most of the file and keep only what
is relevant to you. There are better guides to do this elsewhere on the
Internet, but at least with XKB you can use _`include`_ to essentially inherit
settings from other layouts. The following is what I ended up with, and it
should theoretically define a full keyboard layout:

```text
xkb_keymap {
  xkb_keycodes      { include "evdev+aliases(qwerty)" };
  xkb_types         { include "complete"              };
  xkb_compatibility { include "complete"              };
  xkb_geometry      { include "pc(pc105)"             };

  xkb_symbols {
    include "pc+us+inet(evdev)+level3(ralt_switch)"

    name[group1] = "Custom English (US)";

    override key <AE06> { [ 6,            dead_diaeresis ] };
    override key <AB10> { [ semicolon,    colon ] };
    override key <AD11> { [ dead_acute,   dead_grave,      degree ] };
    override key <AD12> { [ bracketleft,  braceleft,       guillemotleft ] };
    override key <BKSL> { [ bracketright, braceright,      guillemotright ] };
    override key <AC10> { [ ccedilla,     Ccedilla,        bar ] };
    override key <AC11> { [ dead_tilde,   dead_circumflex, backslash ] };
    override key <CAPS> { [ apostrophe,   quotedbl,        grave ] };

    override key <AD01> { type = "THREE_LEVEL", symbols[Group1] = [ q, Q, slash ] };
    override key <AD02> { type = "THREE_LEVEL", symbols[Group1] = [ w, W, question ] };
    override key <AC01> { type = "THREE_LEVEL", symbols[Group1] = [ a, A, colon ] };
    override key <AC02> { type = "THREE_LEVEL", symbols[Group1] = [ s, S, semicolon ] };
    override key <AB01> { type = "THREE_LEVEL", symbols[Group1] = [ z, Z, backslash ] };
    override key <AB02> { type = "THREE_LEVEL", symbols[Group1] = [ x, X, bar ] };
  };
};
```

For packaged X11 keyboard layouts, these blocks are defined in separate files
under `/usr/share/X11/xkb`, if you're curious about them. Place the above
configuration in a `~/.config/xkb/custom.xkb` file and you can load it onto the
display server in your `.xinitrc` with the following command:

```bash
xkbcomp ~/.config/xkb/custom.xkb "$DISPLAY"
```

And I thought that would've been the end of it, but...

### Then Fcitx5 came along

Researching into this, I found out that _Fcitx4_ is now in maintenance mode,
and _Fcitx5_ is ready for production use. "Perhaps this is going to solve all
of my problems," I thought. I was wrong, it created a new one: when rebuilding
device information or seemingly at random, _Fcitx5_ would revert the active
keymap to the one defined by the layout --- thereby forcing me to reapply the
one I made with _xkbcomp._

It seems it'll apply whatever the currently active layout uses as determined by
Fcitx' configuration, and no matter how much I looked into making it use what I
wrote, my one and only option seemed to be **to add my own layout to X11.**

## The Bazaar with Landmines

In [The Bazaar with Landmines (or How To Extend XKb the Right Way)][tbwl], Dani
Jozsef outlines and explains the shortcomings of combining the X Keyboard
Extension with the traditional style of package management conducted by most
GNU/Linux distributions. The summary is that because layouts are indexed in
aggregate files under `/usr/share/X11/xkb`, any changes made to them to add or
remove keyboard layouts will be overwritten by the next update to the package
that includes those files.

I'm currently using Arch Linux, where `evdev.xml` and company are packaged by
`xkeyboard-config`, so I could prevent updates to the files I'd need to change
by adding `xkeyboard-config` to the `IgnorePkg` list in `/etc/pacman.conf`.
Let's explore this avenue to see if it's worth it, and prepare for the future
with something of an install script.

[tbwl]: https://danijozsef.medium.com/the-bazaar-with-landmines-or-how-to-extend-xkb-the-right-way-b82de59a1f9a

### Adding a variant to the US layout

The first thing we need to do is pretty simple: take the file currently being
read by `xkbcomp`, extract its `xkb_symbols` block, add a variant name to it
--- meaning we change `xkb_symbols` to something like `xkb_symbols "abnt2"` ---
and append its new contents to the `/usr/share/X11/xkb/symbols/us` file.
Effectively, _this adds a new symbols variant to the US layout!_

But now we need to make sure that X11 knows about our new variant, which is
done by editing the following files:

- `/usr/share/X11/xkb/rules/evdev.xml`
- `/usr/share/X11/xkb/rules/base.xml`
- `/usr/share/X11/xkb/rules/evdev.lst`
- `/usr/share/X11/xkb/rules/base.lst`

For this I just followed in the footsteps of already established variants of
the same layout, such as the Cherokee one, and came up with the following XML
excerpt to place at the start of the variants list:

```xml
<variant>
  <configItem>
    <name>abnt2</name>
    <!-- ABNT2 mixture into US ANSI -->
    <shortDescription>abnt2</shortDescription>
    <description>ABNT2</description>
    <languageList>
      <iso639Id>pt</iso639Id>
    </languageList>
  </configItem>
</variant>
```

And in the case of the `.lst` files, it's a single line next to `! variant`:

```diff
  ! variant
+   abnt2           us: ABNT2
    chr             us: Cherokee
```

With these changes made, a restart of the X server made it possible to select
the variant with `setxkbmap -layout us -variant abnt2`, so I switched over to
it for my default layout through `localectl`. That had to be mirrored on the
Fcitx5 side, which was a whole ordeal given that Fcitx can't seem to list my
layouts anymore? _Maybe I did something wrong, but I'm not sure what._

### Automating for future reference

Finally, we need to create a script that installs the layout variant and adds
it to the files we changed, so we don't need to repeat this process manually.
It is really simple, and necessitates only `patch`, found in `base-devel`:

```bash
#!/bin/sh

workspace="$(mktemp -d)"
readonly workspace patchFile="$1" symbolsFile="$2"
trap -- "rm -rf -- '$workspace'" EXIT INT HUP

if [ "$(id -u)" != 0 ]; then
  echo "This script needs to be executed by root."
  exit 1
elif ! command -v patch >/dev/null 2>&1; then
  echo "This script requires the patch command."
  exit 2
fi

cp "$patchFile" "$symbolsFile" -t "$workspace"

tee -a /usr/share/X11/xkb/symbols/us < "$workspace/$(basename "$symbolsFile")"
cd /usr/share/X11/xkb/rules && patch -p1 < "$workspace/$(basename "$patchFile")"
```

And then all I needed to do was create the patch file. It's a simple `diff
-crB`, and after removing repeated changes, it looks something like:

```diff
diff -crB a/evdev.lst b/evdev.lst
*** a/evdev.lst	2023-06-30 15:44:42.663986335 -0700
--- b/evdev.lst	2023-06-30 15:44:06.860921275 -0700
***************
*** 292,297 ****
--- 292,298 ----
    custom          A user-defined custom Layout
  
  ! variant
+   abnt2           us: ABNT2
    chr             us: Cherokee
    haw             us: Hawaiian
    euro            us: English (US, euro on 5)
diff -crB a/evdev.xml b/evdev.xml
*** a/evdev.xml	2023-06-30 15:34:06.768592466 -0700
--- b/evdev.xml	2023-06-30 15:33:52.034551239 -0700
***************
*** 1358,1363 ****
--- 1358,1374 ----
        <variantList>
          <variant>
            <configItem>
+             <name>abnt2</name>
+             <!-- ABNT2 mixture into US ANSI -->
+             <shortDescription>abnt2</shortDescription>
+             <description>ABNT2</description>
+             <languageList>
+               <iso639Id>pt</iso639Id>
+             </languageList>
+           </configItem>
+         </variant>
+         <variant>
+           <configItem>
              <name>chr</name>
              <!-- Keyboard indicator for Cherokee layouts -->
              <shortDescription>chr</shortDescription>
```

And voilà, it's done. **Now let's hope Fcitx5 just works.**

#### 2023-08-26 Update: an Ansible playbook

Automation is great. Proper automation is better. Offloading effort to a tool
while declaring intent is the best, which is why in this day and age we write
declarative code and use convergence tools like Ansible. So forget the earlier
patch and script, and use this thing I just wrote, which you can run as many
times as you wish, to guarantee your variant of a given layout is present in
your system:

```yaml
---

- name: Install custom keyboard variant
  hosts: localhost
  become: yes

  vars:
    keyboard_layout: us
    keyboard_variant: abnt2
    keyboard_symbols_filepath: ./symbols.xkb
    x11_xkb_dir: /usr/share/X11/xkb

  tasks:
    - name: Read contents of symbols file
      ansible.builtin.set_fact:
        custom_symbols: "{{ lookup('file', keyboard_symbols_filepath) }}"

    - name: Ensure variant symbols is present
      ansible.builtin.blockinfile:
        path: "{{ x11_xkb_dir }}/symbols/{{ keyboard_layout }}"
        block: "{{ custom_symbols }}"
        marker: "// {mark} ANSIBLE MANAGED BLOCK - {{ keyboard_variant }}"
        state: present

    - name: Ensure variant is present in rules/base.lst and rules/evdev.lst
      ansible.builtin.lineinfile:
        path: "{{ item }}"
        line: "  {{ keyboard_variant }} {{ keyboard_layout }}: {{ keyboard_variant | upper }}"
        insertafter: "^! variant"
        state: present
      loop:
        - "{{ x11_xkb_dir }}/rules/evdev.lst"
        - "{{ x11_xkb_dir }}/rules/base.lst"

    - name: Check for existing variant entry in list
      community.general.xml:
        path: "{{ item }}"
        xpath: "/xkbConfigRegistry/layoutList/layout\
                /configItem[name='{{ keyboard_layout }}']/..\
                /variantList/variant/configItem[name='{{ keyboard_variant }}']"
        count: true
      register: xml_read
      loop:
        - "{{ x11_xkb_dir }}/rules/evdev.xml"
        - "{{ x11_xkb_dir }}/rules/base.xml"

    - name: Gather query results into dictionary
      ansible.builtin.set_fact:
        matches: "{{ xml_read.results | items2dict(key_name='item', value_name='count') }}"

    - name: Add variant to rules/base.xml and rules/evdev.xml
      when: matches[item] == 0
      community.general.xml:
        path: "{{ item }}"
        xpath: "/xkbConfigRegistry/layoutList/layout\
                /configItem[name='{{ keyboard_layout }}']/..\
                /variantList"
        pretty_print: true
        add_children:
          - variant:
              _:
                - configItem:
                    _:
                      - name: "{{ keyboard_variant }}"
                      - description: "{{ keyboard_variant | upper }}"
                      - languageList:
                          _:
                            - iso639Id: eng
        state: present
      loop:
        - "{{ x11_xkb_dir }}/rules/evdev.xml"
        - "{{ x11_xkb_dir }}/rules/base.xml"
```
