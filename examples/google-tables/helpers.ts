import type {Column} from "./types";
import type {Table} from "./types";
import * as coda from "@codahq/packs-sdk";
import { getConverter } from "./convert";

const BaseUrl = "https://area120tables.googleapis.com/v1alpha1";
const PageSize = 100;
const ShortCacheTimeSecs = 60;

export function getTableUrl(tableName: string): string {
  return coda.joinUrl(BaseUrl, tableName);
}

// Get the available tables from the API.
export async function getTables(context: coda.ExecutionContext)
  : Promise<Table[]> {
  let url = coda.withQueryParams(coda.joinUrl(BaseUrl, "tables"), {
    pageSize: PageSize,
  });
  let response = await context.fetcher.fetch({
    method: "GET",
    url: url,
    cacheTtlSecs: ShortCacheTimeSecs,
  });
  return response.body.tables as Table[];
}

// Get a specific table from the API.
export async function getTable(
  context: coda.ExecutionContext, tableUrl: string): Promise<Table> {
  let response = await context.fetcher.fetch({
    method: "GET",
    url: tableUrl,
    cacheTtlSecs: ShortCacheTimeSecs,
  });
  return response.body;
}

// Get a page of table rows from the API.
export async function getRows(context: coda.ExecutionContext, tableUrl: string,
  pageToken?: string): Promise<{ rows: any[], nextPageToken?: string }> {
  let url = coda.withQueryParams(coda.joinUrl(tableUrl, "rows"), {
    view: "COLUMN_ID_VIEW",
    pageSize: PageSize,
    pageToken: pageToken,
  });
  let response = await context.fetcher.fetch({
    method: "GET",
    url: url,
  });
  return response.body;
}

// Update a table row using the API.
export async function updateRow(context: coda.UpdateSyncExecutionContext,
  row: any) {
  let url = coda.withQueryParams(coda.joinUrl(BaseUrl, row.name), {
    view: "COLUMN_ID_VIEW",
  });
  try {
    let response = await context.fetcher.fetch({
      method: "PATCH",
      url: url,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(row),
    });
    return response.body;
  } catch (error) {
    if (coda.StatusCodeError.isStatusCodeError(error)) {
      if (error.body?.error) {
        throw new coda.UserVisibleError(error.body.error.message);
      }
    }
    throw error;
  }
}

export function getPropertySchema(column: Column, table: Table,
  context: coda.ExecutionContext)
  : coda.Schema & coda.ObjectSchemaProperty | undefined {
  let converter = getConverter(context, column, table);
  let schema = converter.getSchema();
  if (column.lookupDetails) {
    // This is a column that depends on a relationship, so it can't be edited
    // directly.
    let relationship = column.lookupDetails.relationshipColumn;
    schema.description =
      `This is a lookup column, using the relationship "${relationship}". ` +
      "To change the value, edit the corresponding relationship column.";
    schema.mutable = false;
  }
  if (schema.mutable === undefined) {
    schema.mutable = !column.readonly;
  }
  schema.fromKey = column.id;
  schema.fixedId = column.id;
  return schema;
}

export function formatRowForSchema(row: any, table: Table,
  context: coda.ExecutionContext, label: string): any {
  let result: Record<string, any> = {
    name: row.name,
    rowLabel: label,
  };
  for (let [columnId, value] of Object.entries(row.values)) {
    let column = table.columns.find(column => column.id === columnId);
    if (!column) {
      throw new Error(`Cannot find column: ${columnId}`);
    }
    let converter = getConverter(context, column, table);
    if (converter.formatValueForSchema) {
      value = converter.formatValueForSchema(value);
    }
    result[columnId] = value;
  }
  return result;
}

export function formatRowForApi(row: any, table: Table,
  context: coda.ExecutionContext): any {
  let result: Record<string, any> = {
    name: row.name,
    values: {},
  };
  for (let column of table.columns) {
    let value = row[column.id];
    if (value) {
      let converter = getConverter(context, column, table);
      if (converter.formatValueForApi) {
        value = converter.formatValueForApi(value);
      }
    }
    result.values[column.id] = value;
  }
  return result;
}


