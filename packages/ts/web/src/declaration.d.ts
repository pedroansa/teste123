declare module 'saas_root/Hooks';
declare module 'saas_root/Components';
declare module 'saas_root/Icons';
declare module 'saas_root/Services';
declare module 'saas_root/Authentication';
declare module 'saas_root/Api';
declare module 'saas_root/ApplicationEvents';
declare module 'saas_root/Utils';
declare module 'saas_root/Contexts';

declare module 'saas_root/Contexts' {
    export function useGlobalContext(): void;
    export function AsideBarProvider(): void;
    export function useAsideBar(): void;
}

declare module 'saas_root/Hooks' {
    export function useFolders(): void;
    export function useFiles(): void;
    export function useSolutions(): void;
    export function useGetArchitectureParametersTemplate(): void;
    export function useGetUrbanParametersTemplates(): void;
    export function useViewModeStore(): void;
    export function useMicrofrontendsContext(): void;
}

declare module 'saas_root/Utils' {
    export function formatDate(dateString: string): string;
    export function formatTipologia(value: string, Tipo: boolean): string;
    export function formatValue(value: string | number, fractionDigits?: number): string | number;
    export function calculateColors(
        baseHex: string,
        returnRgb: boolean
    ): string[] | [string, string, string];
    export function playBeep(): void;
    export function gerarSigla(email: string): string | undefined;
}

declare module 'saas_root/Icons' {
    export const WarningCircleAlertIcon: JSX.Element;
    export const WarningAlertIcon: JSX.Element;
    export const CheckCircleAlertIcon: JSX.Element;
    export const ClipboardTextIcon: JSX.Element;
    export const XCircleAlertIcon: JSX.Element;
}

declare module 'saas_root/ApplicationEvents' {
    export function useApplicationEventsContext(): void;
    export function ApplicationEventsProvider(): void;
}
