import * as fs from 'fs';
import * as core from '@actions/core';
import fetch from 'node-fetch';
import { RunStatus } from './runner';

export class Badger {

    constructor(
        readonly repoDir: string,
        readonly badgePath: string
    ) { }

    async update(status: RunStatus): Promise<boolean> {
        const url = `https://ply-ct.com/ply/badge/${status}.svg`;
        const response = await fetch(url);
        if (response.ok) {
            const svg = await response.text();
            let doUpdate = true;
            if (fs.existsSync(`${this.repoDir}/${this.badgePath}`)) {
                const existing = fs.readFileSync(`${this.repoDir}/${this.badgePath}`, { encoding: 'utf8' });
                if (svg === existing) doUpdate = false;
            }
            if (doUpdate) {
                core.info(`Writing '${status}' badge to ${this.repoDir}/${this.badgePath}`);
                fs.writeFileSync(`${this.repoDir}/${this.badgePath}`, svg, 'utf8');
                return true;
            } else {
                core.info(`Status unchanged: ${status}. No badge update.`);
                return false;
            }
        } else {
            throw new Error(`Error fetching badge from ${url}: ${response.status}`);
        }
    }
}