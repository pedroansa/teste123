import { Flex, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { SubtractSquare } from '@phosphor-icons/react';
import React, { useEffect } from 'react';
import { ArchitecturalProject } from 'saas_root/Components';
import { useGlobalContext } from 'saas_root/Contexts';
import { formatValue } from 'saas_root/Utils';

import { EnvironmentCard } from '../../../../components/EnvironmentCard/EnvironmentCard.component';
import { useLayoutsData } from '../../../../context/LayoutsData/LayoutsData.context';
import {
    type ArchProgDictSectors,
    type ArchProgDictZones,
    type ArchprogPayloadTypes,
} from '../../../../context/LayoutsData/LayoutsData.types';
import { useLayoutsSetup } from '../../../../context/LayoutsSetup/LayoutsSetup.context';
import { useHandleSolutionData } from '../../../../hook';
import { useSolutionRegisterHandlers } from '../../../../hook/useSolutionRegisterHandlers';
import { EditarBlocos } from './components/EditarBlocos/EditarBlocos.component';

export function ProgramaArquitetonico() {
    const { ambiente, updateStep } = useLayoutsSetup();

    const {
        plotSpecsData,
        setArchProjectData,
        archProjectData,
        setPlotSpecsData,
        archProjectDict,
    } = useLayoutsData();

    const { setAlertModalIsOpen } = useGlobalContext();
    const { handleFindSolutions, payloadFindSolutions } = useHandleSolutionData();
    const { startEvents } = useSolutionRegisterHandlers();

    const getArchProgSchema = ({
        template,
        zone,
        sector,
    }: {
        template?: ArchProgDictZones | ArchProgDictSectors | null;
        zone?: string | null | undefined;
        sector?: string | null | undefined;
    }) => {
        if (!zone || !template) return;
        if (sector)
            return {
                sections: template?.[sector]?.zones[zone]?.sections ?? undefined,
            };

        return {
            sections: template?.[zone]?.sections ?? undefined,
        };
    };

    const schema = getArchProgSchema({
        template: archProjectDict,
        zone: ambiente?.zone,
        sector: ambiente?.sector,
    });

    useEffect(() => {
        if (archProjectData?.isValid && plotSpecsData && hasSubmitted) {
            setHasSubmitted(false);
            if (typeof ambiente.index === 'number') {
                const auxPlotSpecs = [...plotSpecsData];
                auxPlotSpecs[ambiente.index] = {
                    ...auxPlotSpecs[ambiente.index],
                    archprog: archProjectData.payload,
                };
                setPlotSpecsData(auxPlotSpecs);
            }

            setAlertModalIsOpen({
                open: true,
                title: 'Criando composições de mobiliário',
                description: 'Aguarde enquanto estamos mobiliando o ambiente.',
                loader: true,
            });

            const inputs = payloadFindSolutions(plotSpecsData, ambiente);

            handleFindSolutions({ inputs })
                .then((response) => {
                    const initialRequestId: string = response?.data?.requestId;
                    if (initialRequestId) {
                        startEvents(initialRequestId);
                        updateStep('selecionarSolucao');
                    }
                })
                .catch((err) => console.error(err));

            setArchProjectData((prev) => ({
                ...prev,
                isValid: false,
            }));
        }
    }, [archProjectData]);

    const [hasSubmitted, setHasSubmitted] = React.useState(false);

    return (
        <Flex flexDirection="column" h="100%">
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
            <Tabs colorScheme="gray">
                <TabList>
                    <Tab>Mobiliário</Tab>
                    <Tab>Editar blocos</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel pl={0} pr={0}>
                        <ArchitecturalProject
                            architecturalSchema={schema}
                            values={archProjectData?.values}
                            onSubmit={(
                                isValid: boolean,
                                values: Record<string, unknown>,
                                payload: ArchprogPayloadTypes[]
                            ) => {
                                setArchProjectData({ isValid, values, payload });
                                setHasSubmitted(true);
                            }}
                            submitLabel="Confirmar"
                        />
                    </TabPanel>
                    <TabPanel pl={0} pr={0}>
                        <EditarBlocos schema={schema} />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Flex>
    );
}
