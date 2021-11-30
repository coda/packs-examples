import * as coda from "@codahq/packs-sdk";
import * as helpers from "./helpers";
import * as schemas from "./schemas";

export const pack = coda.newPack();

// The Merriam-Webster API uses an API token, which should be included in
// request urls in a "key=" parameter, so we configure that here. When
// running `coda auth examples/dictionary/pack.ts` you will be prompted
// to enter your API key to use when using `coda execute` to exercise formulas
// in this pack. Users would be prompted to enter an API key when installing
// this pack in the Coda UI.
pack.setUserAuthentication({
  type: coda.AuthenticationType.QueryParamToken,
  paramName: "key",
});

// This tells Coda which domain the pack make requests to. Any fetcher
// requests to other domains won't be allowed.
pack.addNetworkDomain("dictionaryapi.com");

pack.addFormula({
  resultType: coda.ValueType.Object,
  name: "Define",
  description: "Returns the definition and other metadata for a given word.",
  parameters: [
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "word",
      description: "A word to define.",
    }),
  ],
  schema: schemas.DefinitionArraySchema,
  examples: [
    {
      params: ["hello"],
      result: {
        id: "hello",
        definitions: ["definition of hello"],
        partOfSpeech: "noun",
        headword: "hello",
        firstUse: "1834",
        offensive: false,
      },
    },
  ],
  execute: async function ([word], context) {
    return helpers.lookupDefinition(context, word);
  },
});
