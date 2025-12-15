export interface AlertModalInterface {
    open: boolean;
    submitDangerous?: boolean;
    title?: string;
    description?: string;
    icon?: React.ReactNode | null;
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
