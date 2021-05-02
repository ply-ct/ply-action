import * as process from 'process';
import * as path from 'path';
import * as core from '@actions/core';
import * as ply from 'ply-ct';
import { Args } from './args';

export class PlyRunner {

    async run(args: Args) {
        try {
            const start = Date.now();

            process.chdir(args.cwd);

            for (const envVar in args.env) {
                process.env[envVar] = args.env[envVar];
            }

            const plyPath = args.plyPath ? args.plyPath : path.dirname(require.resolve('ply-ct'));
            core.info(`Using ply package at ${plyPath}`);

            // actual execution uses ply on specified path
            const ply = require(plyPath + '/index.js');
            const Plier: typeof import('ply-ct').Plier = ply.Plier;
            const plier = new Plier(args.plyOptions);

            const paths = args.plyees.map(p => {
                return path.isAbsolute(p) ? p : (args.plyOptions as any).testsLocation + path.sep + p;
            });
            const plyees = await plier.find(paths);


            const cwd = process.cwd();
            module.paths.push(cwd, path.join(cwd, 'node_modules'));

            core.info(`Running plyees:\n${plyees.join()}`);

            const results = await plier.run(plyees, args.runOptions);
            const res = { Passed: 0, Failed: 0, Errored: 0, Pending: 0, Submitted: 0 };
            results.forEach(result => res[result.status]++);
            core.info('\nOverall Results: ' + JSON.stringify(res));
            core.info(`Overall Time: ${Date.now() - start} ms`);
            if (plier.options.outputFile) {
                new ply.Storage(plier.options.outputFile).write(JSON.stringify(res, null, plier.options.prettyIndent));
            }
            if (res.Failed || res.Errored) {
                process.exit(1);
            }

            core.info('Ply action finished');
        }
        catch (err) {
            console.error(err);
            core.error(err);
        }
    }

}