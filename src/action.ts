import { Args } from './args';
import { PlyRunner } from './runner';

/**
 * TODO args come from inputs
 */
const args: Args = {
    cwd: '.',
    plyPath: 'node_modules/ply-ct/dist'
};
new PlyRunner().run(args);
