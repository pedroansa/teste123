import { Flex } from '@chakra-ui/react';
import { SubtractSquare } from '@phosphor-icons/react';
import React from 'react';
import { formatValue } from 'saas_root/Utils';

import { EnvironmentCard } from '../../../../components/EnvironmentCard/EnvironmentCard.component';
import { EnvironmentConfigs } from '../../../../components/EnvironmentConfigs/EnvironmentConfigs.component';
import { useLayoutsData } from '../../../../context/LayoutsData/LayoutsData.context';
import { archProgAmbiente, ordenacaoAmbientes } from '../../../../utils/gerenciarAmbientes';

export function ConfigurarSolucao() {
    const { plotSpecsData, siteData, solutionData, archProjectData } = useLayoutsData();

    if (!plotSpecsData) return null;

    const filteredPlotSpecs = plotSpecsData
        .filter((spec) => spec.zoneIndex !== undefined)
        .sort(ordenacaoAmbientes);

    const ambientesWithArchprog = archProgAmbiente(
        filteredPlotSpecs,
        solutionData?.data?.archprog ?? archProjectData?.payload
    );

    const totalArea =
        siteData?.data?.processed_info?.find((elem) => elem.type === 'TotalArea')?.value ?? 0;

    return (
        <>
            <EnvironmentCard
                icon={<SubtractSquare size={40} color="#01AD6E" />}
                label="Área total"
                areaLabel={`${formatValue(totalArea)}m²`}
            >
                <Flex flexDirection="column" gap="12px">
                    <EnvironmentConfigs ambientes={ambientesWithArchprog} totalArea={totalArea} />
                </Flex>
            </EnvironmentCard>
        </>
    );
}
