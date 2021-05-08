import { expect } from 'chai';
import { Args } from '../src/args';
import { PlyRunner } from '../src/runner';

describe('runner', () => {

    it('runs ply', async () => {

        const args: Args = {
            cwd: '.',
            plyPath: 'node_modules/ply-ct/dist'
        };

        const res = await new PlyRunner().run(args);

        expect(res?.Passed).to.be.equal(2);
        expect(res?.Failed).to.be.equal(0);
        expect(res?.Errored).to.be.equal(0);
    });
});
