import { useLayoutsData } from "../context/LayoutsData/LayoutsData.context";
import { type ArchprogPayloadTypes, type ArchProjectDictType, type PlotSpecsTypes } from "../context/LayoutsData/LayoutsData.types";

/**
 * 1. Prioridade: label NÃO contém '/zone/Ambiente/'
 * 2. Prioridade: tem 'name'
 * Se empatar, mantém a ordem
 */
export const ordenacaoAmbientes = (a: PlotSpecsTypes, b: PlotSpecsTypes) => {
  const ambienteSolucionadoA = a?.label && !a?.label?.includes('/zone/Ambiente/');
  const ambienteSolucionadoB = b?.label && !b?.label?.includes('/zone/Ambiente/');

  if (ambienteSolucionadoA && !ambienteSolucionadoB) return -1;
  if (!ambienteSolucionadoA && ambienteSolucionadoB) return 1;

  if (a?.name != null && b?.name == null) return -1;
  if (a?.name == null && b?.name != null) return 1;

  return 0;
};

export const archProgAmbiente = (ambientes: PlotSpecsTypes[], archprog: ArchprogPayloadTypes[]) => {
  const { archProjectDict } = useLayoutsData();

  const ambientesComArchProg = ambientes.map(item => {
    const parsedLabel = `/${item.label?.split('/').slice(1, 3).join('/')}`;

    const matchArchprog = archprog?.filter(ap => ap?.zone_id === item?.label || ap?.zone_id === parsedLabel);

    const matchDict = Object.values(archProjectDict ?? {}).find((sectorData) => {
      const zoneOrSector = sectorData?.zones?.[parsedLabel] ?? archProjectDict?.[parsedLabel];
      return !!zoneOrSector;
    })?.zones?.[parsedLabel] ?? archProjectDict?.[parsedLabel];

    const result = {
      ...item,
      disabledArchProg: matchDict?.disabledArchProg ?? item?.disabledArchProg,
      unique: matchDict?.unique ?? item?.unique,
    }

    if (matchArchprog?.length > 0)
      return {
        ...result,
        zone: item?.label,
        archprog: matchArchprog
      }

    return result;
  })

  return ambientesComArchProg;
};

export const getSectorFromZone = (zoneKey: string, dictionary: ArchProjectDictType) => {
  const normalizeZoneKey = zoneKey?.trim().replace(/\/+$/, '');

  for (const [sectorKey, sectorData] of Object.entries(dictionary)) {
    if (sectorData?.zones) {
      const zoneKeys = Object.keys(sectorData?.zones).map(z => z.trim().replace(/\/+$/, ''));
      if (zoneKeys.includes(normalizeZoneKey)) {
        return sectorKey;
      }
    }
  }

  return null;
}

export const getDependenciesFromZone = (zoneKey: string, dictionary: ArchProjectDictType) => {
  const normalizeZoneKey = zoneKey?.trim().replace(/\/+$/, '');

  for (const sectorData of Object.values(dictionary)) {
    if (sectorData?.zones) {
      const zoneKeys = Object.keys(sectorData?.zones).map(z => z.trim().replace(/\/+$/, ''));
      if (zoneKeys.includes(normalizeZoneKey)) {
        return sectorData.zones[normalizeZoneKey].dependencies;
      }
    }
  }

  return null;
}
