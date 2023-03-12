import * as fs from 'fs';
import * as core from '@actions/core';
import { PlyRunner, OverallResults, RunStatus } from './runner';
import { Brancher } from './brancher';
import { Badger } from './badger';
import { plyActionVersion } from './version';

core.info(`Ply action ${plyActionVersion}`);

const resultFile = core.getInput('result-file');
if (resultFile) {
    core.info(`Loading Ply results from: ${resultFile}`);
    fs.promises.readFile(resultFile, { encoding: 'utf8' })
    .then(async (contents) => {
        let result = JSON.parse(contents);
        if (result.overall) result = result.overall;
        await handleResult(result);
    })
    .catch(async (err) => {
        core.error(err);
        core.setFailed(err);
        console.debug(err);
        await updateBadge('failing');
    });
} else {
    new PlyRunner().run()
    .then(async (result) => {
        await handleResult(result);
    })
    .catch(async (err) => {
        core.error(err);
        core.setFailed(err);
        console.debug(err);
        await updateBadge('failing');
    });
}

const handleResult = async (result: OverallResults) => {
    core.setOutput('ply-result', result);
    try {
        const success = !result.Failed && !result.Errored;
        const status = success ? 'passing' : 'failing';
        if (status !== 'passing') {
            core.setFailed(status);
        }
        await updateBadge(status);
    } catch (err) {
        core.error(err as Error);
        core.setFailed(err as Error);
        console.debug(err);
    }
};

const updateBadge = async (status: RunStatus) => {
    try {
        const branch = core.getInput('badge-branch');
        if (branch) {
            const token = core.getInput('github-token');
            if (!token) {
                throw new Error('Error: github-token required when badge-branch specified');
            }

            const brancher = new Brancher(branch, token);
            await brancher.clone();
            const badger = new Badger(brancher.repoDir, core.getInput('badge-path'));
            const updated = await badger.update(status);
            if (updated) {
                await brancher.commitAndPush(status);
            }
        }
    } catch (err) {
        core.error(err as Error);
        core.setFailed(err as Error);
        console.debug(err);
    }
};