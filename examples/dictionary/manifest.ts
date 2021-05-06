import {AuthenticationType} from 'coda-packs-sdk';
import type {PackVersionDefinition} from 'coda-packs-sdk';
import {formulas} from './formulas';

export const manifest: PackVersionDefinition = {
  version: '1.0',
  // The Merriam-Webster API uses an API token, which should be included in request urls
  // in a "key=" parameter, so we configure that here. When running `coda auth examples/dictionary/manifest.ts`
  // you will be prompted to enter your API key to use when using `coda execute` to exercise formulas
  // in this pack. Users would be prompted to enter an API key when installing this pack in the Coda UI.
  defaultAuthentication: {
    type: AuthenticationType.QueryParamToken,
    paramName: 'key',
  },
  // This tells Coda which domain the pack make requests to. Any fetcher requests to other domains
  // won't be allowed.
  networkDomains: ['dictionaryapi.com'],
  formulaNamespace: 'Dictionary',
  formulas,
};
