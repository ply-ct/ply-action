import { promises as fs } from 'fs';
import { expect } from 'chai';
import * as jsYaml from 'js-yaml';
import { merge } from '../src/merge/merge';

describe('merge action', () => {

    it('merges specs', async () => {
        const base = 'docs/openapi/base.yaml';
        const specs = [
            'https://github.com/CenturyLinkFederal/eis-accounts/openapi/accounts.yaml',
            'https://github.com/CenturyLinkFederal/eis-products/openapi/products.yaml',
            'https://github.com/CenturyLinkFederal/eis-orders/openapi/orders.yaml'
        ];
        // const specs = [
        //     '../eis-accounts/openapi/accounts.yaml',
        //     '../eis-products/openapi/products.yaml',
        //     '../eis-orders/openapi/orders.yaml'
        // ];
        const output = 'test/openapi/eis.yaml';

        await merge(base, specs, output);

        const eisSpec = await fs.readFile('docs/openapi/eis.yaml', 'utf-8');
        const eisSpecObj = jsYaml.load(eisSpec);

        const testSpec = await fs.readFile('test/openapi/eis.yaml', 'utf-8');
        const testSpecObj = jsYaml.load(testSpec);

        expect(testSpecObj).to.be.deep.equal(eisSpecObj);
    });
});
