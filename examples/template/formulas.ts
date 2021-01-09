import type {Format} from 'packs-sdk';
import type {GenericSyncTable} from 'packs-sdk';
import type {PackFormulas} from 'packs-sdk';

export const formulas: PackFormulas = {
  MyPack: [
    // Formula defintions go here, e.g.
    // makeStringFormula({ ... }),
  ],
};

export const syncTables: GenericSyncTable[] = [
  // Sync table definitions go here, e.g.
  // makeSyncTable({...}),
];

export const formats: Format[] = [
  // Column formats go here, e.g.
  // {name: 'MyFormat', formulaNamespace: 'MyPack', formulaName: 'MyFormula'}
];
