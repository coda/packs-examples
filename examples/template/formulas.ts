import type {Format} from 'coda-packs-sdk';
import type {GenericSyncTable} from 'coda-packs-sdk';
import type {TypedStandardFormula} from 'coda-packs-sdk';

export const formulas: TypedStandardFormula[] = [
  // Formula defintions go here, e.g.
  // makeStringFormula({ ... }),
];

export const syncTables: GenericSyncTable[] = [
  // Sync table definitions go here, e.g.
  // makeSyncTable({...}),
];

export const formats: Format[] = [
  // Column formats go here, e.g.
  // {name: 'MyFormat', formulaNamespace: 'MyPack', formulaName: 'MyFormula'}
];
