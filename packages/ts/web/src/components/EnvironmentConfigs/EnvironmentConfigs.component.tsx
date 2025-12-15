import { Box, Button, type ButtonProps, Divider, Flex, Text } from '@chakra-ui/react';
import { Dresser, PencilSimple, PlusCircle } from '@phosphor-icons/react';
import React from 'react';
import { formatValue } from 'saas_root/Utils';

import { useLayoutsData } from '../../context/LayoutsData/LayoutsData.context';
import { type PlotSpecsTypes } from '../../context/LayoutsData/LayoutsData.types';
import { useLayoutsSetup } from '../../context/LayoutsSetup/LayoutsSetup.context';
import { factoryValuesFromArchProg } from '../../factory';
import { getSectorFromZone } from '../../utils/gerenciarAmbientes';
import { getLabelAndValueFromClassPath, parserLabelToName } from '../../utils/parserLabelToName';

interface EnvironmentConfigsProps {
    ambientes: PlotSpecsTypes[];
    totalArea: number;
    hiddenButtons?: boolean;
}

interface ActionButtonProps extends ButtonProps {
    icon: React.ReactNode;
    text: string;
    onClick: () => void;
}

function ActionButton({ icon, text, onClick, ...props }: ActionButtonProps) {
    return (
        <Button
            alignItems="center"
            gap="4px"
            padding="4px 0px"
            bgColor="white"
            onClick={onClick}
            {...props}
        >
            {icon}
            <Text fontSize="12px">{text}</Text>
        </Button>
    );
}

export function EnvironmentConfigs({
    ambientes,
    totalArea,
    hiddenButtons,
}: EnvironmentConfigsProps) {
    const { updateIndex, updateZone, updateSector, updateStep } = useLayoutsSetup();

    const { setArchProjectData, archProjectData, archProjectDict, plotSpecsData } =
        useLayoutsData();

    const getAmbienteButtons = (ambiente: PlotSpecsTypes) => {
        if (!ambiente?.name && !parserLabelToName(ambiente?.label)) {
            return [
                <ActionButton
                    key="definir-ambiente"
                    icon={<PlusCircle color="#01AD6E" size={24} />}
                    text="Definir Ambiente"
                    onClick={() => {
                        updateIndex(ambiente?.originalIndex);
                        updateStep('definirAmbiente');
                        updateZone(null);
                        updateSector(undefined);
                    }}
                />,
            ];
        }

        const buttons = [];

        if (ambiente?.archprog) {
            buttons.push(
                <ActionButton
                    key="editar-mobiliario"
                    icon={<Dresser color="#01AD6E" size={24} />}
                    text="Editar Mobiliário"
                    disabled
                    onClick={() => {
                        if (ambiente?.archprog && ambiente?.zone && archProjectDict) {
                            const values = factoryValuesFromArchProg(ambiente?.archprog);

                            updateZone(ambiente?.zone);
                            updateSector(getSectorFromZone(ambiente?.zone, archProjectDict));
                            updateIndex(ambiente?.originalIndex);

                            setArchProjectData({
                                isValid: false,
                                values: values,
                                payload: ambiente.archprog,
                            });
                        }
                        updateStep('programaArquitetonico');
                    }}
                />
            );
        } else {
            if (!ambiente?.disabledArchProg) {
                buttons.push(
                    <ActionButton
                        key="mobiliar-ambiente"
                        icon={<PlusCircle color="#01AD6E" size={24} />}
                        text="Mobiliar Ambiente"
                        onClick={() => {
                            updateIndex(ambiente.originalIndex);
                            const zone = plotSpecsData
                                ? plotSpecsData[ambiente.originalIndex].label
                                      .split('/')
                                      .slice(0, -1)
                                      .join('/')
                                : null;
                            updateZone(ambiente.zone || zone);
                            updateSector(
                                ambiente.sector ||
                                    getSectorFromZone(
                                        ambiente.zone || zone || '',
                                        archProjectDict || {}
                                    )
                            );
                            updateStep('programaArquitetonico');
                        }}
                    />
                );
            }
            buttons.push(
                <ActionButton
                    key="alterar-ambiente"
                    icon={<PencilSimple color="#01AD6E" size={24} />}
                    text="Alterar Ambiente"
                    onClick={() => {
                        updateIndex(ambiente.originalIndex);
                        updateStep('definirAmbiente');
                        updateZone(ambiente.zone ?? null);
                        updateSector(ambiente.sector);
                    }}
                />
            );
        }

        return buttons;
    };

    return ambientes.map((ambiente) => {
        const name =
            ambiente?.name ??
            parserLabelToName(ambiente?.label) ??
            `Ambiente ${ambiente.zoneIndex}`;
        const percentage =
            totalArea && ambiente?.area ? Math.min((ambiente?.area / totalArea) * 100, 100) : 0;
        const hasArchProg = ambiente?.archprog && ambiente?.archprog?.length > 0;
        const shouldShowComponentsAfterGoingBack =
            archProjectData.payload.length > 0 || hasArchProg;

        return (
            <>
                <Flex flexDirection="column" gap="8px" w="100%" p="12px">
                    <Flex justifyContent="space-between">
                        <Text fontSize="14px" fontWeight={500} color="#292929">
                            {name}
                        </Text>
                        <Text fontSize="12px" fontWeight={500} color="#292929">
                            {formatValue(ambiente.area)}m²
                        </Text>
                    </Flex>

                    <Box
                        width="100%"
                        height="6px"
                        borderRadius="8px"
                        background={`linear-gradient(to right, ${ambiente.fill_color} ${percentage}%, #EDF2F7 ${percentage}%)`}
                    />

                    {hasArchProg && shouldShowComponentsAfterGoingBack && (
                        <Flex flexDirection="column">
                            {ambiente?.archprog?.map((item, index) => {
                                const mobilia = getLabelAndValueFromClassPath(item);

                                if (mobilia?.label && mobilia?.value && mobilia?.value > 0)
                                    return (
                                        <>
                                            <Flex
                                                justifyContent="space-between"
                                                flexDirection="row"
                                                key={`${mobilia?.label}_${index}`}
                                                padding="8px 0"
                                            >
                                                <Text
                                                    fontSize="14px"
                                                    fontWeight={500}
                                                    color="#718096"
                                                >
                                                    {mobilia?.label}
                                                </Text>
                                                <Text fontSize="12px" fontWeight={500}>
                                                    {mobilia?.value}
                                                </Text>
                                            </Flex>
                                            <Divider />
                                        </>
                                    );
                            })}
                        </Flex>
                    )}

                    {!hiddenButtons && (
                        <Flex justifyContent="space-between">{getAmbienteButtons(ambiente)}</Flex>
                    )}
                </Flex>
            </>
        );
    });
}
