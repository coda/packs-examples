import {makeObjectSchema} from 'coda-packs-sdk';
import {ValueType} from 'coda-packs-sdk';

export const definitionSchema = makeObjectSchema({
  type: ValueType.Object,
  identity: {
    packId: 1892,
    name: 'Definition',
  },
  primary: 'word',
  id: 'id',
  properties: {
    url: {type: ValueType.String, codaType: ValueType.Url},
    ahrefs_rank: {type: ValueType.Number},
  },
});
