import * as process from 'process';
import * as assert from 'assert';
import { expect } from 'chai';
import { Brancher } from '../src/brancher';

describe('brancher', () => {

    it('handles branch 404', async () => {
        process.env['GITHUB_REPOSITORY'] = 'ply-ct/ply-action';
        process.env['GITHUB_ACTOR'] = 'donaldoakes';
        const token = process.env['GITHUB_TOKEN'];
        assert.ok(token);

        const branch = new Date().getTime().toString(16);
        const brancher = new Brancher(branch, token);
        await brancher.clone();

        expect(brancher.remote.endsWith('github.com/ply-ct/ply-action.git')).to.be.true;
    });
});
