import { Button, Flex } from '@chakra-ui/react';
import { PencilSimple, PlusCircle, SlidersHorizontal, SubtractSquare } from '@phosphor-icons/react';
import React, { useRef, useState } from 'react';
import { DrawDwg } from 'saas_root/Components';
import { formatValue } from 'saas_root/Utils';

import { useGlobalContext } from 'saas_root/Contexts';
import { WarningAlertIcon } from 'saas_root/Icons';
import { analytics } from 'saas_root/Services';
import { EnvironmentCard } from '../../../../components/EnvironmentCard/EnvironmentCard.component';
import { useLayoutsData } from '../../../../context/LayoutsData/LayoutsData.context';
import { useLayoutsSetup } from '../../../../context/LayoutsSetup/LayoutsSetup.context';
import { useThumbnail } from '../../../../hook';
import { useGetThumbnailApiUrl } from '../../../../utils/getThumbnailApiUrl';

export function SelecionarSolucao() {
    const { updateStep, ambiente, setAmbiente, updateSelectedSolution } = useLayoutsSetup();

    const { setParentSolutionId, plotSpecsData, setPreviewPlotSpecsData, solutionData } =
        useLayoutsData();

    const { setAlertModalIsOpen } = useGlobalContext();

    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const { updateThumbnailById } = useThumbnail();

    const wrapperRef = useRef<HTMLDivElement>(null);
    const thumbnailApiUrl = useGetThumbnailApiUrl();

    const [numberOfSolutions, setNumberOfSolutions] = useState(10);

    const selectSolution = async (selectedId: string) => {
        await updateThumbnailById(selectedId, 'solution', solutionData?.updatedAt);
        setParentSolutionId(selectedId);
        updateStep('configurarSolucao');
        setAmbiente({
            index: null,
            zone: null,
            sector: undefined,
            solutions: [],
            selectedSolution: undefined,
            selectedUpdatedAt: undefined,
        });
    };

    return (
        <Flex flexDirection="column" height="100%">
            <Flex flexDirection="column" gap="24px">
                <EnvironmentCard
                    icon={<SubtractSquare size={40} color="#01AD6E" />}
                    label={
                        typeof ambiente?.index === 'number'
                            ? plotSpecsData?.[ambiente.index]?.name!
                            : 'Mobiliar Ambiente'
                    }
                    areaLabel={
                        plotSpecsData?.[ambiente.index!]?.area
                            ? `${formatValue(plotSpecsData[ambiente.index!].area)}m²`
                            : 'Área do ambiente'
                    }
                />

                <EnvironmentCard
                    icon={<SlidersHorizontal size={40} color="#01AD6E" />}
                    cursor="pointer"
                    label="Programa arquitetônico"
                    onClick={() =>
                        setAlertModalIsOpen({
                            open: true,
                            submitDangerous: false,
                            title: 'Você deseja editar o programa arquitetônico?',
                            description:
                                'Todas as soluções geradas com a configuração atual serão descartadas.',
                            icon: WarningAlertIcon,
                            textSubmit: 'Continuar',
                            textCancel: 'Fechar',
                            onCancel: () => {},
                            onSubmit: () => updateStep('programaArquitetonico'),
                        })
                    }
                    rightElement={
                        <Flex flex="auto" alignItems="center" justifyContent="center">
                            <PencilSimple size={32} color="#718096" weight="thin" />
                        </Flex>
                    }
                />

                {/**
                 * Altura máxima calculada com base na altura total da tela(100vh)
                 * menos a soma das alturas dos elementos da tela
                 */}
                <Flex flexDirection="column" gap="12px" maxH="calc(100vh - 444px)" overflowY="auto">
                    {ambiente?.solutions?.map((item, index) =>
                        index < numberOfSolutions ? (
                            <Flex
                                key={index}
                                p="12px 16px"
                                borderRadius="12px"
                                height="176px"
                                border={
                                    selectedIndex === index
                                        ? '1px solid #01AD6E'
                                        : '1px solid #E2E8F0'
                                }
                                onClick={() => {
                                    setSelectedIndex(index);
                                    updateSelectedSolution(item.id, item.updatedAt);
                                }}
                                cursor="pointer"
                                ref={wrapperRef}
                            >
                                <DrawDwg
                                    id={item.id}
                                    queryCache={item.updatedAt}
                                    api={thumbnailApiUrl}
                                    entity="solution"
                                    height={150}
                                    wrapperContext={{
                                        ref: wrapperRef,
                                        padding: 32,
                                    }}
                                />
                            </Flex>
                        ) : null
                    )}
                    {numberOfSolutions === 10 && ambiente?.solutions?.length > 0 && (
                        <Button
                            w="100%"
                            variant="tertiary"
                            fontSize="14px"
                            type="button"
                            mt="12px"
                            mb="12px"
                            gap="8px"
                            onClick={() => {
                                setNumberOfSolutions(20);

                                analytics.trackEvent({
                                    eventName: 'load_more_solutions',
                                    element: 'button',
                                    location: 'solution_list_footer',
                                    trigger: 'user',
                                    properties: {
                                        product: 'layouts',
                                    },
                                });
                            }}
                        >
                            <PlusCircle size={24} color="#01AD6E" />
                            Carregar mais
                        </Button>
                    )}
                </Flex>
            </Flex>
            <Button
                w="100%"
                variant="quaternary"
                fontSize="14px"
                fontWeight="600"
                type="submit"
                mt="auto"
                disabled={!ambiente.selectedSolution}
                onClick={() => {
                    if (ambiente.selectedSolution) {
                        void selectSolution(ambiente.selectedSolution);
                    }
                    setPreviewPlotSpecsData(null);
                }}
            >
                Confirmar
            </Button>
        </Flex>
    );
}
