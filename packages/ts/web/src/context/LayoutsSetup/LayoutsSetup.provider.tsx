import React, { useEffect, useMemo, useState } from 'react';

import { getDependenciesFromZone } from '../../utils/gerenciarAmbientes';
import { useLayoutsData } from '../LayoutsData/LayoutsData.context';
import { LayoutsSetupContext } from './LayoutsSetup.context';
import {
    SolutionIds,
    type Ambiente,
    type LayoutsSetupProviderProps,
    type Step,
    type StepsTypes,
} from './LayoutsSetup.types';
import { steps } from './stepsDefinition';

export const LayoutsSetupProvider = ({ children }: LayoutsSetupProviderProps) => {
    const { plotSpecsData, setPreviewPlotSpecsData, archProjectDict } = useLayoutsData();

    const [openAsideBar, setOpenAsideBar] = useState(true);
    const [currentStep, setCurrentStep] = useState<Step>(steps.configurarSolucao);
    const [missingDependencies, setMissingDependencies] = useState<string[]>([]);
    const updateStep = (newStep: StepsTypes) => setCurrentStep(steps[newStep]);

    const [ambiente, setAmbiente] = useState<Ambiente>({
        index: null,
        zone: null,
        sector: undefined,
        solutions: [],
        selectedSolution: undefined,
        selectedUpdatedAt: undefined,
        dependencies: [],
    });

    const updateIndex = (newIndex: number) =>
        setAmbiente((prevState) => ({ ...prevState, index: newIndex }));

    const updateZone = (newZone: string | undefined | null) => {
        const dependencies = newZone
            ? (getDependenciesFromZone(newZone, archProjectDict) ?? [])
            : [];
        return setAmbiente((prevState) => ({ ...prevState, zone: newZone, dependencies }));
    };
    const updateSector = (newSector: string | undefined | null) =>
        setAmbiente((prevState) => ({ ...prevState, sector: newSector }));
    const updateSolutions = (solutionsIds: SolutionIds[]) =>
        setAmbiente((prevState) => {
            return { ...prevState, solutions: solutionsIds };
        });
    const updateSelectedSolution = (newSolutionId: string, updatedAt: string) =>
        setAmbiente((prevState) => ({
            ...prevState,
            selectedSolution: newSolutionId,
            selectedUpdatedAt: updatedAt,
        }));

    useEffect(() => {
        const definedEnvironments = plotSpecsData?.filter((d) => d.zone).map((d) => d.zone);
        const newMissingDependencies =
            ambiente.dependencies
                ?.filter((dependency) => !definedEnvironments?.includes(dependency.id))
                .map((dep) => dep.label) ?? [];

        setMissingDependencies(newMissingDependencies);

        if (ambiente.zone && archProjectDict) {
            const zone = ambiente?.sector
                ? archProjectDict?.[ambiente.sector]?.zones?.[ambiente?.zone]
                : archProjectDict[ambiente?.zone];

            if (zone && plotSpecsData && typeof ambiente.index === 'number') {
                const auxPlotSpecs = [...plotSpecsData];
                auxPlotSpecs[ambiente.index] = {
                    ...auxPlotSpecs[ambiente.index],
                    name: zone.label,
                    fill_color: zone.color,
                    disabledArchProg: zone?.disabledArchProg,
                    zone: ambiente.zone,
                    sector: ambiente.sector,
                };
                setPreviewPlotSpecsData(auxPlotSpecs);
            }
        }
    }, [ambiente, plotSpecsData]);

    const contextValue = useMemo(
        () => ({
            openAsideBar,
            setOpenAsideBar,
            ambiente,
            setAmbiente,
            updateIndex,
            updateZone,
            updateSector,
            updateSolutions,
            updateSelectedSolution,
            currentStep,
            setCurrentStep,
            updateStep,
            missingDependencies,
        }),
        [openAsideBar, ambiente, currentStep, missingDependencies]
    );

    return (
        <LayoutsSetupContext.Provider value={contextValue}>{children}</LayoutsSetupContext.Provider>
    );
};
