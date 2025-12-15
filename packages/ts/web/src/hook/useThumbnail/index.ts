import { useFiles } from 'saas_root/Hooks';

import { type ApiResponse } from '../../containers/LayoutSolutions/LayoutSolutions.types';
import { useLayoutsData } from '../../context/LayoutsData/LayoutsData.context';
import { PlotSpecsTypes } from '../../context/LayoutsData/LayoutsData.types';
import { useGetThumbnailApiUrl } from '../../utils/getThumbnailApiUrl';

export interface GenerateThumbnailData {
    id: string;
    entity: 'site' | 'solution';
    exclusiveApi?: string;
    queryCache?: string;
}

export const useThumbnail = () => {
    const { generateThumbnail } = useFiles();
    const thumbnailApiUrl = useGetThumbnailApiUrl();
    const { setPlotSpecsData } = useLayoutsData();

    const updateThumbnailById = async (
        id: string,
        entity: 'site' | 'solution',
        updatedAt: string,
        retries = 2,
        retryDelay = 1000
    ): Promise<PlotSpecsTypes[] | null> => {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const response: ApiResponse<PlotSpecsTypes[]> = await generateThumbnail.mutateAsync(
                    {
                        id,
                        entity,
                        exclusiveApi: thumbnailApiUrl,
                        queryCache: updatedAt,
                    } as GenerateThumbnailData
                );

                if (response?.data) {
                    let zoneCounter = 1;

                    const updatedData = response.data.map((item) => {
                        if (item.label.includes('/zone')) {
                            return {
                                ...item,
                                zoneIndex: zoneCounter++,
                            };
                        }
                        return item;
                    });

                    const sortedZoneItems = updatedData
                        .filter((item) => item.zoneIndex !== undefined)
                        .sort((a, b) => {
                            if (a.name && !b.name) return -1;
                            if (!a.name && b.name) return 1;
                            return 0;
                        });

                    const nonZoneItems = updatedData.filter((item) => item.zoneIndex === undefined);

                    const finalData = [...sortedZoneItems, ...nonZoneItems].map((item, index) => ({
                        ...item,
                        originalIndex: index,
                    }));

                    setPlotSpecsData(finalData);
                    return updatedData;
                }
            } catch (error) {
                console.error('Failed to update thumbnail:', error);
            }

            if (attempt < retries) {
                await new Promise((resolve) => setTimeout(resolve, retryDelay));
            }
        }

        console.error(`All ${retries} attempts failed for thumbnail ${entity} ${id}.`);
        setPlotSpecsData(null);
        return null;
    };

    return { updateThumbnailById };
};
