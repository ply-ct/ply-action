import * as path from 'path';
import { Args } from './args';
import { PlyRunner } from './runner';

const args: Args = {
    cwd: '.',
    plyees: [],
    plyPath: 'node_modules/ply-ct/dist',
    plyOptions: {},
    runOptions: undefined
};

new PlyRunner().run(args);
