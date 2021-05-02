import * as core from '@actions/core';
// import { merge } from './merge';

// TODO input validation required?
const base = core.getInput('base');
const specs = core.getInput('specs')
    .split('\n')
    .map(s => s.trim())
    .filter(s => s !== '');

const output = core.getInput('output');

// merge(base, specs, output);