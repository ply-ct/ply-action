import * as process from 'process';
import * as path from 'path';
import * as core from '@actions/core';
import * as glob from 'glob';
import { Args } from './args';

export class PlyRunner {

    async run(args: Args) {
        try {
            const start = Date.now();

            throw new Error('Test error handling');


            process.chdir(args.cwd || '.');
            const cwd = process.cwd();
            core.info(`Running ply in cwd: ${cwd}`);

            const plyPath = `${cwd}/${args.plyPath}`;
            core.info(`Using ply package at ${plyPath}`);

            // actual execution uses ply on specified path
            const ply = require(plyPath + '/index.js');
            const Plier: typeof import('ply-ct').Plier = ply.Plier;
            const plier = new Plier(args.plyOptions);
            const globOptions = {
                cwd: plier.options.testsLocation,
                ignore: plier.options.ignore
            };

            let paths = [
                ...glob.sync(plier.options.requestFiles, globOptions),
                ...glob.sync(plier.options.caseFiles, globOptions),
                ...glob.sync(plier.options.flowFiles, globOptions)
            ];


            paths = paths.map(p => {
                return path.isAbsolute(p) ? p : plier.options.testsLocation + path.sep + p;
            });
            const plyees = await plier.find(paths);

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
            core.info('Ply action finished');

            if (res.Failed || res.Errored) {
                core.error(JSON.stringify(res));
                process.exit(1);
            }

            return res;
        }
        catch (err) {
            console.error(err);
            core.error(err);
            process.exit(1);
        }
    }

}