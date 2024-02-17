---
draft: false
date: 2024-02-16

title: Thoughts on GitLab CI
subtitle: Not terrible, but I'm not a fan

tags: [ GitLab, CI/CD, DevOps ]

toc: false
---

In 2013, the landing page for GitLab.com described GitLab as [_Open Source Git
Management Software_][gitlab-2013]. GitLab CI already existed --- it was first
created in 2012 --- but it was only years later that GitLab started to market
itself as a "DevOps platform", pushing products that span the entirety of the
software development lifecycle, from planning to deployment. So how good is
their pipeline offering?

GitLab CI is GitLab's built-in pipeline system. It's a CI/CD tool that allows
you to define workflows for building, testing, and deploying software from
GitLab by adding a `.gitlab-ci.yml` file to the root of the repository and
ensuring there is an available runner to pick the job up. These could be hosted
by GitLab or by the user, and they come in a variety of flavors.

The anatomy of a `.gitlab-ci.yml` file is as follows:

```yaml
stages:      # A list of stages the pipeline will follow. Jobs in the same
  - build    # stage run in parallel and have no implicit ordering.
  - test     #
  - deploy   # These can be arbitrary, and implicitly are build/test/deploy.

job-name:
  stage: build
  image: alpine:latest      # Applicable to Docker and Kubernetes executors.
  script:                   # A list of commands to run, these will show up in
    - echo "Hello, World!"  # the job logs. Maybe that is why it's a list.
```

The `job-name` is the name of the job, and it will be added to the resulting
pipeline based on job rules and configured stages. _GitLab will interpret this
file every time one tries to trigger a pipeline execution,_ which for GitLab
means "creating a pipeline". Additionally, if the job name starts with a dot
(`.`), it will be ignored by the pipeline and treated as extra YAML data.

There is a lot more to GitLab CI, but this is the basic idea. You can read more
about it in the [official reference documentation][gitlab-ci-docs].

[gitlab-2013]: http://web.archive.org/web/20130403093627/http://www.gitlab.com/
[gitlab-ci-docs]: https://docs.gitlab.com/ee/ci/yaml/

## Composing pipelines

Something that GitHub Actions treats as a first-class citizen are reusable
pipelines, or pipeline "components". These components in GitHub Actions are
treated as black boxes, with behavior customizable only through predefined
inputs. This is unlike how GitLab CI handles pipeline composition, which
largely revolves around how the `.gitlab-ci.yml` file is interpreted.

Take for example the following pipeline, used to build Docker images with
Kaniko, inspecting them with Trivy afterward.

```yaml
stages:
  - build
  - inspect
  - push

build-image-with-kaniko:
  stage: build
  image:
    name: gcr.io/kaniko-project/executor:debug
    entrypoint: [""]
  script:
    - >-
      /kaniko/executor
        --context "${CI_PROJECT_DIR}"
        --dockerfile "${CI_PROJECT_DIR}/Dockerfile"
        --destination "${CI_REGISTRY_IMAGE}:${CI_COMMIT_REF_SLUG}"
        --no-push --tar-path=image.tar

inspect-with-trivy:
  stage: inspect
  image: aquasec/trivy:latest
  script:
    - trivy image.tar

push-with-crane:
  stage: push
  image:
    name: gcr.io/go-containerregistry/crane:debug
    entrypoint: [""]
  script:
    - 'crane push image.tar "${CI_REGISTRY_IMAGE}:${CI_COMMIT_REF_SLUG}"'
```

_Building a Docker image is only part of the CI process,_ we definitely want to
run some unit tests, scan the code using a SAST tool like SonarQube, and maybe
even perform some integration and end-to-end testing. However, the logic of
building, inspecting and pushing the image won't really change from one service
to another, so it makes sense to extract it into a reusable pipeline.

Let's place the above snippet in a file called `docker.yaml`, in a GitLab
project located at `cicd/pipelines`. The way to reuse it in our pipeline is to
`include` it in our project's `.gitlab-ci.yml` file:

```yaml
include:
  - project: 'cicd/pipelines'
    file: 'docker.yaml'
    ref: master

my-unit-tests:
  stage: test
  image: node:20
  script:
    - npm install
    - npm test
```

This isn't obvious, but the `my-unit-tests` job will cause this pipeline to
break. The reason for that is a little obscure: upon rendering this pipeline
definition, GitLab pretty much copies the included file in place of the include
statement, _which comes with the stages property,_ that in turn lacks the
`test` stage.

A solution? Declare stages in the current pipeline:

```yaml
stages:
  - test
  - build
  - push

include:
  - project: 'cicd/pipelines'
    file: 'docker.yaml'
    ref: master

my-unit-tests:
  stage: test
  image: node:20
  script:
    - npm install
    - npm test
```

_Whoops,_ we forgot to include the `inspect` stage. Adding that fixes the
pipeline and we get what we wanted, cumbersome as it may seem. If you have
other jobs and snippets you'd like to reuse, this will quickly get out of hand,
causing you to have to juggle whatever stages they define within, and that's if
they define stages within them.

It has become good practice to define specific stages in the reusable
pipelines, so they won't cause conflicts with other pipelines that define the
same stages: instead of `build`, `inspect`, and `push`, we could have
`docker-build`, `docker-inspect`, and `docker-push`. **Congratulations, you are
fighting the pipeline tool you picked.**

## Customizing jobs

Environment variables for the most part allow you to change the behavior of
your pipelines, reusable or not. Sometimes, however, you want to change one of
the job's `rules` or other properties. In those situations, you can just define
a job with the same name and having only the property you wish to overwrite:

```yaml
include:
  - project: 'cicd/pipelines'
    file: 'docker.yaml'
    ref: master

build-image-with-kaniko:
  rules:
    - if: $CI_COMMIT_TAG
```

Hang on, we have a job that inspects the image with Trivy, right? What if we...

```yaml
inspect-with-trivy:
  script:
    - echo "No inspection for you!"
```

Were you expecting this job to run before a deployment to production? **Too
bad, you cannot trust it to run what you wrote upstream.** This is a problem
that GitHub Actions doesn't have, as it doesn't allow you to overwrite parts of
the actions you're using.

Thus, if you define your deployment logic in a pipeline you're expecting
developers to include, that opens the door to a lot of potential problems. You
can't trust the pipeline to do what you expect it to do, it is merely a
suggestion. _There is, however, a janky way around this:_ create a project that
only you and some other trusted people have access to, and allow developers to
trigger downstream pipelines there.

_The catch?_ You now have to accept upstream artifacts, run all your checks
outside their CI, standardize everything you can so you don't run into
surprises, etc. You also essentially communicate that _you don't trust the
developers to write their own pipelines,_ which is a bad look.

## It doesn't have to be this way

GitLab of course is aware of how cumbersome this may be. There is a beta
feature that starts steering GitLab CI in the composable direction: CI/CD
Components. This approximates GitLab CI and GitHub Actions, but so far it still
works sort of the same way as the `include` statement.

You're still able to overwrite included jobs and everything else, but once
people start adopting this, it will be all the much easier to lock them down.
For now, I think your best bet is the Compliance Pipelines feature, exclusive
to GitLab Ultimate subscribers as of the time of writing.
