import type {PackVersionDefinition} from 'coda-packs-sdk';
import {formats} from './formulas';
import {formulas} from './formulas';
import {syncTables} from './formulas';

export const manifest: PackVersionDefinition = {
  version: '0.0.1',
  formulaNamespace: 'MyPack',
  // The substance of the pack, imported from other files.
  formulas,
  syncTables,
  formats,
};
