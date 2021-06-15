import {APIEntry} from './types';
import {CodaDefinition} from './types';
import {ConnectionRequirement, Type, TypedStandardFormula} from 'coda-packs-sdk';
import {makeObjectFormula} from 'coda-packs-sdk';
import {makeParameter} from 'coda-packs-sdk';
import * as schemas from './schemas';

const API_VERSION = 'v3';

export const formulas: TypedStandardFormula[] = [
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
    parameters: [makeParameter({type: Type.string, name: 'word', description: 'A word to define.'})],
    response: {
      schema: schemas.definitionArraySchema,
    },
    // This indicates that the user must register a "connection" (account) with the pack
    // to successfully call this formula, i.e. the user needs to have entered an API
    // key and associate that API key with usage of this formula.
    connectionRequirement: ConnectionRequirement.Required,
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
];

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
