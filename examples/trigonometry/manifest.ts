import {PackCategory} from 'coda-packs-sdk';
import {PackDefinition} from 'coda-packs-sdk';
import {formulas} from './formulas';

export const manifest: PackDefinition = {
  id: 1006,
  name: 'Trigonometry',
  shortDescription: 'Carry out common trigonometric calculations in Coda.',
  description: 'Carry out common trigonometric calculations in Coda.',
  version: '1.1',
  exampleImages: ['example_1_formulas.png', 'example_2_charts.png'],
  providerId: 2002,
  category: PackCategory.Mathematics,
  logoPath: 'trig.png',
  formulas,
};
