import * as coda from "@codahq/packs-sdk";

export const DefinitionSchema = coda.makeObjectSchema({
  properties: {
    id: {type: coda.ValueType.String, required: true},
    definitions: {
      type: coda.ValueType.Array,
      items: {type: coda.ValueType.String},
      required: true,
    },
    headword: {type: coda.ValueType.String, required: true},
    partOfSpeech: {type: coda.ValueType.String},
    firstUse: {type: coda.ValueType.String},
    offensive: {type: coda.ValueType.Boolean, required: true},
  },
  // The display property tells Coda which of your object's properties
  // should be used as a label for your object. Pack objects will be rendered
  // as a chip showing the label, and the rest of the fields will show up
  // when hovering over the chip.
  displayProperty: "headword",
});

export const DefinitionArraySchema = coda.makeSchema({
  type: coda.ValueType.Array,
  items: DefinitionSchema,
});
