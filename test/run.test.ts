import { expect } from 'chai';
import { PlyRunner } from '../src/runner';

describe('runner', () => {

    it('runs ply', async () => {

        const res = await new PlyRunner().run();

        expect(res?.Passed).to.be.equal(2);
        expect(res?.Failed).to.be.equal(0);
        expect(res?.Errored).to.be.equal(0);
    });
});
