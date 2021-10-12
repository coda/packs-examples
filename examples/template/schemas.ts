import * as coda from "@codahq/packs-sdk";

/*
 * Schemas for your formulas and sync tables go here, for example:
 */

export const WidgetSchema = coda.makeObjectSchema({
  type: coda.ValueType.Object,
  id: "widgetId",
  primary: "widgetName",
  properties: {
    widgetId: {type: coda.ValueType.Number},
    widgetName: {type: coda.ValueType.String},
  },
});
