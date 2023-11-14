import type * as coda from "@codahq/packs-sdk";

// Google Tables API types.

export interface Table {
  name: string;
  displayName: string;
  columns: Column[];
  timeZone: string;
}

export interface Column {
  name: string;
  dataType: string;
  id: string;
  readonly?: boolean;
  // Type-specific.
  multipleValuesDisallowed: boolean;
  labels: Label[];
  dateDetails: DateDetails;
  lookupDetails: LookupDetails;
  relationshipDetails: RelationshipDetails;
}

export interface Row {
  name: string;
  values: Record<string, any>;
}

interface Label {
  name: string;
  id: string;
}

interface DateDetails {
  hasTime: boolean;
}

interface LookupDetails {
  relationshipColumn: string;
}

interface RelationshipDetails {
  linkedTable: string;
}

export interface TablesDateTime {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
  nanos: number;
}

export interface TablesDate {
  year: number;
  month: number;
  day: number;
}

export interface DriveFile {
  mimeType: string;
  id: string;
}

export interface TablesFile {
  url: string;
}

export interface TablesLocation {
  address: string;
}

export interface TablesTimestamp {
  seconds: number;
  nanos: number;
}

// Custom types for this Pack.

export interface CodaRow extends Record<string, any> {
  name: string;
  rowLabel: string;
  updateTime?: string;
}

export interface RowsContinuation extends coda.Continuation {
  pageToken: string;
  rowNumber: number;
}

export interface PersonReference {
  email: string;
}

export interface RowReference {
  name: string;
  rowLabel: string;
}
