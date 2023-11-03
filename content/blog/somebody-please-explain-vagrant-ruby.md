---
draft: false
date: 2023-11-01

title: Why are Ruby blocks constructed like this?
subtitle: There is an obvious choice here, and it's not this one

tags: [ Programming, Ruby, Vagrant, DevOps ]

toc: false
---

I took up a position with a new company that involves the use of SaltStack.
Since I'd never used it before, I decided to try my hand at setting up a proof
of concept, and for that I wanted to use multiple machines. So I decided to use
Vagrant, another tool I'm not familiar with, to declaratively spin up a few
VMs.

This is what I first tried:

```ruby
machines = {
  master:   { box: "bento/ubuntu-22.04", master: true  },
  superior: { box: "bento/ubuntu-22.04", master: false },
  michigan: { box: "bento/ubuntu-22.04", master: false },
  ontario:  { box: "bento/ubuntu-22.04", master: false },
  erie:     { box: "bento/ubuntu-22.04", master: false },
  huron:    { box: "bento/ubuntu-22.04", master: false }
}

Vagrant.configure("2") do |config|
  for hostname, options in machines
    config.vm.define hostname do |machine|
      machine.vm.box = options[:box]
      machine.vm.hostname = hostname
      machine.vm.network "private_network", type: "dhcp"
      machine.vm.provision :salt, install_master: options[:master]
    end
  end
end
```

This magically worked, or so I thought, until many failed attempts at
automatically settings up DNS resolution for the machine's friendly names. I
noticed that the hostnames of my machines were sometimes all `huron` or all
`michigan` or something other than `master`, even though the name of the
machine on the Vagrant side was correct. Then it dawned on me: _it's using
whatever the last value of `options` in the loop was!_

This will become clearer with the simple examples I wrote to verify that this
was indeed what was happening. We'll start with a naive example that actually
works as expected:

```ruby
def simply_yield
  yield
end

simply_yield do
  for i in 1..10
    simply_yield do
      puts i
    end
  end
end
```

This prints the numbers 1 through 10, as expected, and not 10 ten times. This
makes sense, following the line of execution, assuming blocks are immediately
executed after the method to which they were passed, which they are in this
case. So it must be that the blocks passed to `config.vm.define` in Vagrant are
not!

That makes sense, as provisioners can be executed separately from bringing the
machines up. It stands to reason that the block themselves, as closures, are
stored in state somewhere, so they can then be invoked. Let's write an example
that does exactly that:

```ruby
$functions = []

def store_for_later(&block)
  $functions << block
end

for i in 1..10
  store_for_later do
    puts i
  end
end

$functions.each do |f|
  f.call
end
```

If you run this, you'll see that it prints 10 ten times. _We've found the
problem!_ In other words, the `i` in the block / closure that was stored for
future use is a reference to the loop variable being updated. This is weird,
because in theory the loop variable should be scoped to the loop block and die
when the loop ends.

Adding a `puts i` after the loop to verify just in case shows that it is still
accessible. Maybe Ruby suffers from the same problem as Python 2, where
variables in list comprehensions and loops leak into the outer scope.

Curious to see if Python 3 would be better behaved, I wrote the following bit
of code:

```python
functions = [(lambda: i) for i in range(10)]
# print(i) here yields a NameError, as expected
print([f() for f in functions])
```

This prints `[9, 9, 9, 9, 9, 9, 9, 9, 9, 9]`, which is not what I expected.
Other ways of defining the functions, such as using `def`, resulted in the same
problem. **Python suffers from the same problem!**

So I guess we should just use sane languages where state isn't a problem. Like
Haskell! The following _just works._

```haskell
functions :: [Int -> Int]
functions = [const i | i <- [1..10]]
-- can also be defined as map const [1..10]

main :: IO ()
main = mapM_ (print . ($ 0)) functions
```
