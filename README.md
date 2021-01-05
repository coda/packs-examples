# Coda Packs Examples

This repository provides example code and templates of Coda Packs built with Coda's Packs SDK:
https://github.com/kr-project/packs-sdk

## Prerequisites

Make sure you have `node`, `typescript`, and `npm` installed.

## One-time Setup

To be able to build the examples in this repo, simply run `npm install` to install dependencies.

When setting up your own project, you need only install the `coda-packs-sdk` npm packge,
which you can install globally or locally, as desired.

### Global Install (Quick)

The simplest way to get started with the SDK is to install it globally:

```bash
npm install --global https://266b5c97c3bef1359cc7094b4726e2da447538e0:x-oauth-basic@github.com/kr-project/packs-sdk#e79bbd196bf080b266f038ddd2bceb83b45e1270
```

### Single-Project Install (Recommended)

It's easier to manage dependencies and avoid version conflicts across projects
if you create an npm project for your pack and install the SDK and other dependencies
locally.

Create a new project directory if you haven't already and initialize your project:

```bash
# Initialize npm and follow prompts.
npm init
# Install the Coda Packs SDK locally in your project
npm install --save https://266b5c97c3bef1359cc7094b4726e2da447538e0:x-oauth-basic@github.com/kr-project/packs-sdk#e79bbd196bf080b266f038ddd2bceb83b45e1270
```

Update your path so you can easily use the `coda` commandline (CLI) that ships with the SDK:

```bash
export PATH=./node_modules/.bin:$PATH
```

(Globally-installed npm packages link CLI scripts into your system path. Locally installed packages
live in `./node_modules/.bin` and so are more easily used by updating your path.)

## Running Examples

Use the `coda` commandline tool to execute formulas directly. For example:

```bash
coda execute examples/trigonometry/manifest.ts Trig::Cosine 0
```

## Building Examples: TODO

## Starting a New Pack

The simplest way to get started with a new pack is to copy the code in **`examples/template/`**.
This template has our recommended file structure but the file content is empty or has placeholders
for you to fill in with your own code.

## Example Walkthroughs
