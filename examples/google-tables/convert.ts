import {BaseRowSchema} from "./pack";
import type {Column} from "./types";
import {DateTime} from "luxon";
import type {DriveFile} from "./types";
import type {PersonReference} from "./types";
import type {RowReference} from "./types";
import type {Table} from "./types";
import type {TablesDate} from "./types";
import type {TablesDateTime} from "./types";
import type {TablesFile} from "./types";
import type {TablesLocation} from "./types";
import type {TablesTimestamp} from "./types";
import * as coda from "@codahq/packs-sdk";
import {getTableUrl} from "./helpers";

const DriveOpenUrl = "https://drive.google.com/open";
const NanosPerMilli = 1000000;
const MillisPerSecond = 1000;

// Gets the column converter for a given column.
export function getConverter(
  context: coda.ExecutionContext,
  column: Column,
  table: Table,
): ColumnConverter<any, any> {
  switch (column.dataType) {
    case "text":
    case "row_id":
      return new TextColumnConverter(context, column, table);
    case "number":
    case "auto_id":
      return new NumberColumnConverter(context, column, table);
    case "boolean":
      return new BooleanColumnConverter(context, column, table);
    case "date":
      if (!column.dateDetails?.hasTime) {
        return new DateColumnConverter(context, column, table);
      }
      return new DateTimeColumnConverter(context, column, table);
    case "person":
    case "creator":
    case "updater":
      return new PersonColumnConverter(context, column, table);
    case "person_list":
      let personConverter = new PersonColumnConverter(context, column, table);
      if (column.multipleValuesDisallowed) {
        // We want to display this as a single person selector in Coda, but the
        // value come back from the API as a list of one.
        return new UnwrapColumnConverter(personConverter);
      }
      return new ListColumnConverter(personConverter);
    case "dropdown":
      return new SelectListColumnConverter(context, column, table);
    case "check_list":
    case "tags_list":
      return new MultiSelectListColumnConverter(context, column, table);
    case "drive_attachment_list":
      return new DriveFilesColumnConverter(context, column, table);
    case "file_attachment_list":
      return new FilesColumnConverter(context, column, table);
    case "location":
      return new LocationColumnConverter(context, column, table);
    case "relationship":
      return new RelationshipColumnConverter(context, column, table);
    case "create_timestamp":
    case "update_timestamp":
    case "comment_timestamp":
      return new TimestampColumnConverter(context, column, table);
    default:
      if (column.dataType.endsWith("_list")) {
        // Handle lists of basic types.
        let baseType = column.dataType.slice(0, -5);
        let baseColumn: Column = {...column, dataType: baseType};
        let baseConverter = getConverter(context, baseColumn, table);
        if (baseConverter) {
          return new ListColumnConverter(baseConverter);
        }
      }
      // eslint-disable-next-line no-console
      console.error(`No converter found for column type: ${column.dataType}`);
      return new UnknownColumnConverter(context, column, table);
  }
}

// Abstract class that all converter classes extend.
abstract class ColumnConverter<T, C> {
  column: Column;
  table: Table;
  context: coda.ExecutionContext;

  constructor(context: coda.ExecutionContext, column: Column, table: Table) {
    this.context = context;
    this.column = column;
    this.table = table;
  }

  getSchema(): coda.Schema & coda.ObjectSchemaProperty {
    let schema = this._getBaseSchema();
    schema.fromKey = this.column.id;
    schema.fixedId = this.column.id;
    schema.displayName = this.column.name;

    // Determine mutability.
    if (this.column.lookupDetails) {
      // This is a column that depends on a relationship, so it can't be edited
      // directly.
      let relationship = this.column.lookupDetails.relationshipColumn;
      schema.description =
        `This is a lookup column, using the relationship "${relationship}". ` +
        "To change the value, edit the corresponding relationship column.";
      schema.mutable = false;
    }
    // If mutability hasn't been specified by either the converter or the lookup
    // logic above, fallback to the readonly field of the column.
    if (schema.mutable === undefined) {
      schema.mutable = !this.column.readonly;
    }

    return schema;
  }

  // Each implementation must define the base property schema.
  abstract _getBaseSchema(): coda.Schema & coda.ObjectSchemaProperty;

  // Default to passing through the value as-is, in both directions.
  formatValueForSchema(value: T): C {
    return value as any;
  }
  formatValueForApi(value: C): T {
    return value as any;
  }
}

class TextColumnConverter extends ColumnConverter<string, string> {
  _getBaseSchema() {
    return coda.makeSchema({
      type: coda.ValueType.String,
    });
  }
}

class NumberColumnConverter extends ColumnConverter<number, number> {
  _getBaseSchema() {
    return coda.makeSchema({
      type: coda.ValueType.Number,
    });
  }
}

class BooleanColumnConverter extends ColumnConverter<boolean, boolean> {
  _getBaseSchema() {
    return coda.makeSchema({
      type: coda.ValueType.Boolean,
    });
  }
}

class DateColumnConverter extends ColumnConverter<TablesDate, string> {
  _getBaseSchema() {
    return coda.makeSchema({
      type: coda.ValueType.String,
      codaType: coda.ValueHintType.Date,
    });
  }

  formatValueForSchema(value: TablesDate) {
    // Return it without a timezone, so it always represents the same day.
    return `${value.year}-${value.month}-${value.day}`;
  }

  formatValueForApi(value: string) {
    let dateTime = DateTime.fromISO(value, {
      zone: this.context.timezone,
    });
    let {year, month, day} = dateTime.toObject();
    return {
      year: Number(year),
      month: Number(month),
      day: Number(day),
    };
  }
}

class DateTimeColumnConverter extends ColumnConverter<TablesDateTime, string> {
  _getBaseSchema() {
    return coda.makeSchema({
      type: coda.ValueType.String,
      codaType: coda.ValueHintType.DateTime,
    });
  }

  formatValueForSchema(value: TablesDateTime) {
    let dateTime = DateTime.fromObject(
      {
        year: value.year,
        month: value.month,
        day: value.day,
        hour: value.hours,
        minute: value.minutes,
        second: value.seconds,
        millisecond: value.nanos / NanosPerMilli,
      },
      {
        zone: this.table.timeZone,
      },
    );
    return dateTime.toISO()!;
  }

  formatValueForApi(value: string) {
    let dateTime = DateTime.fromISO(value, {
      zone: this.table.timeZone,
    });
    let {year, month, day, hour, minute, second, millisecond} =
      dateTime.toObject();
    return {
      year: year!,
      month: month!,
      day: day!,
      hours: hour!,
      minutes: minute!,
      seconds: second!,
      nanos: millisecond! * NanosPerMilli,
    };
  }
}

class PersonColumnConverter extends ColumnConverter<string, PersonReference> {
  _getBaseSchema() {
    return coda.makeObjectSchema({
      codaType: coda.ValueHintType.Person,
      properties: {
        name: {type: coda.ValueType.String},
        email: {type: coda.ValueType.String, required: true},
      },
      displayProperty: "name",
      idProperty: "email",
    });
  }

  formatValueForSchema(value: string) {
    return {
      name: "Unknown",
      email: value,
    };
  }

  formatValueForApi(value: PersonReference) {
    return value.email;
  }
}

class SelectListColumnConverter extends ColumnConverter<string, string> {
  _getBaseSchema() {
    return coda.makeSchema({
      type: coda.ValueType.String,
      codaType: coda.ValueHintType.SelectList,
      options: coda.OptionsType.Dynamic,
    });
  }
}

class MultiSelectListColumnConverter extends ColumnConverter<
  string[],
  string[]
> {
  selectListConverter: SelectListColumnConverter;

  constructor(context: coda.ExecutionContext, column: Column, table: Table) {
    super(context, column, table);
    this.selectListConverter = new SelectListColumnConverter(
      context,
      column,
      table,
    );
  }

  _getBaseSchema() {
    return coda.makeSchema({
      type: coda.ValueType.Array,
      items: this.selectListConverter._getBaseSchema(),
    });
  }
}

class DriveFilesColumnConverter extends ColumnConverter<DriveFile[], string[]> {
  _getBaseSchema() {
    return coda.makeSchema({
      type: coda.ValueType.Array,
      items: {
        type: coda.ValueType.String,
        codaType: coda.ValueHintType.Url,
      },
      // Can't reasonably edit these in Coda.
      mutable: false,
    });
  }

  formatValueForSchema(value: DriveFile[]) {
    return value.map(driveFile => {
      return coda.withQueryParams(DriveOpenUrl, {
        id: driveFile.id,
      });
    });
  }
}

class FilesColumnConverter extends ColumnConverter<TablesFile[], string[]> {
  _getBaseSchema() {
    return coda.makeSchema({
      type: coda.ValueType.Array,
      items: {
        type: coda.ValueType.String,
        codaType: coda.ValueHintType.Attachment,
      },
      // Can't reasonably edit these in Coda.
      mutable: false,
    });
  }

  formatValueForSchema(value: TablesFile[]) {
    return value.map(file => file.url);
  }
}

class LocationColumnConverter extends ColumnConverter<TablesLocation, string> {
  _getBaseSchema() {
    return coda.makeSchema({
      type: coda.ValueType.String,
      // Can't reasonably edit these in Coda.
      mutable: false,
    });
  }

  formatValueForSchema(value: TablesLocation) {
    return value.address;
  }
}

class RelationshipColumnConverter extends ColumnConverter<
  string,
  RowReference
> {
  _getBaseSchema() {
    let referenceSchema = coda.makeReferenceSchemaFromObjectSchema(
      BaseRowSchema,
      "Table",
    );
    referenceSchema.identity!.dynamicUrl = getTableUrl(
      this.column.relationshipDetails.linkedTable,
    );
    return referenceSchema;
  }

  formatValueForSchema(value: string) {
    return {
      name: value,
      rowLabel: "Not found",
    };
  }

  formatValueForApi(value: RowReference) {
    return value.name;
  }
}

class TimestampColumnConverter extends ColumnConverter<
  TablesTimestamp,
  string
> {
  _getBaseSchema() {
    return coda.makeSchema({
      type: coda.ValueType.String,
      codaType: coda.ValueHintType.DateTime,
    });
  }

  formatValueForSchema(value: TablesTimestamp) {
    let milliseconds =
      value.seconds * MillisPerSecond + value.nanos / NanosPerMilli;
    let date = new Date(milliseconds);
    return date.toISOString();
  }

  formatValueForApi(value: string) {
    let date = new Date(value);
    let milliseconds = date.getTime();
    return {
      seconds: Math.floor(milliseconds / MillisPerSecond),
      nanos: (milliseconds % MillisPerSecond) * NanosPerMilli,
    };
  }
}

class UnknownColumnConverter extends ColumnConverter<any, string> {
  _getBaseSchema() {
    return coda.makeSchema({
      type: coda.ValueType.String,
      mutable: false,
    });
  }

  formatValueForSchema(value: any) {
    return String(value);
  }
}

class ListColumnConverter extends ColumnConverter<any[], any[]> {
  baseConverter: ColumnConverter<any, any>;

  constructor(baseConverter: ColumnConverter<any, any>) {
    super(baseConverter.context, baseConverter.column, baseConverter.table);
    this.baseConverter = baseConverter;
  }

  _getBaseSchema() {
    return coda.makeSchema({
      type: coda.ValueType.Array,
      items: this.baseConverter._getBaseSchema(),
    });
  }

  formatValueForSchema(list: any[]) {
    return list.map((value: any) =>
      this.baseConverter.formatValueForSchema(value),
    );
  }

  formatValueForApi(list: any[]) {
    return list.map((value: any) =>
      this.baseConverter.formatValueForApi(value),
    );
  }
}

class UnwrapColumnConverter extends ColumnConverter<any[], any> {
  baseConverter: ColumnConverter<any, any>;

  constructor(baseConverter: ColumnConverter<any, any>) {
    super(baseConverter.context, baseConverter.column, baseConverter.table);
    this.baseConverter = baseConverter;
  }

  _getBaseSchema() {
    return this.baseConverter._getBaseSchema();
  }

  formatValueForSchema(list: any[]) {
    return this.baseConverter.formatValueForSchema(list[0]);
  }

  formatValueForApi(value: any) {
    return [this.baseConverter.formatValueForApi(value)];
  }
}
