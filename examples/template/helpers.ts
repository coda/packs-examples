import type * as coda from "@codahq/packs-sdk";

/**
 * You can put the complicated business logic of your pack in this file,
 * or multiple files, to nicely separate your pack's logic from the
 * high-level definition in pack.ts
 */

export async function executeFormula(
  context: coda.ExecutionContext,
  param: string,
) {
  // Implement your formula here.

  return "<something>";
}

export async function executeSync(context: coda.SyncExecutionContext) {
  // Implement your sync here.

  return {
    result: [{widgetId: 123, widgetName: "<some name>"}],
    continuation: undefined,
  };
}
