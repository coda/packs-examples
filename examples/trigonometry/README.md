# Trigonometry Pack

This is one of the simplest possible packs, it just creates Coda wrappers for built-in
JavaScript formulas to expose them in Coda.

It defines a handful of formulas in `formulas.ts` which each take a numeric parameter and return a number.
The `execute` implementation, which is the substance of the formula, is very simple in these cases,
delegating to a built-in JavaScript `Math` function or performing a simple calculation.

As always, these formulas are bundled into a `manifest.ts` file to complete the pack definition.
