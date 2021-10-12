import type {APIEntry} from "./types";
import type {CodaDefinition} from "./types";
import type * as coda from "@codahq/packs-sdk";
import type * as types from "./types";

const API_VERSION = "v3";

export async function lookupDefinition(
  context: coda.ExecutionContext,
  word: string,
): Promise<CodaDefinition[]> {
  let escapedWord = encodeURIComponent(word);
  let url = `https://www.dictionaryapi.com/api/${API_VERSION}/references/collegiate/json/${escapedWord}`;
  let response = await context.fetcher.fetch({method: "GET", url: url});
  // The API returns an array of 0 or more dictionary entries for the
  // given word. We have created types for that response structure to make
  // the code easier to understand and maintain.
  let entries = response.body as types.APIEntry[];
  // We simply transform each entry from the raw structure returned
  // by the API to a more user-friendly structure that we have defined
  // ourselves.
  return entries.map(parseEntry);
}

function parseEntry(entry: APIEntry): CodaDefinition {
  let {shortdef, fl, hwi, date, meta} = entry;
  return {
    id: meta.id,
    definitions: shortdef,
    partOfSpeech: fl,
    headword: hwi.hw,
    firstUse: date,
    offensive: meta.offensive,
  };
}
