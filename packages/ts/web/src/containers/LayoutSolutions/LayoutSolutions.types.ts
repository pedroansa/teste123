export interface File {
    bucket: string;
    key: string;
}

interface SuccessResponse<T> {
    success: true;
    data: T;
    error: undefined;
}

interface ErrorResponse {
    success: false;
    data: undefined;
    error: string;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export interface StepBackConfig {
    modal?: AlertModalInterface;
    onBackClick?: () => void;
}

export interface AlertModalInterface {
    open?: boolean;
    submitDangerous?: boolean;
    title?: string;
    description?: string;
    icon?: React.JSX.Element | null;
    textSubmit?: string;
    textCancel?: string;
    loader?: boolean;
    onSubmit?: () => void;
    onCancel?: () => void;
    variant?: {
        type: string;
        title?: string;
        description?: string;
    };
}

export type ViewModeType = '2d' | '3d';

export interface FileExportSucceededData {
    outputFileDownloadSignedUrl: string;
    logs: { error?: string[]; warning?: string[] };
    conversionLogs: unknown[];
    requestId: string;
}
