import * as process from 'process';
import * as path from 'path';
import * as core from '@actions/core';
import * as glob from 'glob';

export type RunStatus = 'passing' | 'failing';

export interface PlyArgs {
    cwd: string;
    plyPath?: string;
    plyees?: string[];  // Plyee paths
    plyOptions?: object;
    runOptions?: object;
}

export interface RunResult {
    Passed: number;
    Failed: number;
    Errored: number;
    Pending: number;
    Submitted: number;
}

export class PlyRunner {

    async run(args: PlyArgs): Promise<RunResult> {
        const start = Date.now();

        process.chdir(args.cwd || '.');
        const cwd = path.resolve(process.cwd());
        core.info(`Running ply in directory: ${path.normalize(cwd)}`);

        let plyPath = '';
        if (args.plyPath) {
            plyPath = path.isAbsolute(args.plyPath) ? args.plyPath : path.resolve(args.plyPath);
            core.info(`Using ply package at ${plyPath}`);
        }

        // actual execution uses ply on specified path
        const ply = plyPath ? require(plyPath + '/dist/index.js') : require('@ply-ct/ply');
        const Plier: typeof import('@ply-ct/ply').Plier = ply.Plier;
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
        const res: RunResult = { Passed: 0, Failed: 0, Errored: 0, Pending: 0, Submitted: 0 };
        results.forEach(result => res[result.status]++);
        core.info('\nOverall Results: ' + JSON.stringify(res));
        core.info(`Overall Time: ${Date.now() - start} ms`);
        if (plier.options.outputFile) {
            new ply.Storage(plier.options.outputFile).write(JSON.stringify(res, null, plier.options.prettyIndent));
        }
        return res;
    }
}