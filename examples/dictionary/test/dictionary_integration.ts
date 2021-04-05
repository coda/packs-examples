import {assert} from 'chai';
import {describe} from 'mocha';
import {it} from 'mocha';
import {executeFormulaFromPackDef} from 'coda-packs-sdk/dist/development';
import {manifest} from '../manifest';

describe('Dictionary pack integration test', () => {
  it('executes Define', async () => {
    // Here we execute the formula using a real http fetcher. Since this pack requires authentication,
    // this requires that you've already run `coda auth examples/dictionary/manifest.ts` to set up
    // an API key.
    const response = await executeFormulaFromPackDef(manifest, 'Define', ['coda'], undefined, undefined, {
      useRealFetcher: true,
    });

    assert.isAtLeast(response.length, 1);
    assert.equal(response[0].Id, 'coda');
  });
});
