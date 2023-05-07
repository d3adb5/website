---
type: notes

draft: false
date: 2022-09-27

title: Kubernetes, the container orchestrator!
subtitle: Simple, yet much more complicated than it seems...

toc: true
---

I've worked with Kubernetes for a while now, and while the name made it seem a
little daunting at first, it's actually quite simple. In fact it's simple
enough I got Kubernetes certified recently! If I can do it, anyone can. This
page has a few notes on interesting Kubernetes tricks I've learned during my
time working with it.

## What is container orchestration?

It's unclear. Well, it's not unclear, but the words "container orchestration"
don't really mean anything. To summarize Kubernetes, it's an aggregate of
container runtimes operating on multiple machines --- which we call _nodes_ ---
that host containerized processes grouped together in what we refer to as
_Pods._ The two main roles Kubernetes plays are: 

- _Connecting everything on a network,_ meaning abstractions are put in place
  to make it easy for one container to talk to another;
- _Ensuring a desired state is reached,_ meaning guaranteeing that what should
  be running is running.

If you ever set up a few servers to run your own things, you probably know
computer networks can be a pain. To take control of the network you need to set
up firewall rules, configure DNS, deal with routing, and so on. The moment you
throw your applications into containers --- which you can consider prerequisite
knowledge here --- all of that is taken care of for you.

The second point is perhaps a little more abstract. Take it to mean Kubernetes
has _convergence mechanisms_ in place. It uses a key-value store called _etcd_
to store _resources_ that represent different things in the cluster. The
collection of these resources is referred to as the _cluster state._ Something
like "there should be an NGINX instance running" can be represented through a
resource.

## Anatomy of a Kubernetes resource

While there is a multitude of resources, every resource has at least 4 required
fields:

- `apiVersion`: The version of the Kubernetes API used to create the resource;
- `kind`: The type of the resource itself;
- `metadata`: Unique information about the resource;
- `spec`: The desired state of the resource, as it is specified.

A YAML file can be used to represent the resource. We call this a _manifest._
Here's an example manifest:

```yaml
apiVersion: v1       # This uses 'core' API group 'v1'.
kind: Pod            # This resource is a 'Pod'.
metadata:
  name: my-pod       # The Pod is called 'my-pod'.
  namespace: pods    # The Pod is in the 'pods' namespace.
spec:
  containers:        # List of containers in the Pod.
    - name: nginx    # This container is called 'nginx'.
      image: nginx   # It runs the 'nginx' image; ':latest' is implied.
```

## What Kubernetes can't do, at least OOTB

There's plenty that Kubernetes can do for you, but a lot of functionality is
simply not within the scope of the core project itself. For example, while
running services on a Kubernetes cluster one might want to know how much CPU,
memory, and disk are being used by Pods at any given time. This can be done
through metrics servers --- not something Kubernetes provides out of the box. A
few common things you might want:

- Want to _collect logs_ and store them somewhere? You're looking for a log
  shipper. The kubelet --- a component of Kubernetes that runs on every node
  --- will collect logs to disk, but it offers no configuration to have it
  shipped elsewhere. You can use something like [Promtail][promtail] in a
  `DaemonSet` to ship those logs to Loki, for example.

- Want to _monitor_ the applications running on your cluster? You're looking
  for a monitoring system. Try the [Prometheus Operator][prom-operator]. It
  contains a CRD --- custom resource definition --- called a ServiceMonitor
  that can be used to collect metrics from Pods.

- Do you need your services to _scale?_ Kubernetes does come with autoscaling
  capabilities through the HorizontalPodAutoscaler, but if you need something
  more complicated for whatever reason, perhaps based on events, look into
  [KEDA][keda].

[promtail]: https://grafana.com/docs/loki/latest/clients/promtail/
[prom-operator]: https://github.com/prometheus-operator/prometheus-operator
[keda]: https://keda.sh/

While Kubernetes itself is a very thorough project, it's not a silver bullet. A
lot of the functionality you might need is provided by things running on top of
Kubernetes, interfacing with the API in your stead. Get used to the idea and
familiarize yourself with the design patterns that have risen as a result.

## The operator pattern

This is perhaps the most prevalent pattern you'll see as you work with
different services deployed to Kubernetes clusters. Operators are programs that
make use of custom resources to manage other applications. Let's use an example
situation to see what kind of problem an operator might solve.

You're deploying a set of applications that make use of [Jaeger][jaeger] for
tracing. To set Jaeger itself up, you need a storage backend like Cassandra or
ElasticSearch, which will also have to be deployed --- hopefully decoupled from
Jaeger so these can all be scaled and made highly available --- and assuming
these are being created from scratch, here's what we need:

1. Jaeger will need a Deployment to control its replicas;
2. Jaeger will need a Service to expose the replicas to other containers;
3. Jaeger will probably need an Ingress to expose its Web UI;
4. Jaeger will probably need a ConfigMap for additional configuration;
5. Jaeger's storage backend will need all of the above, though likely use a
   StatefulSet.

To make many of the parameters for the resources listed above configurable, our
first instinct will probably be to create a [Helm][helm] chart. The resources
can be customized through the chart's values, and each time we need to deploy
this configuration, we'll use the chart. This is a valid approach, but may
become unmanageable over time. Instead, how about we use a resource called
`Jaeger` and have an application closely monitor the cluster, looking for
instances of that resource, and deploying what we need in-place?

```yaml
apiVersion: jaegertracing.io/v1
kind: Jaeger
metadata:
  name: greatest-jaeger-of-all-time
spec:
  storage:
    type: elasticsearch
    elasticsearch:
      nodeCount: 3
  # ...
```

Depending on the values in the `spec` field here, this hypothetical application
would deploy a different set of services, be it for storage, access, what have
you. This hypothetical application exists already and its name is [Jaeger
Operator][jaeger-operator]. This operator in particular doesn't deploy the
storage backend, at least as of the time of this writing. Do check the
documentation if you decide to use this operator.

The [Kubernetes documentation on the operator pattern][k8s-operator-docs] does
a much better job than me at explaining and exemplifying it.

[jaeger-operator]: https://github.com/jaegertracing/jaeger-operator/
[jaeger]: https://jaegertracing.io
[helm]: https://helm.sh
[k8s-operator-docs]: https://kubernetes.io/docs/concepts/extend-kubernetes/operator/
