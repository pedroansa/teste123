import { useLayoutsData } from "../context/LayoutsData/LayoutsData.context";
import { type ArchprogPayloadTypes, type ArchProjectDictType } from "../context/LayoutsData/LayoutsData.types";

export const parserLabelToName = (label: string | undefined): string | null => {
  const { archProjectDict } = useLayoutsData();
  
  if (!label || !archProjectDict) return null;

  const parsedLabel = `/${label.split('/').slice(1, 3).join('/')}`;

  for (const sectorData of Object.values(archProjectDict ?? {})) {
    const zoneOrSector = sectorData?.zones?.[parsedLabel] ?? archProjectDict?.[parsedLabel];

    if (zoneOrSector?.label) {
      return zoneOrSector.label;
    }
  }

  return null;
}

const normalizedClassPath = (path?: string) =>  path?.startsWith("/") ? path : `/${path}`;

export interface LabelValueZone {
  label: string | undefined;
  value: number | undefined;
  zone_id?: string | undefined;
};

export const getLabelAndValueFromClassPath = (dataObj: ArchprogPayloadTypes): LabelValueZone => {
  const { archProjectDict }: { archProjectDict: ArchProjectDictType } = useLayoutsData();
  const { zone_id, class_path, value } = dataObj;

  if (!archProjectDict) return { label: undefined, value, zone_id };

  const parsedLabel = `/${zone_id?.split('/').slice(1, 3).join('/')}`;

  for (const [_, sectorData] of Object.entries(archProjectDict)) {
    const zoneOrSector = sectorData?.zones?.[parsedLabel] ?? sectorData;

    if (!zoneOrSector?.sections) continue;

    for (const section of zoneOrSector.sections) {
      for (const item of section.children) {
        const payload = item.payload;

        if (normalizedClassPath(payload?.class_path) === normalizedClassPath(class_path)) {
          return { label: item.label, value, zone_id};
        }

        if (Array.isArray(payload?.class_paths)) {
          const normalizedPaths = payload.class_paths.map(normalizedClassPath);

          if (normalizedPaths.includes(normalizedClassPath(class_path))) {
            return { label: item.label, value, zone_id};
          }
        }
      }
    }
  }

  return { label: undefined, value, zone_id };
};

