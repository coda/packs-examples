/**
 * Type definitions for objects returned by the dictionary API.
 */

// A single response entry as described at https://dictionaryapi.com/products/json.
// The http response from the API consists of an array of these objects.
// For simplicity, we only include the subset of fields that care about for
// this pack.
export interface APIEntry {
  // One or more practical definitions of the word.
  shortdef: string[];

  // The part of speech.
  fl?: string;

  // The actual word or phrase being defined in this entry. For example,
  // if an alternate tense of a word was searched for, the definition
  // returned may be for the present tense form of the word.
  hwi: {hw: string};

  // A year or description about the approximate first known use.
  date?: string;

  // Metadata about the entry.
  meta: {
    id: string;
    offensive: boolean;
  };
}

/**
 * Type definitions for the transformed objects returned by the pack.
 * Generally these types match the schema(s) you define in schemas.ts.
 */

export interface CodaDefinition {
  id: string;
  definitions: string[];
  headword: string;
  partOfSpeech?: string;
  firstUse?: string;
  offensive: boolean;
}
