+++
draft = false
date  = 2022-10-27

title    = "On excessive templating with Helm"
subtitle = '{{ merge .isThis.perhaps (dict "a" $bit) | include "too much?" }}'

toc = false
+++

I've mentioned in other blogposts that I've been involved in a project making
extensive use of Helm. It is known by some as the Kubernetes package manager,
so you'll naturally use it as you deploy applications to your cluster. Other
than release management, its main advantage is generating resources based on
user configurable _values._ Conditionals are a direct evolution of that, and
loops come into play as need be. But it doesn't stop there.

It would be a little boring if it did, especially since there's repetition that
can be easily eliminated through the use of partial templates. _However, this
is a bit of a slippery slope._ Developers, mainly, are tempted to use partials
to emulate functions. I myself call them pseudo-functions, and have been
implementing algorithms with them.

In this blogpost, I hope to convince you templating can quickly become
excessive, and that you'll have an easier time if you keep it simple, adapting
your charts as the situation calls for it. How? I'll just show you.

## No templating at all

We're writing a chart for an application. A good place to start is to visualize
a deployment of it, with all the resources we need. Let's write the manifest
for a Service, since we need to expose ports on the application we're
deploying.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-beautiful-service
spec:
  type: ClusterIP
  selector:
    app: my-beautiful-app
  ports:
    - name: http
      port: 80
      targetPort: 8080
```

Okay, looks alright. We'll have to be careful when installing this, since the
namespace will depend on the namespace for the context we're currently in, or
whatever we use as the argument for the `--namespace` / `-n` flag. Okay, pros
and cons?

_Pros:_

- Very easy to read as a Kubernetes manifest.
- No templating here, no need to understand Go templates.
- You know what to expect from the output: exactly what you're reading.

One can argue those are all the same thing, huh? Time to list some cons.

_Cons:_

- The name of the resource doesn't change. We cannot deploy this application
  twice in the same namespace since there would be resource conflicts between
  the two releases --- we'd have to change the Service name for the second
  release.
- Every value here (e.g. ports, port numbers, type) is hardcoded. We cannot
  change them without editing the manifest, so every release would have the
  same exact characteristics.
- We cannot use this manifest as a base for other resources, and charts
  depending on ours wouldn't be able to customize it at all.
- The selector labels will have to be repeated across resources, to ensure
  we'll match the right pods.

In other words, this is not a manifest you would or should find in any Helm
chart. It's just a manifest, which you can use with `kubectl` commands like
`apply`, `create` and `delete`. Let's start parameterizing some of its values.

## Values thrown into the mix

The first change we'll make here is add some values, and prefix the name of our
resource with the name of the Helm release.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ .Release.Name }}-my-beautiful-service
spec:
  type: {{ .Values.service.type }}
  selector:
    app: {{ .Release.Name }}-my-beautiful-app
  ports:
    - name: http
      port: {{ .Values.service.port }}
      targetPort: {{ .Values.service.targetPort }}
```

It starts to become interesting here! We can now deploy multiple releases of
our chart in a single namespace, since they're bound to have different release
names, and thus different Service resources. We can also customize our values
all around! _Assume the previously hardcoded values are now in the
`values.yaml` file of our chart._

_Pros:_

- Still easy to look at as a Kubernetes manifest, with just a bit of templating
  on top.
- The use of `.Release.Name` means we can deploy multiple releases to a single
  namespace.
- We can customize the values of our Service through value overrides. Our
  releases can now differ significantly.

_Cons:_

- We're not ensuring the Service name is valid. It must be a valid DNS label.
- Selector labels are still repeated across resources, even if parameterized.
- This might be unnecessary, but we cannot expose more ports if we wanted to.

There's an easy way to address these cons: partial templates. Let's move the
selector labels to a partial template in a `_helpers.tpl` file and also create
a partial template for a naming prefix. We'll give up on exposing multiple
ports for the time being.

## Partial templates come around

Let the following be our `_helpers.tpl` file:

```yaml
{{- define "app.fullname" -}}
  {{- if contains .Chart.Name .Release.Name }}
    {{- trunc 63 .Release.Name | trimSuffix "-" }}
  {{- else }}
    {{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" }}
  {{- end }}
{{- end -}}

{{- define "app.selectorLabels" -}}
app: {{ include "app.fullname" . }}
{{- end -}}
```

We have a partial template that creates a full name for our release, appending
the chart name to it if need be. We also have a partial template for the
selector labels that will be used throughout the chart, which we can `{{
include }}` where necessary, and then edit the template instead of editing each
resource template.

Our new resource manifest template:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ include "app.fullname" . }}-service
spec:
  type: {{ .Values.service.type }}
  selector:
    {{- include "app.selectorLabels" . | nindent 4 }}
  ports:
    - name: http
      port: {{ .Values.service.port }}
      targetPort: {{ .Values.service.targetPort }}
```

_Pros:_

- The name of our Service is now almost always valid, given its prefix is
  truncated to 63 characters. That is the limit for a DNS label according to
  RFC 1123. To ensure it'll always be valid, we should truncate it once more.
- Selector labels are now defined in a single place, where we can edit them and
  have those changes apply to all resources referencing them. This adds
  guarantees that they'll be the same across resources.
- All the other pros from the previous section still apply.

_Cons:_

- We have added indirection, and forced the reader to take a minute to
  comprehend the template language.
- Partial templates we depend on are defined in another file, where it's harder
  to understand scope.
- We still can't expose multiple ports.

No way around those first two, they're a tradeoff we have to make. The last
one, however...

## Our Service gains templating powers

The reader is already familiarizing themselves with the partial templates,
right? Might as well throw some more templating in, to achieve the flexibility
we want. Or so one would think. _What about you? Do you think this is already
excessive?_

```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ include "app.fullname" . }}-service
spec:
  type: {{ .Values.service.type }}
  selector:
    {{- include "app.selectorLabels" . | nindent 4 }}
  ports:
    {{- range .Values.service.ports }}
    - {{- toYaml . | nindent 6 }}
    {{- end }}
```

Now we just add the ports as a list of objects in our values or value overrides
and the manifest will be rendered with them. Magical, right? We are giving up
the ability to template within them, but that's not really necessary for
Service ports, I would say.

_Pros:_

- We can now expose multiple ports, and customize them all around.
- All the other pros from the previous sections still apply. Or do they?

_Cons:_

- The previous cons are still here, save for being able to expose multiple
  ports.
- It's now more difficult to look at this and visualize the YAML that will be
  generated.

## Partial templates at the start of everything

This is such a simple and common pattern to reproduce, so why not just make it
a partial template and use it?

```yaml
{{- define "app.service" -}}
apiVersion: v1
kind: Service
metadata:
  name: {{ include "app.fullname" . }}-service
spec:
  type: {{ .Values.service.type }}
  selector:
    {{- include "app.selectorLabels" . | nindent 4 }}
  ports:
    {{- range .Values.service.ports }}
    - {{- toYaml . | nindent 6 }}
    {{- end }}
{{- end -}}
```

There's obviously more to a Service's spec and metadata than we are using.
Let's add some more flare to it, for the sake of example.

```yaml
{{- define "app.service" -}}
apiVersion: v1
kind: Service
metadata:
  annotations:
    {{- toYaml .Values.service.annotations | nindent 4 }}
  labels:
    {{- include "app.labels" . | nindent 4 }}
    {{- with .Values.service.labels }}
      {{- toYaml . | nindent 4 }}
    {{- end }}
  name: {{ include "app.fullname" . }}-service
spec:
  {{- with .Values.service.externalTrafficPolicy }}
  externalTrafficPolicy: {{ . }}
  {{- end }}

  {{- with .Values.service.internalTrafficPolicy }}
  internalTrafficPolicy: {{ . }}
  {{- end }}

  type: {{ .Values.service.type }}
  selector:
    {{- include "app.selectorLabels" . | nindent 4 }}
  ports:
    {{- range .Values.service.ports }}
    - {{- toYaml . | nindent 6 }}
    {{- end }}
{{- end -}}
```

This is just a start. But hey, this is how easy it is to define our Service
now, and it applies to every chart using our base template:

```yaml
{{ include "app.service" . }}
```

In my opinion, this is where madness has been reached. I won't bother writing
lists of pros and cons for this one.
