import {APIEntry} from './types';
import {CodaDefinition} from './types';
import {makeObjectFormula} from 'packs-sdk';
import {makeStringParameter} from 'packs-sdk';
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
        // The API returns an array of 0 or more dictionary entries for the given word.
        // We have created types for that response structure to make the code easier to
        // understand and maintain.
        const entries = response.body as APIEntry[];
        // We simply transform each entry from the raw structure returned by the API
        // to a more user-friendly structure that we have defined ourselves.
        return entries.map(parseEntry);
      },
      parameters: [makeStringParameter('word', 'A word to define.')],
      response: {
        schema: schemas.definitionArraySchema,
      },
      examples: [
        {
          params: ['hello'],
          result: {
            id: 'hello',
            definitions: ['definition of hello'],
            partOfSpeech: 'noun',
            headword: 'hello',
            firstUse: '1834',
            offensive: false,
          },
        },
      ],
    }),
  ],
};

function parseEntry(entry: APIEntry): CodaDefinition {
  const {shortdef, fl, hwi, date, meta} = entry;
  return {
    id: meta.id,
    definitions: shortdef,
    partOfSpeech: fl,
    headword: hwi.hw,
    firstUse: date,
    offensive: meta.offensive,
  };
}
