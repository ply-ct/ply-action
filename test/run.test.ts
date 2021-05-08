import { expect } from 'chai';
import * as glob from 'glob';
import * as ply from 'ply-ct';
import { Args } from '../src/args';
import { PlyRunner } from '../src/runner';

describe('runner', () => {

    it('runs ply', async () => {

        const options = new ply.Config(new ply.Defaults(), true).options;

        const globOptions = {
            cwd: options.testsLocation,
            ignore: options.ignore
        };

        const paths = [
            ...glob.sync(options.requestFiles, globOptions),
            ...glob.sync(options.caseFiles, globOptions),
            ...glob.sync(options.flowFiles, globOptions)
        ];

        const args: Args = {
            cwd: '.',
            env: {},
            plyees: paths,
            plyPath: '',
            plyOptions: options,
            runOptions: undefined
        };

        const res = await new PlyRunner().run(args);

        expect(res?.Passed).to.be.equal(2);
        expect(res?.Failed).to.be.equal(0);
        expect(res?.Errored).to.be.equal(0);
    });
});
