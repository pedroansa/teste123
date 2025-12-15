import { type SSTConfig } from 'sst';

import { Config } from './stacks/Config';
import { EventBus } from './stacks/EventBus';
import { ExportService } from './stacks/ExportService';
import { FindSolutionService } from './stacks/FindSolutionService';
import { ImportService } from './stacks/ImportService';
import { ThumbnailService } from './stacks/Thumbnail';

export default {
    config(_input) {
        return {
            name: 'saas-layout-einstein',
            region: 'us-east-1',
        };
    },
    async stacks(app) {
        app.stack(Config);
        app.stack(EventBus);
        app.stack(ImportService);
        app.stack(ExportService);
        app.stack(FindSolutionService);
        app.stack(ThumbnailService);
    },
} satisfies SSTConfig;
