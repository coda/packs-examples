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

TODO: Implement `coda init`

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
