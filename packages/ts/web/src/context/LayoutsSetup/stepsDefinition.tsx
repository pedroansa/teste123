import { Dresser, NotePencil, SelectionAll, SlidersHorizontal, Target } from "@phosphor-icons/react";
import React from "react";

import {
  ConfigurarSolucao,
  DefinirAmbiente,
  ProgramaArquitetonico,
  SelecionarSolucao,
} from "../../containers/LayoutSolutions/steps";
import { FinalizarConfiguracao } from "../../containers/LayoutSolutions/steps/FinalizarConfiguracao/FinalizarConfiguracao.component";
import { type Step, type StepsTypes } from "./LayoutsSetup.types";

export const steps: Record<StepsTypes, Step> = {
  definirAmbiente: {
    step: 1,
    label: 'Definir ambiente',
    icon: <SelectionAll size={28} />,
    id: 'definirAmbiente',
    component: <DefinirAmbiente />,
    tooltipLabel: 'Definir ambiente',
  },
  configurarSolucao: {
    step: 2,
    label: 'Configurar solução',
    icon: <NotePencil size={28} />,
    id: 'configurarSolucao',
    component: <ConfigurarSolucao />,
    tooltipLabel: 'Mobiliar ambiente',
  },
  programaArquitetonico: {
    step: 3,
    label: 'Programa arquitetônico',
    icon: <SlidersHorizontal size={28} />,
    id: 'programaArquitetonico',
    component: <ProgramaArquitetonico />,
    tooltipLabel: 'Mobiliar ambiente',
  },
  selecionarSolucao: {
    step: 4,
    label: 'Composições de mobiliário',
    icon: <Dresser size={28} />,
    id: 'selecionarSolucao',
    component: <SelecionarSolucao />,
  },
  finalizarConfiguracao: {
    step: 5,
    label: 'Índices',
    icon: <Target size={28} />,
    id: 'finalizarConfiguracao',
    component: <FinalizarConfiguracao />
  }
};