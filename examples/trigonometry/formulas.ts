import {ParameterType, Formula, ValueType} from 'coda-packs-sdk';
import {makeFormula} from 'coda-packs-sdk';
import {makeParameter} from 'coda-packs-sdk';

const DegreesParameter = makeParameter({
  type: ParameterType.Number,
  name: 'angle',
  description: 'An angle measured in degrees.',
});
const RadiansParameter = makeParameter({
  type: ParameterType.Number,
  name: 'angle',
  description: 'An angle measured in radians.',
});

export const formulas: Formula[] = [
  makeFormula({
    resultType: ValueType.Number,
    name: 'Sine',
    description: 'Returns the angle (in radians) whose sine is the given number',
    execute: ([value]) => Math.sin(value),
    parameters: [RadiansParameter],
    examples: [{params: [0], result: 0}],
  }),
  makeFormula({
    resultType: ValueType.Number,
    name: 'Cosine',
    description: 'Returns the cosine of a number (in radians).',
    execute: ([value]) => Math.cos(value),
    parameters: [RadiansParameter],
    examples: [{params: [0], result: 1}],
  }),
  makeFormula({
    resultType: ValueType.Number,
    name: 'Tangent',
    description: 'Returns the tangent of a number (in radians).',
    execute: ([value]) => Math.tan(value),
    parameters: [RadiansParameter],
    examples: [{params: [0], result: 0}],
  }),
  makeFormula({
    resultType: ValueType.Number,
    name: 'ToRadians',
    description: 'Converts degrees to radians.',
    execute: ([value]) => (value * Math.PI) / 180,
    parameters: [DegreesParameter],
    examples: [{params: [180], result: 3.14}],
  }),
  makeFormula({
    resultType: ValueType.Number,
    name: 'ToDegrees',
    description: 'Converts radians to degrees.',
    execute: ([value]) => (value * 180) / Math.PI,
    parameters: [RadiansParameter],
    examples: [{params: [3.14159], result: 180}],
  }),
];
