import {makeNumericFormula} from 'packs-sdk';
import {makeNumericParameter} from 'packs-sdk';

const DegreesParameter = makeNumericParameter('angle', 'An angle measured in degrees.');
const RadiansParameter = makeNumericParameter('angle', 'An angle measured in radians.');

export const formulas = {
  Trig: [
    makeNumericFormula({
      name: 'Sine',
      description: 'Returns the angle (in radians) whose sine is the given number',
      execute: ([value]) => Math.sin(value),
      parameters: [RadiansParameter],
      examples: [{params: [0], result: 0}],
    }),
    makeNumericFormula({
      name: 'Cosine',
      description: 'Returns the cosine of a number (in radians).',
      execute: ([value]) => Math.cos(value),
      parameters: [RadiansParameter],
      examples: [{params: [0], result: 1}],
    }),
    makeNumericFormula({
      name: 'Tangent',
      description: 'Returns the tangent of a number (in radians).',
      execute: ([value]) => Math.tan(value),
      parameters: [RadiansParameter],
      examples: [{params: [0], result: 0}],
    }),
    makeNumericFormula({
      name: 'ToRadians',
      description: 'Converts degrees to radians.',
      execute: ([value]) => (value * Math.PI) / 180,
      parameters: [DegreesParameter],
      examples: [{params: [180], result: 3.14}],
    }),
    makeNumericFormula({
      name: 'ToDegrees',
      description: 'Converts radians to degrees.',
      execute: ([value]) => (value * 180) / Math.PI,
      parameters: [RadiansParameter],
      examples: [{params: [3.14159], result: 180}],
    }),
  ],
};
