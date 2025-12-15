import { Flex, Text } from "@chakra-ui/react";
import { CaretCircleRight } from "@phosphor-icons/react";
import React from "react";
import { formatValue } from "saas_root/Utils";

import { useLayoutsData } from "../../context/LayoutsData/LayoutsData.context";
import { useLayoutsSetup } from "../../context/LayoutsSetup/LayoutsSetup.context";
import { type StepsTypes } from "../../context/LayoutsSetup/LayoutsSetup.types";
import { getSectorFromZone } from "../../utils/gerenciarAmbientes";
import { parserLabelToName } from "../../utils/parserLabelToName";

// TODO: Este componente será futuramente importado do SaaS para garantir maior reutilização entre os micro-frontends. 
// No momento, ele utiliza dados mocados, mas será necessário reavaliar a lógica de obtenção dos dados no futuro, 
// uma vez que o formato e a integração com o back-end ainda não foram definidos.

interface ThumbnailTooltipProps {
  hoverIndexes: {
    index: number,
    zoneIndex: number,
  }
}

export function ThumbnailTooltip({ hoverIndexes }: ThumbnailTooltipProps) {
  const {
    setOpenAsideBar,
    updateIndex,
    updateZone,
    updateStep,
    updateSector,
  } = useLayoutsSetup();

  const { plotSpecsData, archProjectDict } = useLayoutsData();

  /**
   * - Se a área não tiver nenhum ambiente definido:
   *   - Label: "Definir ambiente"
   *   - Ao clicar, navegar para o step de definição de ambiente.
   * 
   * - Se a área já possuir um ambiente definido:
   *   - Label: "Mobiliar ambiente" (exibido em um tooltip)
   *   - Ao clicar, navegar para o step de mobiliar ambiente.
   * 
   * - Se a área já estiver mobiliada com uma solução:
   *   - Não exibir tooltip.
    */

  const { index, zoneIndex } = hoverIndexes;
  const plotData = plotSpecsData?.[index];
  const name = plotData?.name ?? parserLabelToName(plotData?.label) ?? `Ambiente ${zoneIndex}`;
  const area = plotData?.area;
  const hasEnvironment = Boolean(plotData?.name ?? parserLabelToName(plotData?.label));
  const nextStep: StepsTypes = hasEnvironment ? "programaArquitetonico" : "definirAmbiente";

  const handleClickTooltip = () => {
    updateIndex(index);
    setOpenAsideBar(true);
    updateStep(nextStep);

    if (!hasEnvironment) {
      updateZone(null);
      updateSector(undefined);
    } else {
      const zone = `/${plotData?.label?.split('/').slice(1, 3).join('/')}`;
      const sector = zone ? getSectorFromZone(zone, archProjectDict) : undefined;
      updateZone(zone);
      updateSector(sector);
    }
  };

  return (
    <Flex flexDirection="row" gap="20px" padding='20px' onClick={handleClickTooltip} cursor="pointer">
      <Flex flexDirection="column">
        <Text color="#1A202C" fontSize="12px" fontWeight={600}>
          {hasEnvironment ? "Mobiliar ambiente" : "Definir ambiente"}
        </Text>
        <Text color="#A0AEC0">
          {name} | {formatValue(area)}m²
        </Text>
      </Flex>
      <Flex>
        <CaretCircleRight color="#01AD6E" size={24} />
      </Flex>
    </Flex>
  )
}