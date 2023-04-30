---
draft: false
date: 2022-10-15

title: Prometheus and metrics-based monitoring
subtitle: The popular metrics-based monitoring and alerting stack

toc: false
---

Prometheus is an incredibly (the most?) popular tool for monitoring and
alerting, especially in the cloud-native world. It aids in fetching, storing,
and querying metrics from a variety of sources, and can be used to trigger
alerts when certain conditions are met.

_Fancy words, what is it, really?_ You can imagine Prometheus as the annoying
little brother or cousing who periodically hits you with the same question, in
anticipation for when you're going out, playing video games, or preparing food.
In this case, this annoying rugrat is asking "how much memory are you using?",
"how many requests are you getting?", "how many threads are you running?", and
so on.

It's not like Prometheus is configured to ask you all these things. Instead, it
is told it can find some information if it prods you on a given endpoint, and
whatever application receives the request to that endpoint is responsible for
telling Prometheus "this is the value of this metric, and this is the value of
that metric." _Sometimes we call this application an exporter,_ exposing metric
information in a format that Prometheus can scrape.

## What do we feed into Prometheus?

It's easier to explain things if we know what we're moving around to begin
with. Remember, _Prometheus is the one who asks (usually),_ and here we'll
cover what it is we respond with. Imagine we have a HTTP-capable application
listening in on some port on some host, at endpoint `/metrics`. Prometheus goes
to `GET` that endpoint, and we respond with:

```promql
requests_received 15
```

Now what does that mean? We're letting Prometheus know of a metric called
`requests_received`, and stating that the value of `requests_received` for this
sample is 15. Note that we're calling it a _sample_ because Prometheus will be
querying this endpoint periodically.

_But what if we want more information on these requests?_ Say, the IP address
they're coming from. We could identify them when producing this text format:

```promql
requests_received { from = "192.168.0.1" } 12
requests_received { from = "192.168.0.7" } 3
```

Now `requests_received` has overall value 15 in this sample, if you add up the
labeled lines, and if we query Prometheus through its Web UI or through
Grafana, PagerDuty, etc., we can filter for only the samples we care for.

There's little more to it than that. All parts of the text format other than
the metric name and value are optional, but here they are being used:

```promql
# This is a comment. I'm almost certain you can't use this in the middle of a
# line, and there's definitely no advantage to it. Oh, and empty lines are
# treated just the same: they're ignored.

# The last token in this line is the timestamp in miliseconds since the epoch.
metric_name { label_name = "label_value" } 123 1234567890

# HELP my_metric Example metric with no meaningful value.
# TYPE my_metric counter
my_metric 0
```

Prometheus will interpret comments preceding samples if they begin with `HELP`
or `TYPE`, following by the metric name, and between them they may come in any
particular order.

### The (optional?) metric types

There are four core metric types in Prometheus. For the time being, Prometheus
makes no use of the type information and just flattens everything it gets into
untyped time series. It's important to be aware of them, though! They are:

- Counter
- Gauge
- Histogram
- Summary

A _counter_ is an ever increasing value. In Calculus terms, it's the image of a
function of time that is monotonous and increasing. Number of requests served,
number of bytes moved around, number of errors encountered, those are all valid
examples of counters. Don't use this type for something that may decrease in
value over time; that would make it a gauge.

A _gauge_ is a value that can increase or decrease. Number of active threads,
number of active clients, memory and CPU usage, etc. If it can go up and down
in value over time, it's a gauge. Makes sense, right?

Okay, now it stops being intuitive. _Histograms_ and _summaries_ have weird
representations and it's not immediately clear what they're for. [The
Prometheus documentation][hist-sum-docs] does a far better job at explaining it
than I ever could, not that I understand it well.

For starters, both of these types generate multiple time series. Two that are
always generated are the ones with `_sum` and `_count` suffixes. Respectively,
they represent the sum of all observed values and the number of observations.

[hist-sum-docs]: https://prometheus.io/docs/practices/histograms/
