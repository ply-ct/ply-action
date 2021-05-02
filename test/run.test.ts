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

        await new PlyRunner().run(args);
    });
});
