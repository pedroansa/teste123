export type ApplicationEventType =
    | 'FILE_EXPORT_SUCCEEDED'
    | 'EXPORT_SOLUTION_REQUESTED'
    | 'FILE_EXPORT_FAILED';

export interface ApplicationEventDetail {
    FILE_EXPORT_SUCCEEDED: {
        requestId: string;
        outputFileDownloadSignedUrl: string;
        conversionLogs: {
            level: number;
            message: string;
            readable_message: string;
            element_type: string;
        }[];
    };
    EXPORT_SOLUTION_REQUESTED: {
        siteId: string;
        solutionId: string;
        outputFormat: string;
        requestId: string;
    };
    FILE_EXPORT_FAILED: {
        requestId: string;
        logs: string[];
    };
}
