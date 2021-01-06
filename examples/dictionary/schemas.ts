import {makeObjectSchema} from 'packs-sdk';
import {makeSchema} from 'packs-sdk';
import {ValueType} from 'packs-sdk';

export const definitionSchema = makeObjectSchema({
  type: ValueType.Object,
  // The "primary" property tells Coda which of your object's properties
  // should be used as a label for your object. Pack objects will be rendered
  // as a chip showing the label, and the rest of the fields will show up
  // when hovering over the chip.
  primary: 'headword',
  properties: {
    id: {type: ValueType.String, required: true},
    definitions: {type: ValueType.Array, items: {type: ValueType.String}, required: true},
    headword: {type: ValueType.String, required: true},
    partOfSpeech: {type: ValueType.String},
    firstUse: {type: ValueType.String},
    // TODO: Make required again once SDK is updated.
    // offensive: {type: ValueType.Boolean, required: true},
    offensive: {type: ValueType.Boolean},
  },
});

export const definitionArraySchema = makeSchema({
  type: ValueType.Array,
  items: definitionSchema,
});
