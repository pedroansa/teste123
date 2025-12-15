/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useCallback, useState } from 'react';
import { useApplicationEventsContext } from 'saas_root/ApplicationEvents';
import { useGlobalContext } from 'saas_root/Contexts';
import { useMicrofrontendsContext, useSolutions } from 'saas_root/Hooks';
import { WarningCircleAlertIcon } from 'saas_root/Icons';

import { type FileExportSucceededData } from '../LayoutSolutions.types';

const EVT = {
    FILE_EXPORT_SUCCEEDED: 'FILE_EXPORT_SUCCEEDED' as const,
    FILE_EXPORT_FAILED: 'FILE_EXPORT_FAILED' as const,
};

export function useIFCExport() {
    const { fetchExportSolution } = useSolutions();
    const { registerHandler, unregisterHandlersByType } = useApplicationEventsContext();
    const [ifcFileExported, setIfcFileExported] = useState<File | null>(null);

    const { setAlertModalIsOpen } = useGlobalContext();

    const {
        features: { exportSolution },
    } = useMicrofrontendsContext();

    const fetchSolutionExport = async (solutionId: string, siteId: string) => {
        const target = exportSolution?.LAYOUT?.IFC?.target;

        try {
            await fetchExportSolution.mutateAsync({
                solutionId,
                siteId,
                outputFormat: 'IFC',
                ...(target ? { target } : {}),
            });
        } catch (error) {
            console.error('Erro ao exportar solução:', error);
        }
    };

    const unregisterConversionEvents = useCallback(() => {
        unregisterHandlersByType(EVT.FILE_EXPORT_SUCCEEDED);
        unregisterHandlersByType(EVT.FILE_EXPORT_FAILED);
    }, [unregisterHandlersByType]);

    const onErrorEventHandler = useCallback(
        ({ errors }: { errors: string }) => {
            setAlertModalIsOpen({
                open: true,
                title: 'Não foi possível realizar a conversão do seu arquivo',
                description:
                    errors ||
                    'Seu arquivo não pode ser convertido. Verifique a sua solução e tente novamente.',
                icon: WarningCircleAlertIcon,
                textCancel: 'Fechar',
                onCancel: () => {
                    setAlertModalIsOpen({ open: false });
                },
            });
        },
        [setAlertModalIsOpen]
    );

    const onFileExportSucceededHandler = useCallback(
        async ({ outputFileDownloadSignedUrl }: FileExportSucceededData) => {
            try {
                const response = await fetch(outputFileDownloadSignedUrl);
                const blob = await response.blob();

                const file = new File([blob], 'modelo-exportado.ifc', {
                    type: 'application/octet-stream',
                });
                setIfcFileExported(file);
            } catch (error) {
                console.error('❌ Erro ao baixar IFC:', error);
            }
        },
        []
    );

    const startExportEvents = useCallback(() => {
        registerHandler(EVT.FILE_EXPORT_SUCCEEDED, onFileExportSucceededHandler);

        // evento de erro
        registerHandler(EVT.FILE_EXPORT_FAILED, onErrorEventHandler);
    }, [registerHandler, onFileExportSucceededHandler, onErrorEventHandler]);

    return {
        unregisterConversionEvents,
        startExportEvents,
        fetchSolutionExport,
        ifcFileExported,
    };
}
