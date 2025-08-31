---
draft: false
date: 2025-08-31

title: "Talos Linux Homelab Pt. 2: Cluster and Argo CD Bootstrapping"
subtitle: No, I'm not going to duplicate the tutorial

tags: [ DevOps, Homelab, Kubernetes, Talos, Technology ]

toc: true
---

{{% dialog type="warning" %}}
I began writing this article about a year ago. Some of the content may be
outdated and I'm now hazy on the details. An attempt was made to keep it
accurate, but note that this was never meant to be a tutorial or a step-by-step
guide.
{{% /dialog %}}

This article is **not** meant as a replacement for the Talos documentation page
on [getting started with a cluster][talos-gs]. Instead, I'll just mention what
I've done and how easy it is to set it up, as well as the steps that I took to
set up Argo CD and an App of Apps repository. For reference, the repository I
ended up with is available on GitHub under [d3adb5/homelab][gh-homelab].

[talos-gs]: https://www.talos.dev/v1.9/introduction/getting-started/
[gh-homelab]: https://github.com/d3adb5/homelab

## Wrapping the CLI with a Makefile

Talos has a neat CLI called `talosctl`, but to perform operations on multiple
nodes at a time it is necessary to use the `--nodes` flag. If you want to
`apply-config` on any node, you have to also pass the configuration file, and
since there is no automatic detection of patch files, I took inspiration from
someone else's article on Talos and wrote a Makefile.

**Why a Makefile?** GNU Make is good for generating files, and that's precisely
what we'll be doing at the core of managing a Talos cluster. Talos luckily
implements IaC at the cluster management level. It does have state, don't get
me wrong, and sometimes you might want to `talosctl reset` a node, but for the
most part it is as simple as editing the machine configuration and applying it.

Let's start with targets in the output of `make help`:

```text
config                  Generate configuration files for all nodes
  config-control          Generate config files for controlplane nodes
  config-workers          Generate config files for worker nodes
apply                   Apply configuration files to all nodes
  apply-control-<node>    Apply config file to controlplane node
  apply-worker-<node>     Apply config file to worker node
upgrade                 Upgrade all nodes to desired installer image
  upgrade-control         Upgrade only controlplane nodes
  upgrade-workers         Upgrade only worker nodes
  upgrade-control-<node>  Upgrade a controlplane node
  upgrade-worker-<node>   Upgrade a worker node
help                    Display this help message
clean                   Remove generated configuration files
```

Essentially, this Makefile is used to _generate Talos machine configuration
files_ for each node in both the control and data planes. The machine
configuration files will end up under a directory called `generated`, which can
be reset with a simple `make clean`. Upon updating the source files, _new
machine configuration can be applied through `make apply`._ New nodes are added
by creating new files under `nodes/` with their name, followed by `.yaml`.

### Directories and file hierarchy

I'll briefly explain what the file hierarchy is like, and potentially copy this
from this article into my repository's `README.md` for future reference. Here
is the file tree I'm currently working with:

```text
├── Makefile
├── nodes
│   ├── controlplane
│   │   └── ottawa.yaml
│   └── workers
│       ├── edmonton.yaml
│       ├── halifax.yaml
│       ├── regina.yaml
│       └── victoria.yaml
├── patches
│   ├── allow-controlplane-workloads.yaml
│   ├── cluster-name.yaml
│   ├── longhorn-mount.yaml
│   ├── resolve-cluster-members.yaml
│   ├── unprivileged-user-ns-creation.yaml
│   └── use-calico-and-flannel-for-cni.yaml
├── schematic.yaml
└── secrets.yaml
```

#### secrets.yaml

This file is generated through `talosctl gen secrets`. It generates a "secret
bundle", as Talos calls it, which is a collection of credentials and
certificate keypairs that are used to secure the cluster. Through keeping this
separate we can reuse it without having to repeat it across multiple files.

#### schematic.yaml

This file is the _schematic_ for the node image. It is used to grab the right
Talos image to use, based on the extensions I wish to be included in it. You
can read more about system extensions on the [Talos documentation
page][talos-ext], and for reference this is what I'm using as of the time of
writing:

```yaml
customization:
  systemExtensions:
    officialExtensions:
      - siderolabs/i915-ucode
      - siderolabs/intel-ucode
      - siderolabs/iscsi-tools
      - siderolabs/gvisor
```

The way this file is used in the Makefile is as follows:

```make
FACTORY_URL      := https://factory.talos.dev/schematics
TALOS_VERSION    := 1.9.0
INSTALL_IMAGE_ID := $(shell curl -s --data-binary @schematic.yaml $(FACTORY_URL) | jq -r '.id')
INSTALL_IMAGE    := factory.talos.dev/installer/$(INSTALL_IMAGE_ID):v$(TALOS_VERSION)
```

{{%dialog type="info" %}}
This was later changed into a directory, to allow setting a default Talos image
schematic as well as node-specific schematics. This is because one of my nodes
has an NVIDIA GPU and should use related extensions.
{{% /dialog %}}

[talos-ext]: https://www.talos.dev/v1.3/talos-guides/configuration/system-extensions/

#### patches/

This is the most important directory. All the YAML files within will be passed
to `talosctl gen config` through the `--config-patch` flag, merging them with
each base node machine configuration file. An example of what that looks like:

```yaml
cluster:
  allowSchedulingOnControlPlanes: true
```

#### nodes/

These files are the base machine configuration that'll be applied to each
individual node. They are separated into `controlplane/` and `workers/`
directories, and are used to generate the final machine configuration files.
They can be as simple as just stating the node's network hostname and
identifying which disk Talos should be installed to. Here's an example:

```yaml
machine:
  network:
    hostname: regina.lan
  install:
    disk: /dev/nvme0n1
```

### Important operations

Since Talos implements something akin to stateless IaC, the only operations we
truly need to make easy through this Makefile --- other than, of course,
generating machine configuration --- is applying the configuration and
upgrading Talos itself. The latter is done through the `upgrade` command, and
is a separate operation from applying machine configuration or upgrading the
Kubernetes version in use.

It's sadly somewhat necessary to separate these by control and data plane,
since Talos operations often jump from where the cluster was bootstrapped,
rather than from the client machine to each of the target nodes individually.
Combine this with the fact my cluster has, currently, a single control plane
node and no external load balancer to route traffic to the appropriate
endpoint.

## Argo CD and App of Apps

With the cluster properly set up, bootstrapped, and everything, it's pretty
simple to set up Argo CD and the App of Apps for the first time, provided the
repository where the App of Apps will be is immediately accessible. *Since my
repository will contain more than just my Argo CD top level application,* I
created a directory called `argo/` where I placed most of the things Argo CD
will need to deploy service on the cluster.

The directory structure as of `2025-08-25` is as follows:

```text
├── argo                  # Argo CD-reachable manifests
│   ├── app-of-apps       # Top level Argo CD application as a Helm chart
│   ├── cert-manager      # cert-manager issuer configuration
│   ├── cluster-utils     # Miscellaneous manifests for cluster stuff
│   ├── ddclient          # ddclient-related secrets and release values
│   ├── democratic-csi    # democratic-csi application manifests + secrets
│   ├── keycloak          # Manifests used to deploy Keycloak (e.g. database)
│   ├── longhorn          # Additional manifests related to Longhorn
│   ├── media             # Extra resources for media services
│   ├── metallb           # Extra MetalLB manifests (e.g. IPAddressPool)
│   ├── monitoring        # Extra resources for the monitoring stack
│   ├── network-policies  # Network policies to apply across the cluster
│   └── olmv0             # Operator Lifecycle Manager v0 manifests
├── democratic-csi        # democratic-csi driver configuration (encrypted)
├── images                # Container image build files
├── talos                 # Talos-related configuration and Makefile
└── terraform             # Infrastructure as Code for, well, infrastructure
    ├── dns               # DNS records for multiple domains
    └── keycloak          # Keycloak configuration
```

Bootstrapping Argo CD is as simple as creating a Helm release using the values
defined in the `Application` manifest I wrote for it, and then the App of Apps
(top level application) chart itself can be released, and then consequently
managed through Argo CD. **It's like magic,** honestly, seeing all the
resources pop up in the Argo CD UI.

{{% dialog type="warning" %}}
**WARNING:** The network policies created through enabling network policies for
the official Argo CD Helm chart are **NOT** sufficient. You will need to create
additional policies allowing traffic from Argo CD's server, repo-server and
application controller pods to reach Redis (Redis HA HAProxy if you have
enabled high availability).
{{% /dialog %}}

## Container Network Interface

When I first wrote this and up until some time ago, I was using "Canal", or
Calico (for policies) and Flannel (for networking), as my CNI. This was to keep
things as simple as possible while enabling network policies. However, as part
of troubleshooting an issue with Argo CD --- that I later discovered was due to
network policies being too restrictive --- I switched to full-on Calico.

This is how that was done:

```text
# talos/patches/use-calico-for-cni.yaml
cluster:
  network:
    cni:
      name: custom
      urls:
        - https://raw.githubusercontent.com/projectcalico/calico/v3.30.2/manifests/operator-crds.yaml
        - https://raw.githubusercontent.com/projectcalico/calico/v3.30.2/manifests/tigera-operator.yaml
```

This adds manifests for Talos to install the Tigera Operator, which will be
responsible for bringing up Calico itself with our help:

```sh
curl -O -L https://raw.githubusercontent.com/projectcalico/calico/v3.30.2/manifests/custom-resources.yaml
nvim custom-resources.yaml # Edit to your liking!
kubectl apply -f custom-resources.yaml
```

This was taken from the [Calico installation docs][calico-install] for
on-premises deployments.

*There must be a better way to do this* that doesn't involve manual steps or
uploading manifests elsewhere that we'd then depend on. Maybe Calico could be
installed through Argo CD, but I don't like the idea of having the CNI
installed by a service already running on the cluster and virtually dependant
on it.

[calico-install]: https://docs.tigera.io/calico/latest/getting-started/kubernetes/self-managed-onprem/onpremises
