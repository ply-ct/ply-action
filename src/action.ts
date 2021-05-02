import { Args } from './args';
import { PlyRunner } from './runner';

const args: Args = {
    cwd: '.',
    env: { },
    plyees: [],
    plyPath: '',
    plyOptions: {},
    runOptions: undefined
};

new PlyRunner().run(args);
