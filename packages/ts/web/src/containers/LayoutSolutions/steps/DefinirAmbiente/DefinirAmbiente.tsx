import { Button, Flex } from "@chakra-ui/react";
import { SubtractSquare } from "@phosphor-icons/react";
import React from "react";
import { formatValue } from "saas_root/Utils";
import { useGlobalContext } from "saas_root/Contexts";
import { WarningAlertIcon } from "saas_root/Icons";

import { EnvironmentCard } from "../../../../components/EnvironmentCard/EnvironmentCard.component";
import { useLayoutsData } from "../../../../context/LayoutsData/LayoutsData.context";
import { useLayoutsSetup } from "../../../../context/LayoutsSetup/LayoutsSetup.context";
import { EnvironmentSelection } from "./components/EnvironmentSelection/EnvironmentSelection.component";

export function DefinirAmbiente() {
  const { ambiente, updateStep, missingDependencies } = useLayoutsSetup();
  const { plotSpecsData, previewPlotSpecsData, confirmPlotSpecsUpdate } = useLayoutsData();
  const { setAlertModalIsOpen } = useGlobalContext();

  const currentPlotSpecs = previewPlotSpecsData || plotSpecsData;

  const formatAlertMessage = (dependencies: string[]) => {
    if (dependencies.length == 0) {
      return ""
    }

    const prefix = "O ambiente selecionado requer outros ambientes definidos: "
    const sufix = ". Por favor, adicione essas dependências antes de continuar."

    if (dependencies.length == 1) {
      return prefix.concat(`${missingDependencies[0]}`).concat(sufix)
    }

    return prefix.concat(`${missingDependencies.slice(0, -1).join(", ")} e ${missingDependencies.at(-1)}`).concat(sufix)
  }

  const handleConfirm = () => {
    confirmPlotSpecsUpdate();

    if (missingDependencies.length > 0) {
      setAlertModalIsOpen({
        open: true,
        submitDangerous: false,
        title: 'Dependências necessárias',
        description: formatAlertMessage(missingDependencies),
        icon: WarningAlertIcon,
        textSubmit: 'Adicionar dependência',
        onSubmit: () => {
          setAlertModalIsOpen({ open: false });
        },
      });
    }
    updateStep('configurarSolucao');
  };

  return (
    <Flex flexDirection="column" h="100%">
      <EnvironmentCard
        icon={<SubtractSquare size={40} color="#01AD6E" />}
        label={
          typeof ambiente?.index === "number"
            ? `Ambiente ${currentPlotSpecs?.[ambiente.index].zoneIndex}`
            : "Selecione um ambiente"
        }
        areaLabel={
          currentPlotSpecs?.[ambiente.index!]?.area
            ? `${formatValue(currentPlotSpecs[ambiente.index!].area)}m²`
            : "Área do ambiente"
        }
      />
      <EnvironmentSelection />
      <Button
        w="100%"
        variant="quaternary"
        fontSize="14px"
        fontWeight="600"
        type="submit"
        mt="auto"
        onClick={handleConfirm}
        isDisabled={!ambiente.zone || typeof ambiente.index !== "number" }
      >
        Confirmar
      </Button>
    </Flex>
  );
}
