import React, { useMemo, useState } from 'react';
import { LayoutsDataContext } from './LayoutsData.context';
import {
    type ArchProjectDictType,
    type ArchProjectData,
    type LayoutsDataProviderProps,
    type PlotSpecsTypes,
    type Site,
    type Solution,
    type ArchProjectTemplate,
} from './LayoutsData.types';

export const LayoutsDataProvider = ({ children }: LayoutsDataProviderProps) => {
    const [plotSpecsData, setPlotSpecsData] = useState<PlotSpecsTypes[] | null>(null);
    const [previewPlotSpecsData, setPreviewPlotSpecsData] = useState<PlotSpecsTypes[] | null>(null);
    const [parentSolutionId, setParentSolutionId] = useState('');

    const [siteData, setSiteData] = useState<Site | null>(null);
    const [solutionData, setSolutionData] = useState<Solution | null>(null);
    const [archProjectData, setArchProjectData] = useState<ArchProjectData>({
        values: {},
        payload: [],
        isValid: false,
        environments: {},
    });

    const [archProjectDict, setArchProjectDict] = useState<ArchProjectDictType>({});
    const [archProjectTemplate, setArchProjectTemplate] = useState<ArchProjectTemplate | null>(null);

    const confirmPlotSpecsUpdate = () => {
        setPlotSpecsData(previewPlotSpecsData!);
    };

    const contextValue = useMemo(
        () => ({
            archProjectData,
            plotSpecsData,
            setPlotSpecsData,
            parentSolutionId,
            setParentSolutionId,
            setArchProjectData,
            siteData,
            setSiteData,
            solutionData,
            setSolutionData,
            previewPlotSpecsData,
            setPreviewPlotSpecsData,
            confirmPlotSpecsUpdate,
            archProjectDict,
            setArchProjectDict,
            archProjectTemplate,
            setArchProjectTemplate,
        }),
        [
            plotSpecsData,
            parentSolutionId,
            archProjectData,
            siteData,
            solutionData,
            previewPlotSpecsData,
            archProjectDict,
            archProjectTemplate,
        ]
    );

    return (
        <LayoutsDataContext.Provider value={contextValue}>{children}</LayoutsDataContext.Provider>
    );
};
