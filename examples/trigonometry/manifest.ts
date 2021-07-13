import {PackVersionDefinition} from '@codahq/packs-sdk';
import {formulas} from './formulas';

export const manifest: PackVersionDefinition = {
  version: '1.1',
  formulaNamespace: 'Trig',
  formulas,
};
