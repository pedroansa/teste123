import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Badge,
    Box,
    Button,
    Flex,
    Input,
    Progress,
    Text,
} from '@chakra-ui/react';
import { XCircle } from '@phosphor-icons/react';
import React, { useEffect, useRef, useState } from 'react';
import { api } from 'saas_root/Api';
import { useApplicationEventsContext } from 'saas_root/ApplicationEvents';
import { useGlobalContext } from 'saas_root/Contexts';

import { useLayoutsData } from '../../../../../../context/LayoutsData/LayoutsData.context';
import { useLayoutsSetup } from '../../../../../../context/LayoutsSetup/LayoutsSetup.context';

interface UploadState {
    uploading: boolean;
    progress: number;
    error: string | null;
    class_path?: string;
}

interface EditarBlocosProps {
    schema: any;
}

const loadingMessages = [
    'Validando arquivo...',
    'Atualizando blocos...',
    'Aplicando configurações...',
    'Finalizando...',
];

export function EditarBlocos({ schema }: EditarBlocosProps) {
    const { archProjectDict, setArchProjectDict, archProjectTemplate } = useLayoutsData();
    const { ambiente } = useLayoutsSetup();
    const { registerHandler } = useApplicationEventsContext();
    const { setAlertModalIsOpen } = useGlobalContext();

    const [uploadStates, setUploadStates] = useState<Record<string, UploadState>>({});
    const [activeUploadId, setActiveUploadId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const loadingIntervalId = useRef<NodeJS.Timeout | null>(null);
    const isModalLoading = useRef(false);

    useEffect(() => {
        return () => {
            if (loadingIntervalId.current) {
                clearInterval(loadingIntervalId.current);
            }
        };
    }, []);

    const startLoadingModal = () => {
        isModalLoading.current = true;
        let messageIndex = 0;
        setAlertModalIsOpen({
            open: true,
            title: 'Aguarde um momento',
            description: loadingMessages[messageIndex],
            loader: true,
        });

        loadingIntervalId.current = setInterval(() => {
            if (!isModalLoading.current) return;
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            setAlertModalIsOpen({
                open: true,
                title: 'Aguarde um momento',
                description: loadingMessages[messageIndex],
                loader: true,
            });
        }, 3000);
    };

    const stopLoadingModal = () => {
        isModalLoading.current = false;
        if (loadingIntervalId.current) {
            clearInterval(loadingIntervalId.current);
            loadingIntervalId.current = null;
        }
        setAlertModalIsOpen({ open: false });
    };

    const handleUpload = async (file: File, childId: string) => {
        setUploadStates((prev) => ({
            ...prev,
            [childId]: {
                ...prev[childId],
                uploading: true,
                progress: 0,
                error: null,
            },
        }));

        startLoadingModal();

        try {
            const payload = {
                file,
                filename: file.name,
                filegroup: 'family',
                contentType: 'application/dwg',
                version: 'v2',
                validator: '',
                bypassExternalValidation: true,
            };

            const response = await api.import.generateUploadSignedUrlFamilyAndBlockFile(
                payload,
                (progress: number) => {
                    setUploadStates((prev) => ({
                        ...prev,
                        [childId]: {
                            ...prev[childId],
                            progress,
                        },
                    }));
                }
            );

            if (!response.success) {
                throw new Error(response.error?.message || 'Falha no upload do arquivo.');
            } else {
                registerHandler(
                    'OHANA_FAMILY_FILE_VALIDATED',
                    async (family) => {
                        try {
                            const newArchProjectDict = JSON.parse(JSON.stringify(archProjectDict));
                            const { zone, sector } = ambiente;

                            let sections;
                            if (sector && newArchProjectDict[sector]) {
                                sections = newArchProjectDict[sector].zones[zone!]?.sections;
                            } else if (newArchProjectDict[zone!]) {
                                sections = newArchProjectDict[zone!].sections;
                            }

                            const uploadedFamilyClassPath = uploadStates[childId]?.class_path;
                            if (sections && uploadedFamilyClassPath) {
                                for (const section of sections) {
                                    for (const item of section.children) {
                                        const itemClassPaths =
                                            item.payload?.class_paths ||
                                            (item.payload?.class_path
                                                ? [item.payload.class_path]
                                                : []);

                                        if (itemClassPaths.includes(uploadedFamilyClassPath)) {
                                            item.hasOwnFamily = true;
                                            break;
                                        }
                                    }
                                }
                            }

                            const updateFamilyPromise = api.ohana.updateFamily(family.familyId, {
                                class_path: uploadStates[childId].class_path,
                            });

                            const patchTemplatePromise = archProjectTemplate
                                ? api.template.patch({
                                      id: archProjectTemplate.id,
                                      name: archProjectTemplate.name,
                                      dict: newArchProjectDict,
                                  })
                                : Promise.resolve();

                            await Promise.all([updateFamilyPromise, patchTemplatePromise])
                                .then(() => setArchProjectDict(newArchProjectDict))
                                .finally(() => {
                                    if (loadingIntervalId) clearInterval(loadingIntervalId);
                                    stopLoadingModal();
                                });
                        } catch (e) {
                            console.error('Failed to process validated family file:', e);
                            setUploadStates((prev) => ({
                                ...prev,
                                [childId]: {
                                    ...prev[childId],
                                    error: 'Falha ao processar o bloco.',
                                    uploading: false,
                                },
                            }));
                        }
                    },
                    true
                );
            }

            setUploadStates((prev) => ({
                ...prev,
                [childId]: {
                    ...prev[childId],
                    uploading: false,
                },
            }));
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
            setUploadStates((prev) => ({
                ...prev,
                [childId]: {
                    ...prev[childId],
                    error: errorMessage,
                    uploading: false,
                },
            }));
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && activeUploadId) {
            handleUpload(file, activeUploadId);
        }
        setActiveUploadId(null);
        if (event.target) {
            event.target.value = '';
        }
    };

    const onModifyClick = (childId: string, class_path: string) => {
        setActiveUploadId(childId);
        setUploadStates((prev) => ({
            ...prev,
            [childId]: {
                class_path,
                uploading: false,
                progress: 0,
                error: null,
            },
        }));
        fileInputRef.current?.click();
    };

    return (
        <Flex flexDir="column">
            <Input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept=".dwg"
            />
            <Accordion allowToggle allowMultiple>
                {schema?.sections?.map((section: any) =>
                    section.children.map((child: any) => {
                        const {
                            uploading = false,
                            progress = 0,
                            error = null,
                        } = uploadStates[child.id] || {};

                        return (
                            <AccordionItem key={child.id}>
                                <h2>
                                    <AccordionButton>
                                        <Box as="span" flex="1" textAlign="left">
                                            {child.label}
                                        </Box>
                                        <AccordionIcon />
                                    </AccordionButton>
                                </h2>
                                <AccordionPanel pb={4}>
                                    <p>
                                        <b>Status:</b>{' '}
                                        {child.hasOwnFamily ? (
                                            <Badge colorScheme="green">Bloco próprio</Badge>
                                        ) : (
                                            <Badge colorScheme="red">Bloco temporário</Badge>
                                        )}
                                    </p>
                                    {child?.payload?.class_path && (
                                        <Button
                                            size="xs"
                                            onClick={() =>
                                                onModifyClick(child.id, child.payload.class_path)
                                            }
                                            isLoading={uploading}
                                            mt="12px"
                                        >
                                            {uploading
                                                ? `Enviando... ${progress.toFixed(0)}%`
                                                : 'Modificar'}
                                        </Button>
                                    )}
                                    {uploading && (
                                        <Progress
                                            value={progress}
                                            size="xs"
                                            colorScheme="green"
                                            mt={2}
                                        />
                                    )}
                                    {error && (
                                        <Box
                                            display="flex"
                                            alignItems="center"
                                            color="red.500"
                                            mt={2}
                                        >
                                            <XCircle />
                                            <Text ml={2}>{error}</Text>
                                        </Box>
                                    )}
                                </AccordionPanel>
                            </AccordionItem>
                        );
                    })
                )}
            </Accordion>
        </Flex>
    );
}
