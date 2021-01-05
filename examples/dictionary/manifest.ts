import {AuthenticationType} from 'coda-packs-sdk';
import {PackCategory} from 'coda-packs-sdk';
import type {PackDefinition} from 'coda-packs-sdk';
import {formulas} from './formulas';

export const manifest: PackDefinition = {
  id: 1892,
  name: 'Dictionary',
  shortDescription: 'Look up definitions from a dictionary.',
  description: "Look up definitions for English words from Merriam-Webster's Collegiate Dictionary.",
  version: '1.0',
  providerId: 2002,
  category: PackCategory.Fun,
  logoPath: 'merriam-webster.png',
  defaultAuthentication: {
    type: AuthenticationType.QueryParamToken,
    paramName: 'key',
  },
  formulas,
};
