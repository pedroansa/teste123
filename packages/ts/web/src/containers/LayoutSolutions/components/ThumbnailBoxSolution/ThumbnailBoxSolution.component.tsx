import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import { DownloadSimple, SelectionAll, SquareLogo } from '@phosphor-icons/react';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    DownloadSolution,
    DrawDwg,
    DynamicImport as IFCViewer,
    InputAutoResize,
    SkeletonCard,
} from 'saas_root/Components';
import { useGlobalContext } from 'saas_root/Contexts';
import { useMicrofrontendsContext, useViewModeStore } from 'saas_root/Hooks';
import { formatDate } from 'saas_root/Utils';

import { ThumbnailTooltip } from '../../../../components/ThumbnailTooltip/ThumbnailTooltip.component';
import { useLayoutsData } from '../../../../context/LayoutsData/LayoutsData.context';
import {
    type ArchprogPayloadTypes,
    type PlotSpecsTypes,
} from '../../../../context/LayoutsData/LayoutsData.types';
import { useLayoutsSetup } from '../../../../context/LayoutsSetup/LayoutsSetup.context';
import { factoryHeap } from '../../../../factory';
import { useHandleSolutionData } from '../../../../hook';
import { useGetThumbnailApiUrl } from '../../../../utils/getThumbnailApiUrl';
import { useIFCExport } from '../../hooks/useIFCExport';
import { type ViewModeType } from '../../LayoutSolutions.types';

export default function ThumbnailBoxSolution() {
    const { currentStep, ambiente } = useLayoutsSetup();

    const { plotSpecsData, siteData, solutionData, setSolutionData, previewPlotSpecsData } =
        useLayoutsData();

    const { handleUpdateSolution } = useHandleSolutionData();

    const { fetchSolutionExport, startExportEvents, unregisterConversionEvents, ifcFileExported } =
        useIFCExport();

    const {
        features: { exportSolution },
        toolsModules,
    } = useMicrofrontendsContext();

    const { solutionId } = useParams();
    const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);
    const { viewMode, setViewMode } = useViewModeStore();
    const { setAlertModalIsOpen } = useGlobalContext();

    const thumbnailApiUrl = useGetThumbnailApiUrl();
    const wrapperRef = useRef<HTMLDivElement>(null);

    const [plotSpecsToRender, setPlotSpecsToRender] = useState(
        previewPlotSpecsData ?? plotSpecsData
    );
    const [activeLayer, setActiveLayer] = useState<string>('Layout');

    const options = [
        { label: 'Layout', key: 'Layout', Icon: <SquareLogo size={16} color={'#01ad6e'} /> },
        { label: 'Forro', key: 'Forro', Icon: <SelectionAll size={16} color={'#01ad6e'} /> },
    ];

    useEffect(() => {
        setPlotSpecsToRender(filterLayer(previewPlotSpecsData ?? plotSpecsData ?? [], activeLayer));
    }, [activeLayer, plotSpecsData, previewPlotSpecsData]);

    const has3DView =
        Object.keys(toolsModules?.IFCTools ?? {}).length > 0 && toolsModules?.IFCTools.enable;

    const filterLayer = (plotSpecsList: PlotSpecsTypes[], layer: string | null) => {
        if (layer === 'Layout') {
            return plotSpecsList.filter(
                (plotSpec) =>
                    plotSpec.label !== '/view/ceiling/Acquired' &&
                    plotSpec.label !== '/hatch/ceiling/Acquired'
            );
        }

        if (layer === 'Forro') {
            return plotSpecsList.filter(
                (plotSpec) =>
                    plotSpec.label !== '/view/Acquired' &&
                    plotSpec.label !== '/hatch/Acquired' &&
                    plotSpec.label !== '/thin_red/Acquired' &&
                    plotSpec.label !== '/hatch_red/Acquired'
            );
        }

        return plotSpecsList;
    };

    useEffect(() => {
        if (viewMode === '3d' && solutionId && siteData?.id) {
            void fetchSolutionExport(solutionId, siteData?.id);
            startExportEvents();

            setAlertModalIsOpen({
                open: !ifcFileExported,
                title: 'Aguarde',
                description: 'Aguarde enquanto o seu modelo 3D esta sendo carregado.',
                loader: true,
            });
        }

        return () => {
            unregisterConversionEvents();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewMode]);

    const renderViewMode = (mode: ViewModeType) => {
        if (mode === '2d') {
            return ambiente?.selectedSolution && currentStep?.id === 'selecionarSolucao' ? (
                <DrawDwg
                    id={ambiente?.selectedSolution}
                    api={thumbnailApiUrl}
                    entity="solution"
                    queryCache={ambiente?.selectedUpdatedAt}
                    height={750}
                    hasZoom
                    draggable
                    controls={true}
                    wrapperContext={{
                        ref: wrapperRef,
                        padding: 24,
                    }}
                    viewMode={solutionId ? viewMode : undefined}
                    setViewMode={solutionId ? setViewMode : undefined}
                />
            ) : (
                <DrawDwg
                    key={JSON.stringify(
                        plotSpecsToRender?.map((p) => ({
                            label: p.label,
                            zone: p.zone,
                            name: p.name,
                            fill_color: p.fill_color,
                        }))
                    )}
                    height={750}
                    hasZoom
                    draggable
                    queryCache={solutionData?.updatedAt}
                    plotSpecs={plotSpecsToRender}
                    controls={true}
                    tooltipChildren={currentStep?.id === 'configurarSolucao' && ThumbnailTooltip}
                    hoverConfig={
                        currentStep?.id === 'configurarSolucao' && {
                            color: '#B0F3DA',
                            validator: (element: PlotSpecsTypes) =>
                                element?.label?.startsWith('/zone'),
                        }
                    }
                    wrapperContext={{
                        ref: wrapperRef,
                        padding: 24,
                    }}
                    viewMode={has3DView && solutionId && siteData?.id ? viewMode : undefined}
                    setViewMode={has3DView && solutionId && siteData?.id ? setViewMode : undefined}
                    viewModeMenuProps={{
                        options,
                        currentModeKey: activeLayer,
                        onSelectMode: setActiveLayer,
                    }}
                />
            );
        }

        if (mode === '3d' && ifcFileExported) {
            return (
                <IFCViewer
                    remoteUrl={toolsModules?.IFCTools?.url}
                    scope={toolsModules?.IFCTools?.scope}
                    module="./IFCViewer"
                    customProps={{
                        IFCFile: ifcFileExported,
                    }}
                />
            );
        }

        return null;
    };

    return (
        <Flex p="16px 12px" bg="white" borderRadius="8" flexDirection="column" ref={wrapperRef}>
            {solutionId &&
                currentStep.id === 'finalizarConfiguracao' &&
                (!solutionData?.name ? (
                    <Box w="fit-content">
                        <SkeletonCard w="200px" h="20px" lengthItems={1} />
                    </Box>
                ) : (
                    <Flex flexDirection="row" justifyContent="space-between">
                        <Flex flexDirection="column">
                            <InputAutoResize
                                value={solutionData.name}
                                placeholder="Digite um nome"
                                onSave={async (name: string) => {
                                    setSolutionData((p) => (p ? { ...p, name } : p));
                                    await handleUpdateSolution({ name });
                                }}
                            />
                            <Text p="8px 0 16px 0" w="fit-content">
                                {siteData?.createdAt ? (
                                    `Data de criação: ${formatDate(siteData?.createdAt)} por ${solutionData?.createdName} ${solutionData?.createdLastName}`
                                ) : (
                                    <SkeletonCard w="200px" h="20px" lengthItems={1} />
                                )}
                            </Text>
                        </Flex>
                        {exportSolution?.LAYOUT?.types && (
                            <Flex alignItems="center">
                                <Icon
                                    as={DownloadSimple}
                                    boxSize={9}
                                    border="1px solid #CBD5E0"
                                    p="8px"
                                    borderRadius="8px"
                                    color={false ? 'gray.200' : '#1A202C'}
                                    cursor={false ? 'not-allowed' : 'pointer'}
                                    _hover={{ color: false ? 'gray.200' : '#01AD6E' }}
                                    onClick={() => {
                                        setShowDownloadModal(!showDownloadModal);
                                    }}
                                />
                            </Flex>
                        )}

                        {showDownloadModal && (
                            <DownloadSolution
                                isOpen={showDownloadModal}
                                onClose={() => setShowDownloadModal(false)}
                                siteId={siteData?.id ?? ''}
                                solutionId={solutionData.id}
                                solutionName={solutionData?.name}
                                product="LAYOUT"
                                metadata={factoryHeap(
                                    solutionData?.data?.archprog as
                                        | ArchprogPayloadTypes[]
                                        | undefined
                                )}
                            />
                        )}
                    </Flex>
                ))}
            {renderViewMode(viewMode as ViewModeType)}
        </Flex>
    );
}
