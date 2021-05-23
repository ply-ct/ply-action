import * as process from 'process';
import * as fs from 'fs';
import { exec } from '@actions/exec';
import { rmRF } from '@actions/io';
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
        const branchesResponse = await octo.repos.listBranches({ owner: this.owner, repo: this.repo });
        if (branchesResponse.status !== 200) throw new Error(`Failed to retrieve branches for: ${this.remote}`);
        const branches = branchesResponse.data.map(b => b.name);
        if (branches.includes(this.branch)) {
            await exec('git', [ 'checkout', this.branch ], { cwd: this.repoDir });
        } else {
            // orphan branch (commit to default)
            await exec('git', [ 'checkout', '--orphan', this.branch ], { cwd: this.repoDir });
            await exec('git', [ 'rm', '-rf', '.' ], { cwd: this.repoDir });
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