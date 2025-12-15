import { type SSTConfig } from 'sst';

import { FrontendFolder } from './stacks/FrontendFolder';

export default {
    config(_input) {
        return {
            name: `saas-layout-einstein${process.env.TARGET || ''}`,
            region: 'us-east-1',
        };
    },
    async stacks(app) {
        await app.stack(FrontendFolder);
    },
} satisfies SSTConfig;
