import type {CodaRow} from "./types";
import type {RowsContinuation} from "./types";
import * as coda from "@codahq/packs-sdk";
import {formatRowForApi} from "./helpers";
import {formatRowForSchema} from "./helpers";
import {getPropertySchema} from "./helpers";
import {getRows} from "./helpers";
import {getTable} from "./helpers";
import {getTableUrl} from "./helpers";
import {getTables} from "./helpers";
import {updateRow} from "./helpers";

export const pack = coda.newPack();

// A base schema, extended with additional properties depending on the table.
export const BaseRowSchema = coda.makeObjectSchema({
  properties: {
    rowId: {
      description: "Internal ID of the row.",
      type: coda.ValueType.String,
      fromKey: "name",
      required: true,
    },
    rowLabel: {
      type: coda.ValueType.String,
      required: true,
    },
    lastUpdated: {
      type: coda.ValueType.String,
      codaType: coda.ValueHintType.DateTime,
      fromKey: "updateTime",
    },
  },
  displayProperty: "rowLabel",
  idProperty: "rowId",
  featuredProperties: [],
});

pack.addDynamicSyncTable({
  name: "Table",
  description: "Syncs records from a Google Tables table.",
  identityName: "Table",
  placeholderSchema: BaseRowSchema,
  listDynamicUrls: async function (context) {
    let tables = await getTables(context);
    return tables.map(table => {
      return {
        display: table.displayName,
        value: getTableUrl(table.name),
      };
    });
  },
  searchDynamicUrls: async function (context, search) {
    let tables = await getTables(context);
    let results = tables.map(table => {
      return {
        display: table.displayName,
        value: getTableUrl(table.name),
      };
    });
    return coda.autocompleteSearchObjects(search, results, "display", "value");
  },
  getName: async function (context) {
    let tableUrl = context.sync!.dynamicUrl!;
    let table = await getTable(context, tableUrl);
    return table.displayName;
  },
  getSchema: async function (context) {
    let tableUrl = context.sync!.dynamicUrl!;
    let table = await getTable(context, tableUrl);
    let schema: coda.GenericObjectSchema = {
      ...BaseRowSchema,
      properties: {
        ...BaseRowSchema.properties,
      },
    };
    for (let column of table.columns) {
      let property = getPropertySchema(column, table, context);
      if (!property) {
        continue;
      }
      schema.properties[column.name] = property;
      schema.featuredProperties!.push(column.name);
    }
    return schema;
  },
  getDisplayUrl: async function (context) {
    let tableUrl = context.sync!.dynamicUrl!;
    let tableId = tableUrl.split("/").pop() as string;
    return coda.joinUrl("https://tables.area120.google.com/table", tableId);
  },
  // Get the options for select list columns.
  propertyOptions: async function (context) {
    let tableUrl = context.sync!.dynamicUrl!;
    let columnId = context.propertyName;
    let table = await getTable(context, tableUrl);
    let column = table.columns.find(column => column.id === columnId);
    if (!column) {
      throw new Error(`Cannot find column: ${columnId}`);
    }
    if (column.labels) {
      return column.labels.map(label => label.name);
    }
  },
  formula: {
    name: "SyncTable",
    description: "Syncs the data.",
    parameters: [],
    execute: async function (args, context) {
      let {pageToken, rowNumber = 1} = (context.sync.continuation ??
        {}) as RowsContinuation;
      let tableUrl = context.sync.dynamicUrl!;
      let table = await getTable(context, tableUrl);
      let {rows, nextPageToken} = await getRows(context, tableUrl, pageToken);
      let formattedRows = rows.map(row => {
        return formatRowForSchema(row, table, context, String(rowNumber++));
      });
      let continuation: RowsContinuation | undefined;
      if (nextPageToken) {
        continuation = {
          pageToken: nextPageToken,
          rowNumber: rowNumber,
        };
      }
      return {
        result: formattedRows,
        continuation: continuation,
      };
    },
    maxUpdateBatchSize: 10,
    executeUpdate: async function (args, updates, context) {
      let tableUrl = context.sync.dynamicUrl!;
      let table = await getTable(context, tableUrl);

      // Create an async job for each update.
      let jobs = updates.map(async update => {
        // Convert the row back to an API format.
        let row = formatRowForApi(update.newValue as CodaRow, table, context);

        // Prune unchanged values.
        for (let columnId of Object.keys(row.values)) {
          if (!update.updatedFields.includes(columnId)) {
            delete row.values[columnId];
          }
        }
        // Update the row.
        let finalRow = await updateRow(context, row);

        // Convert the final row back to the schema format.
        let label = update.previousValue.rowLabel as string;
        return formatRowForSchema(finalRow, table, context, label);
      });

      // Wait for all of the jobs to finish .
      let completed = await Promise.allSettled(jobs);

      // For each update, return either the updated row or an error if the
      // update failed.
      let results = completed.map(job => {
        if (job.status === "fulfilled") {
          return job.value;
        } else {
          return job.reason;
        }
      });

      // Return the results.
      return {
        result: results,
      };
    },
  },
});

pack.setUserAuthentication({
  type: coda.AuthenticationType.OAuth2,
  authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUrl: "https://oauth2.googleapis.com/token",
  scopes: ["profile", "https://www.googleapis.com/auth/tables"],
  additionalParams: {
    access_type: "offline",
    prompt: "consent",
  },
  getConnectionName: async function (context) {
    let response = await context.fetcher.fetch({
      method: "GET",
      url: "https://www.googleapis.com/oauth2/v1/userinfo",
    });
    let user = response.body;
    return user.name;
  },
});

pack.addNetworkDomain("googleapis.com");
