import * as process from 'process';
import * as path from 'path';
import * as core from '@actions/core';
import * as glob from 'glob';

export type RunStatus = 'passing' | 'failing';

export interface OverallResults {
    Passed: number;
    Failed: number;
    Errored: number;
    Pending: number;
    Submitted: number;
}

export class PlyRunner {

    async run(): Promise<OverallResults> {
        const start = Date.now();

        const cwd = path.resolve(core.getInput('cwd'));
        core.info(`Running ply in directory: ${cwd}`);
        process.chdir(cwd);

        let plyPath = core.getInput('ply-path');
        plyPath = path.normalize(path.isAbsolute(plyPath) ? plyPath : path.resolve(plyPath));
        core.info(`Using ply package at ${plyPath}`);

        // actual execution uses ply on specified path
        const ply = require(plyPath + '/dist/index.js');
        const Plier: any = ply.Plier;
        const plier = new Plier();

        const valuesFiles = core.getInput('values-files');
        if (valuesFiles) {
            plier.options.valuesFiles = valuesFiles.split(/\r?\n/).reduce((vfs, vf) => {
                vfs[vf] = true;
                return vfs;
            }, {} as { [file: string]: boolean });
        }

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

        const results = await plier.run(plyees, { trusted: true });
        if (Array.isArray(results)) {
            throw new Error('Unsupported ply version: < 3.1.0');
        }
        core.info('\nOverall Results: ' + JSON.stringify(results));
        core.info(`Overall Time: ${Date.now() - start} ms`);
        if (plier.options.outputFile) {
            new ply.Storage(plier.options.outputFile).write(JSON.stringify(results, null, plier.options.prettyIndent));
        }
        return results;
    }
}