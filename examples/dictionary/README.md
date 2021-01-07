# Dictionary

This example returns definitions and other metadata for a given word, using Merriam-Webster's
Collegiate Dictionary API: https://dictionaryapi.com/. This example also demonstrates
authentication using an API key. You can register an API key for free for non-commercial use
with Merriam-Webster.

## Running the Example

Run `coda auth examples/dictionary/manifest.ts` and enter your API key.

Then run `coda execute examples/dictionary/manifest.ts Dictionary::Define coda --fetch` to look
up definitions for a word, in this case `coda`.

## Running the Tests

Run the unittests just for this pack by using:

```bash
mocha --require ts-node/register examples/dictionary/test/dictionary_test.ts
```

The unittests use a mock http fetcher and do not connect to a real API.

There is also an integration test, which makes real http requests to the API.
To run successfully, this test requires that you've set up an API key already
using `coda auth examples/dictionary/manifest.ts`.

```bash
mocha --require ts-node/register examples/dictionary/test/dictionary_integration.ts
```
