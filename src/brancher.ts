import * as process from 'process';
import * as fs from 'fs';
import { exec } from '@actions/exec';
import { rmRF } from '@actions/io';
import * as core from '@actions/core';
import * as github from '@actions/github';
import { RunStatus } from './runner';

export class Brancher {

    readonly owner: string;
    readonly repo: string;
    readonly remote: string;
    readonly repoDir: string;

    constructor(
        readonly branch: string,
        readonly token: string
    ) {
        const [ owner, repo, ..._more ] = process.env['GITHUB_REPOSITORY']!.split('/');
        this.owner = owner;
        this.repo = repo;
        const creds = `${process.env['GITHUB_ACTOR']}:${this.token}`;
        this.remote = `https://${creds}@github.com/${owner}/${repo}.git`;
        this.repoDir = `repo-${new Date().getTime().toString(16)}`;
    }

    async clone() {
        await exec('git', ['clone', this.remote, this.repoDir]);
        const octo = github.getOctokit(this.token);
        try {
            const branchResponse = await octo.rest.repos.getBranch({ owner: this.owner, repo: this.repo, branch: this.branch });
            if (branchResponse.status === 200) {
                core.info(`Updating existing orphan branch '${this.branch}' on: ${this.repo}`);
                await exec('git', [ 'checkout', this.branch ], { cwd: this.repoDir });
            } else {
                throw new Error(`Error retrieving branch '${this.branch}' on: ${this.repo} (status=${branchResponse.status})`);
            }

        } catch (err: any) {
            if (err.status === 404) {
                core.info(`Creating new orphan branch '${this.branch}' on: ${this.repo}`);
                // orphan branch (commit to default)
                await exec('git', [ 'checkout', '--orphan', this.branch ], { cwd: this.repoDir });
                await exec('git', [ 'rm', '-rf', '.' ], { cwd: this.repoDir });
            } else {
                throw err;
            }
        }
    }

    async commitAndPush(status: RunStatus) {
        await exec('git', ['config', '--local', 'user.email', 'donaldoakes@users.noreply.github.com' ], { cwd: this.repoDir });
        await exec('git', [ 'config', '--local', 'user.name', 'Ply GitHub Action' ], { cwd: this.repoDir });
        await exec('git', [ 'add', '.' ], { cwd: this.repoDir });
        await exec('git', [ 'commit', '-m', `Update badge per status: ${status}` ], { cwd: this.repoDir });
        await exec('git', [ 'push', this.remote, 'HEAD' ], { cwd: this.repoDir });
    }

    async cleanup() {
        if (fs.existsSync(this.repoDir)) {
            await rmRF(this.repoDir);
        }
    }
}