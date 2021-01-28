import {assert} from 'chai';
import {describe} from 'mocha';
import {it} from 'mocha';
import {executeFormulaFromPackDef} from 'coda-packs-sdk/dist/development';
import {manifest} from '../manifest';

describe('Trigonometry pack', () => {
  it('executes Cosine', async () => {
    // Since our pack doesn't make any fetcher calls, we can very simply invoke formulas
    // directly with the default mock execution context.
    assert.equal(1, await executeFormulaFromPackDef(manifest, 'Trig::Cosine', [0]));
    assert.approximately(
      1 / Math.sqrt(2),
      await executeFormulaFromPackDef(manifest, 'Trig::Cosine', [Math.PI / 4]),
      1e6,
    );
  });

  it('converts degrees and radians', async () => {
    assert.equal(Math.PI / 2, await executeFormulaFromPackDef(manifest, 'Trig::ToRadians', [90]));
    assert.equal(90, await executeFormulaFromPackDef(manifest, 'Trig::ToDegrees', [Math.PI / 2]));
  });
});
