import type {Format} from '@codahq/packs-sdk';
import type {GenericSyncTable} from '@codahq/packs-sdk';
import type {Formula} from '@codahq/packs-sdk';

export const formulas: Formula[] = [
  // Formula definitions go here, e.g.
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
