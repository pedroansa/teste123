import { useParams } from 'react-router-dom';
import { useSolutions } from 'saas_root/Hooks';

import { useLayoutsData } from '../../context/LayoutsData/LayoutsData.context';
import { type PlotSpecsTypes } from '../../context/LayoutsData/LayoutsData.types';
import { type Ambiente } from '../../context/LayoutsSetup/LayoutsSetup.types';
import { useThumbnail } from '../useThumbnail';

export function useHandleSolutionData() {
    const {
        fetchUpdateSolution,
        fetchFindSolutionsWithParentId,
        fetchGetSpecifiedSolutionById,
        fetchGetAllSolutions,
    } = useSolutions();

    const { siteId, solutionId } = useParams();
    const { parentSolutionId, setSolutionData, archProjectData, archProjectDict } =
        useLayoutsData();

    const { updateThumbnailById } = useThumbnail();

    const parserLabelToName = (label: string | undefined): string | null => {
        if (!label || !archProjectDict) return null;

        const parsedLabel = `/${label.split('/').slice(1, 3).join('/')}`;

        for (const sectorData of Object.values(archProjectDict ?? {})) {
            const zoneOrSector = sectorData?.zones?.[parsedLabel] ?? archProjectDict?.[parsedLabel];

            if (zoneOrSector?.label) {
                return zoneOrSector.label;
            }
        }

        return null;
    };

    const handleUpdateSolution = async (payload: Record<string, unknown>) => {
        if (!siteId) return;

        if (!parentSolutionId && !solutionId) {
            return await fetchUpdateSolution.mutateAsync({
                siteId,
                payload,
            });
        } else {
            return await fetchUpdateSolution.mutateAsync({
                siteId,
                solutionId: solutionId ?? parentSolutionId,
                payload,
            });
        }
    };

    const handleFindSolutions = async (parameters: Record<string, unknown>) => {
        if (!siteId) return;

        if (!parentSolutionId && !solutionId) {
            return await fetchFindSolutionsWithParentId?.mutateAsync({
                siteId,
                parameters,
            });
        } else {
            return await fetchFindSolutionsWithParentId?.mutateAsync({
                siteId,
                parentSolutionId: solutionId ?? parentSolutionId,
                parameters,
            });
        }
    };

    const getSolutionData = async (siteId: string, solutionId: string) => {
        if (siteId && solutionId) {
            await fetchGetSpecifiedSolutionById
                .mutateAsync({ solutionId, siteId })
                .then((response) => {
                    // TODO: o payload da solution pode ser bem grande e não precisamos dele inteiro. principalmente do parametro "elements". filtrar.
                    setSolutionData(response.data);
                    void updateThumbnailById(solutionId, 'solution', response?.data?.updatedAt);
                });
        }
    };

    const payloadFindSolutions = (plotSpecs: PlotSpecsTypes[], ambiente: Ambiente) => {
        const filteredPlots = plotSpecs.filter(
            (plot) =>
                (plot.label?.includes('/zone') && plot.name) ||
                (plot.label?.includes('/zone') && !plot.label?.includes('Ambiente'))
        );

        const parsedPayload = filteredPlots.map((item: PlotSpecsTypes) => {
            const sendArchProg = item.label === plotSpecs?.[ambiente.index!].label;

            const zone = item.label?.split('/').slice(0, -1).join('/');
            const name = parserLabelToName(item.label!);

            return {
                current_hid: item.label,
                new_hid: item.zone || zone,
                name: item.name || name,
                fill_color: item.fill_color,
                archprog: sendArchProg ? archProjectData?.payload : undefined,
            };
        });

        return parsedPayload;
    };

    const fetchAllGeneratedSolutions = async (requestId: string) => {
        try {
            const { data: initialResponse } = await fetchGetAllSolutions?.mutateAsync({
                siteId,
                requestId,
                orderBy: 'features.SortKey',
                order: 'desc',
                includeFields: ['updatedAt'],
            });

            const { data: solutions } = initialResponse;

            return solutions;
        } catch (error) {
            console.error('Error fetching generated solutions:', error);
            return [];
        }
    };

    return {
        handleUpdateSolution,
        handleFindSolutions,
        getSolutionData,
        payloadFindSolutions,
        fetchAllGeneratedSolutions,
    };
}
