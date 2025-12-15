import { useApplicationEventsContext } from 'saas_root/ApplicationEvents';
import { useGlobalContext } from 'saas_root/Contexts';
import { XCircleAlertIcon } from 'saas_root/Icons';

import { useLayoutsSetup } from '../../context/LayoutsSetup/LayoutsSetup.context';
import { useHandleSolutionData } from '../useHandleSolutionData';

export function useSolutionRegisterHandlers() {
    const { setAmbiente, updateSolutions } = useLayoutsSetup();

    const { setAlertModalIsOpen } = useGlobalContext();
    const { registerHandler, unregisterHandlersByType } = useApplicationEventsContext();
    const { fetchAllGeneratedSolutions } = useHandleSolutionData()

    const startEvents = (initialRequestId: string) => {
        setAmbiente(p => ({ ...p, solutions: [], selectedSolution: undefined }))

        registerHandler(
            'INVALID_SOLUTION_REQUESTED',
            (response) => {
                console.log('invalid response', response);
                unregisterHandlersByType('SOLUTION_CREATED');
                unregisterHandlersByType('FIND_SOLUTIONS_FINISHED');
            },
            true
        );

        registerHandler(
            'FIND_SOLUTIONS_FINISHED',
            ({ solutions_found }: { solutions_found: number }) => {
                if (solutions_found === 0) {
                    setAlertModalIsOpen({
                        open: true,
                        submitDangerous: false,
                        title: 'Não foi possível gerar composições de mobiliário com os parâmetros inseridos',
                        description:
                            'Tente ajustar o programa arquitetônico e gerar novamente.',
                        icon: XCircleAlertIcon,
                        textCancel: 'Voltar',
                        onCancel: () => setAlertModalIsOpen({ open: false }),
                    });
                } else {
                    fetchAllGeneratedSolutions(initialRequestId)
                        .then((data) => {
                            updateSolutions(data);
                            setAlertModalIsOpen({ open: false });
                        })
                    .catch((err) => console.error('error', err));
                }
                unregisterHandlersByType('SOLUTION_CREATED');
            },
            true
        );
    };
    
    return { startEvents };
}
