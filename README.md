# Coda Packs Examples

This repository provides example code and templates of Coda Packs built with Coda's Packs SDK:
https://github.com/kr-project/packs-sdk

## Prerequisites

Make sure you have `node`, `typescript`, and `npm` installed. TODO: flesh out recommended steps for installing these.

## One-time Setup

To be able to work with the examples in this repo, simply run `npm install` to install dependencies.

## Setting Up Your Own Project

When setting up your own project, install the `packs-sdk` npm packge and then run `coda init`
to set up a skeleton project based on the `template` example in this repo.

### Global Install (Quick)

The simplest way to get started with the SDK is to install it globally:

```bash
# Install the Coda Packs SDK globally on your system.
npm install --global https://e348902eb3982eb6f9593b2dcecfea5393b11d90:x-oauth-basic@github.com/kr-project/packs-sdk
```

### Single-Project Install (Recommended)

It's easier to manage dependencies and avoid version conflicts across projects
if you create an npm project for your pack and install the SDK and other dependencies
locally.

Create a new project directory if you haven't already and initialize your project:

```bash
# Install the Coda Packs SDK locally in your project.
npm install --save https://e348902eb3982eb6f9593b2dcecfea5393b11d90:x-oauth-basic@github.com/kr-project/packs-sdk
```

Update your path so you can easily use the `coda` commandline (CLI) that ships with the SDK:

```bash
export PATH=./node_modules/.bin:$PATH
```

(Globally-installed npm packages link CLI scripts into your system path. Locally installed packages
live in `./node_modules/.bin` and so are more easily used by updating your path.)

### Initialize an Empty Project

After you install in the SDK, run `coda init` to create the structure for a new project and install the necessary dependencies.

## Running Examples

Use the `coda` commandline tool to execute formulas directly. For example:

```bash
coda execute examples/trigonometry/manifest.ts Trig::Cosine 0
```

## Running Example Tests

Each of the accompanying examples include sample unittests. You can run them all with `npm test`.
Each example's readme explains how to run those tests individually.

## Building Examples: TODO

## Example Walkthroughs

Several example packs are provided in the `examples` directory. Each example has its
own readme with more details.

The [`template`](examples/template/README.md) pack is minimal boilerplate for creating
a new pack from scratch. The contents of this example are automatically copied to your
working directory if you run the `coda init` command, which is our recommended way to get
started, rather than manually copying this example.

The [`trigonometry`](examples/trigonometry/README.md) pack is one of the simplest meaningful
packs. It exposes formulas for common trigonometric functions like sine and cosine by wrapping
the existing JavaScript implementations of these functions. It's a good way to ease into
understanding the structure and execution of a pack.

The [`dictionary`](examples/dictionary/README.md) pack is a simple example that uses authentication
(an API key in this case) and make http requests to a third-party API service. It's a good
starting point for understanding how packs make http requests and use authentication,
and to try out the `coda auth` command for setting up authentication locally for development.

The [`github`](examples/github/README.md) pack is a relatively full-featured pack that uses
OAuth authentication to get user-specific data, and implements both an action formula
(a formula that can be connected to Coda button that updates a third-party service)
as well as a sync table.
