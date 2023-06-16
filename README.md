# Coda Packs Examples

This repository contains some example code and templates for Coda Packs built with [Coda's Packs SDK][docs_home]. These sample Packs assume you are developing locally using the Pack CLI, as they include multiple source files and tests.

A more complete set of examples, including those which are compatible with the Pack Studio web editor, are available in the [Samples page][docs_samples] of the documentation.

## Prerequisites

Make sure you have `node`, `typescript`, `npm` and `yarn` installed.

## Setup

To be able to work with the examples in this repo, simply run `yarn` to install dependencies.

## Running Examples

Use the `coda` command line tool to execute formulas directly. For example:

```bash
npx coda execute examples/trigonometry/pack.ts Cosine 0
```

See the guide [Using the command line interface][docs_cli] for more information on how to use the command line tool.

## Running Example Tests

Each of the accompanying examples include sample unit tests. You can run them all with `yarn test`.
Each example's readme explains how to run those tests individually.

There is also an integration test suite that runs tests that actually connect to the
APIs used in the example Packs. You can run this with `yarn run integration`. For this
to run successfully, you must have set up credentials for each Pack. See the readme
for each example for instructions on how to set up credentials, and how to
run that example's integration test individually.

## Example Walkthroughs

Several example Packs are provided in the `examples` directory. Each example has its
own readme with more details.

The `template` Pack is minimal boilerplate for creating
a new Pack from scratch. The contents of this example are automatically copied to your
working directory if you run the `coda init` command, which is our recommended way to get
started, rather than manually copying this example.

The [`trigonometry`](examples/trigonometry/README.md) Pack is one of the simplest meaningful
Packs. It exposes formulas for common trigonometric functions like sine and cosine by wrapping
the existing JavaScript implementations of these functions. It's a good way to ease into
understanding the structure and execution of a Pack.

The [`dictionary`](examples/dictionary/README.md) Pack is a simple example that uses authentication
(an API key in this case) and make http requests to a third-party API service. It's a good
starting point for understanding how Packs make http requests and use authentication,
and to try out the `coda auth` command for setting up authentication locally for development.

The [`github`](examples/github/README.md) Pack is a relatively full-featured Pack that uses
OAuth authentication to get user-specific data, and implements both an action formula
(a formula that can be connected to Coda button that updates a third-party service)
as well as a sync table.

The [`box`](examples/box/README.md) Pack is a small example that demonstrates how to create an action formula that uploads a file to Box. The primary purpose of this example is to demonstrate how to use the `form-data` NPM library to send `multipart/form-data` payloads with the Fetcher.


[docs_home]: https://coda.io/packs/build/latest/
[docs_samples]: https://coda.io/packs/build/latest/samples/
[docs_cli]: https://coda.io/packs/build/latest/guides/development/cli/
