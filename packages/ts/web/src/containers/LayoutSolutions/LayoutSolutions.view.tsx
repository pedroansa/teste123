/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Flex } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AsideBar, NavigationControls, NotificationBar } from 'saas_root/Components';
import { AsideBarProvider, useGlobalContext } from 'saas_root/Contexts';
import { useFiles, useGetArchitectureParametersTemplate, useSolutions } from 'saas_root/Hooks';
import { WarningAlertIcon } from 'saas_root/Icons';

import { useLayoutsData } from '../../context/LayoutsData/LayoutsData.context';
import { type Site } from '../../context/LayoutsData/LayoutsData.types';
import { useLayoutsSetup } from '../../context/LayoutsSetup/LayoutsSetup.context';
import { StepsTypes } from '../../context/LayoutsSetup/LayoutsSetup.types';
import { useHandleSolutionData, useThumbnail } from '../../hook';
import ThumbnailBoxSolution from './components/ThumbnailBoxSolution/ThumbnailBoxSolution.component';
import { StepBackConfig, type ApiResponse } from './LayoutSolutions.types';

export default function LayoutSolutions() {
    const { setAlertModalIsOpen } = useGlobalContext();
    const { getSiteById } = useFiles();
    const { fetchFavoriteSolution } = useSolutions();
    const { getAllTemplates, getTemplateById } = useGetArchitectureParametersTemplate();

    const { siteId, solutionId } = useParams();

    const { updateStep, openAsideBar, setOpenAsideBar, currentStep, setAmbiente, ambiente } =
        useLayoutsSetup();

    const {
        siteData,
        setSiteData,
        parentSolutionId,
        setArchProjectData,
        setPreviewPlotSpecsData,
        setArchProjectDict,
        setArchProjectTemplate,
    } = useLayoutsData();

    const { updateThumbnailById } = useThumbnail();
    const { getSolutionData } = useHandleSolutionData();
    const navigate = useNavigate();

    const tabsAside = [{ label: currentStep.label, icon: currentStep.icon }];

    useEffect(() => {
        if (siteId)
            getSiteById(siteId).then((response: ApiResponse<Site>) => {
                if (response?.data) {
                    setSiteData(response.data);
                    if (!solutionId)
                        void updateThumbnailById(siteId, 'site', response?.data?.updatedAt);
                }
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [siteId, getSiteById, setSiteData]);

    useEffect(() => {
        if (siteId && solutionId && !parentSolutionId) {
            void getSolutionData(siteId, solutionId);
            updateStep('finalizarConfiguracao');
            setOpenAsideBar(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [siteId, solutionId, parentSolutionId]);

    useEffect(() => {
        if (parentSolutionId && !siteData) {
            navigate(`../../new-solutions`, { relative: 'path' });
        }
    }, [parentSolutionId, siteData, navigate]);

    const backButtonDisabled = fetchFavoriteSolution.isSuccess;

    const backAlertsByStep: Record<StepsTypes, StepBackConfig> = {
        configurarSolucao: {
            modal: {
                title: 'Tem certeza que deseja voltar?',
                description:
                    'Você sairá da configuração da solução e retornará para "Meus projetos". Todas as alterações serão perdidas.',
                icon: WarningAlertIcon,
                textSubmit: 'Voltar',
                submitDangerous: true,
                onSubmit: () => {
                    navigate('/projects');
                },
            },
        },
        definirAmbiente: {
            modal: {
                title: 'Tem certeza que deseja voltar?',
                description:
                    ' Você selecionou um ambiente que ainda não foi confirmado. Se sair agora, essa seleção será perdida.',
                icon: WarningAlertIcon,
                textSubmit: 'Voltar',
                submitDangerous: true,
                onSubmit: () => {
                    setPreviewPlotSpecsData(null);
                    updateStep('configurarSolucao');
                    setAmbiente({
                        index: null,
                        zone: null,
                        sector: undefined,
                        solutions: [],
                        selectedSolution: undefined,
                    });
                },
            },
            onBackClick: () => {
                setPreviewPlotSpecsData(null);
                updateStep('configurarSolucao');
            },
        },
        programaArquitetonico: {
            modal: {
                title: 'Tem certeza que deseja voltar?',
                description: 'As informações preenchidas serão perdidas.',
                icon: WarningAlertIcon,
                textSubmit: 'Voltar',
                submitDangerous: true,
                onSubmit: () => {
                    updateStep('configurarSolucao');
                },
            },
        },
        selecionarSolucao: {
            modal: {
                title: 'Tem certeza que deseja voltar?',
                description: 'Todas as soluções geradas para este ambiente serão perdidas.',
                icon: WarningAlertIcon,
                textSubmit: 'Voltar',
                submitDangerous: true,
                onSubmit: () => {
                    setArchProjectData({
                        values: {},
                        payload: [],
                        isValid: false,
                        environments: {},
                    });
                    updateStep('configurarSolucao');
                },
            },
        },
        finalizarConfiguracao: {
            onBackClick: () => {
                navigate(`/layouts/${siteId}/solutions`);
            },
        },
    };

    const handleBackClick = () => {
        const stepConfig = backAlertsByStep[currentStep.id];
        const isDefinirAmbiente = currentStep.id === 'definirAmbiente';
        const hasZone = ambiente.zone !== null;

        if (!hasZone && isDefinirAmbiente) {
            stepConfig.onBackClick?.();
        } else if (!hasZone && !isDefinirAmbiente && stepConfig.onBackClick) {
            stepConfig.onBackClick();
        } else if (stepConfig.modal) {
            const { modal } = stepConfig;
            setAlertModalIsOpen({
                open: true,
                submitDangerous: modal.submitDangerous,
                title: modal.title,
                description: modal.description,
                icon: modal.icon,
                textSubmit: modal.textSubmit,
                textCancel: 'Fechar',
                onCancel: () => {},
                onSubmit: () => modal.onSubmit?.(),
            });
        }
    };

    useEffect(() => {
        const { data: allTemplates } = getAllTemplates || {};
        const hasTemplates = allTemplates?.data?.length;
        const firstTemplateId = hasTemplates ? allTemplates?.data[0]?.id : null;

        if (hasTemplates) {
            if (firstTemplateId) {
                getTemplateById
                    .mutateAsync({ templateId: firstTemplateId })
                    .then(({ data: templateData }) => {
                        setArchProjectTemplate(templateData);
                        setArchProjectDict(templateData?.dict);
                    })
                    .catch((e) => {
                        console.error('Erro ao requisitar o template padrão de PA', e);
                    });
            }
        } else if (hasTemplates === 0) {
            setAlertModalIsOpen({
                open: true,
                submitDangerous: false,
                title: 'Formulário do programa arquitetônico não localizado.',
                description: 'Caso entenda ser necessário, entre em contato com o nosso suporte.',
                icon: WarningAlertIcon,
                textCancel: 'Fechar',
                textSubmit: 'Contatar suporte',
                onSubmit: () => {
                    window.open(
                        'https://docs.google.com/forms/d/e/1FAIpQLSd2HcGPorzojJgkdbIuMwVxLgdEzMuVK0LqDf76a-33P-8Gkw/viewform',
                        '_blank'
                    );
                    navigate('/projects');
                },
                onCancel: () => navigate('/projects'),
            });
        }
    }, [getAllTemplates.data]);

    return (
        <AsideBarProvider>
            <AsideBar tabs={tabsAside} isOpen={openAsideBar} openToggle={setOpenAsideBar}>
                {currentStep?.component}
            </AsideBar>
            <Flex flexDirection="column">
                <NavigationControls
                    title={siteData?.name}
                    advanceButton={{
                        label: 'Finalizar configuração',
                        disabled: !parentSolutionId,
                        visibility:
                            currentStep.id === 'finalizarConfiguracao' ? 'hidden' : 'visible',
                        onClick: () => {
                            setAlertModalIsOpen({
                                open: true,
                                submitDangerous: false,
                                title: 'Está pronto para finalizar sua solução?',
                                description:
                                    'Não se preocupe, você poderá voltar e editar a qualquer momento, se necessário.',
                                icon: WarningAlertIcon,
                                textSubmit: 'Confirmar',
                                textCancel: 'Fechar',
                                onCancel: () => {},
                                onSubmit: () => {
                                    if (siteData?.id && parentSolutionId) {
                                        updateStep('finalizarConfiguracao');
                                        fetchFavoriteSolution.mutateAsync({
                                            siteId,
                                            solutionId: parentSolutionId,
                                            favorited: true,
                                        });
                                        navigate(
                                            `/layouts/${siteData?.id}/solutions/${parentSolutionId}`,
                                            { replace: false }
                                        );
                                        void getSolutionData(siteData?.id, parentSolutionId);
                                    }
                                },
                            });
                        },
                    }}
                    backButton={{
                        hasIcon: true,
                        disabled: backButtonDisabled,
                        onClick: handleBackClick,
                    }}
                    mb="24px"
                />
                {!(
                    currentStep.id === 'selecionarSolucao' ||
                    currentStep.id === 'finalizarConfiguracao'
                ) && (
                    <NotificationBar
                        title="Fique atento!"
                        description="Para obter melhores resultados no posicionamento do mobiliário, é fundamental definir
              o ambiente desejado e suas áreas adjacentes antes de avançar"
                        icon={'warning'}
                        mb="24px"
                    />
                )}
                <ThumbnailBoxSolution />
            </Flex>
        </AsideBarProvider>
    );
}
