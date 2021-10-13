import * as coda from "@codahq/packs-sdk";

export const pack = coda.newPack({version: "1.1"});

const DegreesParameter = coda.makeParameter({
  type: coda.ParameterType.Number,
  name: "angle",
  description: "An angle measured in degrees.",
});

const RadiansParameter = coda.makeParameter({
  type: coda.ParameterType.Number,
  name: "angle",
  description: "An angle measured in radians.",
});

pack.addFormula({
  resultType: coda.ValueType.Number,
  name: "Sine",
  description: "Returns the angle (in radians) whose sine is the given number",
  parameters: [RadiansParameter],
  examples: [{params: [0], result: 0}],
  execute: ([value]) => Math.sin(value),
});

pack.addFormula({
  resultType: coda.ValueType.Number,
  name: "Cosine",
  description: "Returns the cosine of a number (in radians).",
  parameters: [RadiansParameter],
  examples: [{params: [0], result: 1}],
  execute: ([value]) => Math.cos(value),
});

pack.addFormula({
  resultType: coda.ValueType.Number,
  name: "Tangent",
  description: "Returns the tangent of a number (in radians).",
  parameters: [RadiansParameter],
  examples: [{params: [0], result: 0}],
  execute: ([value]) => Math.tan(value),
});

pack.addFormula({
  resultType: coda.ValueType.Number,
  name: "ToRadians",
  description: "Converts degrees to radians.",
  parameters: [DegreesParameter],
  examples: [{params: [180], result: 3.14}],
  execute: ([value]) => (value * Math.PI) / 180,
});

pack.addFormula({
  resultType: coda.ValueType.Number,
  name: "ToDegrees",
  description: "Converts radians to degrees.",
  parameters: [RadiansParameter],
  examples: [{params: [3.14159], result: 180}],
  execute: ([value]) => (value * 180) / Math.PI,
});
