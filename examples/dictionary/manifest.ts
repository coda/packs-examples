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
  // The Merriam-Webster API uses an API token, which should be included in request urls
  // in a "key=" parameter, so we configure that here. When running `coda auth examples/dictionary/manifest.ts`
  // you will be prompted to enter your API key to use when using `coda execute` to exercise formulas
  // in this pack. Users would be prompted to enter an API key when installing this pack in the Coda UI.
  defaultAuthentication: {
    type: AuthenticationType.QueryParamToken,
    paramName: 'key',
  },
  formulaNamespace: 'Dictionary',
  formulas,
};
