import { type ReactNode } from 'react';

export interface LayoutsSetupProviderProps {
    children: ReactNode;
}

export interface SolutionIds {
    id: string;
    updatedAt: string;
}

export interface Ambiente {
    index: number | null;
    zone: string | undefined | null;
    sector: string | undefined | null;
    solutions: SolutionIds[] | [];
    selectedSolution: string | undefined;
    selectedUpdatedAt: string | undefined;
    dependencies?: {
        id: string;
        label: string;
    }[];
}

export interface Step {
    step: number;
    label: string;
    icon: JSX.Element;
    id: StepsTypes;
    component?: JSX.Element;
    tooltipLabel?: string;
}

export type StepsTypes =
    | 'definirAmbiente'
    | 'configurarSolucao'
    | 'programaArquitetonico'
    | 'selecionarSolucao'
    | 'finalizarConfiguracao';

export interface LayoutsSetupContextTypes {
    openAsideBar: boolean;
    setOpenAsideBar: React.Dispatch<React.SetStateAction<boolean>>;
    ambiente: Ambiente;
    setAmbiente: React.Dispatch<React.SetStateAction<Ambiente>>;
    updateIndex: (index: number) => void;
    updateZone: (
        zone: string | undefined | null,
        dependencies?: { id: string; label: string }[]
    ) => void;
    updateSector: (sector: string | undefined | null) => void;
    updateSolutions: (solutionIds: SolutionIds[]) => void;
    updateSelectedSolution: (solutionId: string, updatedAt: string) => void;
    currentStep: Step;
    setCurrentStep: React.Dispatch<React.SetStateAction<Step>>;
    updateStep: (newStep: StepsTypes) => void;
    missingDependencies: string[];
}
