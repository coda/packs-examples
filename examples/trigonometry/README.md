# Trigonometry Pack

This is one of the simplest possible Packs, it just creates Coda wrappers for built-in
JavaScript formulas to expose them in Coda.

It defines a handful of formulas which each take a numeric parameter and return a number.
The `execute` implementation, which is the substance of the formula, is very simple in these cases,
delegating to a built-in JavaScript `Math` function or performing a simple calculation.

## Running the Tests

Run the test just for this Pack by using:

```bash
mocha --require ts-node/register examples/trigonometry/test/trigonometry_test.ts
```
