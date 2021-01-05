import {makeObjectFormula} from 'coda-packs-sdk';
import {makeStringParameter} from 'coda-packs-sdk';
import * as schemas from './schemas';

const API_VERSION = 'v3';

export const formulas = {
  Dictionary: [
    makeObjectFormula({
      name: 'Define',
      description: 'Returns the definition and other metadata for a given word.',
      execute: async ([word], context) => {
        const escapedWord = encodeURIComponent(word);
        const url = `https://www.dictionaryapi.com/api/${API_VERSION}/references/collegiate/json/${escapedWord}`;
        const response = await context.fetcher.fetch({method: 'GET', url});
        return response.body;
      },
      parameters: [makeStringParameter('word', 'A word to define.')],
      response: {
        schema: schemas.definitionSchema,
      },
      // TODO
      examples: [],
    }),
  ],
};
