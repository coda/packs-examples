import * as coda from "@codahq/packs-sdk";
import * as helpers from "./helpers";
import * as schemas from "./schemas";

export const pack = coda.newPack({version: "1.0"});

/**
 * An example formula definition, which calls out to a helper file
 * for implementation details.
 *
 * You can delete this if your pack only has tables and not formulas.
 */
pack.addFormula({
  resultType: coda.ValueType.String,
  name: "MyFormula",
  description: "<Description of your formula>",
  parameters: [
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "myParam",
      description: "<Description of your parameter>",
    }),
  ],
  execute: async function ([param], context) {
    return helpers.executeFormula(context, param);
  },
});

/**
 * An example sync table definition, which calls out to a helper file
 * for implementation details.
 *
 * You can delete this if your pack only has formulas and not tables.
 */
pack.addSyncTable({
  name: "MyTable",
  identityName: "<EntityName>",
  schema: schemas.WidgetSchema,
  formula: {
    name: "Sync",
    description: "<Description of sync formula>",
    parameters: [],
    execute: async function ([], context) {
      return helpers.executeSync(context);
    },
  },
});
