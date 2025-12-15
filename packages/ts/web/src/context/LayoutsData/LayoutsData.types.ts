import type { Geometry } from 'geojson';
import { type ReactNode } from 'react';

export interface LayoutsDataProviderProps {
    children: ReactNode;
}

export type SiteType = 'LAYOUT' | 'FEASIBILITY_STUDY' | 'BUDGET';

export interface Site {
    id: string;
    folderId: string | null;
    createdBy: string;
    type: SiteType;
    name: string;
    inputFile: File;
    aqgGeojsonFile: File;
    tenantId: string;
    solutionsCount: number;
    favoritedSolutionsCount: number;
    favoritedSolutionsCountByUser: Record<string, number>;
    createdAt: string;
    updatedAt: string;
    openedAt: string | null;
    deletedAt: string | null;
    data: {
        processed_info: ProcessedInfo[];
    } | null;
}

export interface ProcessedInfo {
    value: number;
    type: string;
}

export interface ArchprogPayloadTypes {
    zone_id?: string;
    class_path?: string;
    class_paths?: string[];
    value?: number;
    type?: string;
}

export interface PlotSpecsTypes {
    stroke_color: string;
    stroke_width: number;
    stroke_alpha: number;
    dash_patten: number[];
    fill_color: string | null | undefined;
    fill_alpha: number | null;
    drawing_order: number;
    scale?: {
        x: number;
        y: number;
    };
    tags?: string[];
    label: string;
    name?: string;
    geometry: Geometry;
    position: {
        x: number;
        y: number;
        z: number;
        angle: number;
    };
    zoneIndex?: number;
    originalIndex: number;
    sector?: string | null;
    zone?: string;
    area?: number;
    archprog?: ArchprogPayloadTypes[] | undefined;
    disabledArchProg?: boolean;
    unique?: boolean;
}

export interface SolutionDataType {
    archprog?: ArchprogPayloadTypes[] | undefined;
    processed_info?: ProcessedInfo[];
    file_name?: string;
    elements?: PlotSpecsTypes[];
}

export interface Solution {
    id: string;
    requestId: string;
    siteId: string;
    parentId: string | null;
    ancestorIds: string[];
    createdBy: string;
    createdName: string;
    createdLastName: string;
    tenantId: string;
    name: string | null;
    scores: Record<string, number>;
    features: Record<string, null | string | number | boolean | string[]>;
    usersGrades: Record<string, number>;
    systemGrade: number | null;
    typeTags: string[];
    wasFavoritedBySomeone: boolean;
    favoritedBy: string[];
    data: SolutionDataType | Record<string, unknown> | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface ArchprogOption {
    label?: string;
    value?: string;
    id?: string;
    payload?: ArchprogPayloadTypes;
}

export interface Archprog {
    id?: string;
    label?: string;
    min?: number;
    max?: number | null;
    type?: string;
    suffix?: string;
    visible?: boolean;
    disabled?: boolean;
    divider?: boolean;
    required?: boolean;
    options?: ArchprogOption[];
    payload?: ArchprogPayloadTypes;
}

export interface Section {
    label: string;
    children: Archprog[];
}

export interface Zone {
    color?: string;
    label: string;
    sections?: Section[];
    disabledArchProg?: boolean;
    unique?: boolean;
    dependencies?: { id: string; label: string }[];
}

export interface Sector {
    color?: string;
    label: string;
    zones?: Record<string, Zone>;
    sections?: Section[];
    disabledArchProg?: boolean;
    unique?: boolean;
}

export type ArchProjectDictType = Record<string, Sector>;

export interface ArchProjectTemplate {
    id: string;
    name: string;
    fields?: any[];
    sections?: any[];
    dict: ArchProjectDictType;
}

export interface ArchProjectData {
    values: Record<string, unknown>;
    payload: ArchprogPayloadTypes[];
    isValid: boolean;
    environments?: Record<string, unknown>;
}

export interface LayoutsDataTypes {
    plotSpecsData: PlotSpecsTypes[] | null;
    setPlotSpecsData: React.Dispatch<React.SetStateAction<PlotSpecsTypes[] | null>>;
    parentSolutionId: string;
    setParentSolutionId: React.Dispatch<React.SetStateAction<string>>;
    archProjectData: ArchProjectData;
    setArchProjectData: React.Dispatch<React.SetStateAction<ArchProjectData>>;
    siteData: Site | null;
    setSiteData: React.Dispatch<React.SetStateAction<Site | null>>;
    solutionData: Solution | null;
    setSolutionData: React.Dispatch<React.SetStateAction<Solution | null>>;
    previewPlotSpecsData: PlotSpecsTypes[] | null;
    setPreviewPlotSpecsData: React.Dispatch<React.SetStateAction<PlotSpecsTypes[] | null>>;
    confirmPlotSpecsUpdate: () => void;
    archProjectDict: ArchProjectDictType;
    setArchProjectDict: React.Dispatch<React.SetStateAction<ArchProjectDictType>>;
    archProjectTemplate: ArchProjectTemplate | null;
    setArchProjectTemplate: React.Dispatch<React.SetStateAction<ArchProjectTemplate | null>>;
}
