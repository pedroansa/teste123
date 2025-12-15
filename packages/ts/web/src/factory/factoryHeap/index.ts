import { ArchprogPayloadTypes } from "../../context/LayoutsData/LayoutsData.types";
import { getLabelAndValueFromClassPath } from "../../utils/parserLabelToName";

export function factoryHeap(dataArchProg: ArchprogPayloadTypes[] | undefined) {
  const resultadoRaw = dataArchProg
    ?.map(item => getLabelAndValueFromClassPath(item))
    ?.filter(mobilia => mobilia?.label && mobilia?.value! > 0 && mobilia?.zone_id);

  if (!resultadoRaw) return { ambiente: '', mobiliario: {} };

  // Mapeia nome do ambiente em uma lista de zone_ids únicos
  const zoneNameToIds = new Map<string, string[]>();

  resultadoRaw.forEach(({ zone_id }) => {
    const name = zone_id?.split('/')[2];
    if (!name) return;

    const ids = zoneNameToIds.get(name) ?? [];
    if (!ids.includes(zone_id)) {
      ids.push(zone_id);
    }
    zoneNameToIds.set(name, ids);
  });

  // Cria mapeamento de zone_id para nome formatado (com sufixo numérico se necessário)
  const zoneIdToFormattedName = new Map<string, string>();

  zoneNameToIds.forEach((ids, name) => {
    ids.forEach((id, index) => {
      const formatted = ids.length > 1 ? `${name}${index + 1}` : name;
      zoneIdToFormattedName.set(id, formatted.replace(/\s+/g, '_'));
    });
  });

  // Monta o objeto mobiliário com chaves no formato: Ambiente.Mobiliário
  const mobiliario = resultadoRaw.reduce((acc, mobilia) => {
    const formattedZone = zoneIdToFormattedName.get(mobilia.zone_id ?? '');
    const formattedLabel = mobilia.label?.replace(/\s+/g, '_');

    if (formattedZone && formattedLabel && mobilia.value !== undefined) {
      const key = `${formattedZone}.${formattedLabel}`;
      acc[key] = mobilia.value;
    }

    return acc;
  }, {} as Record<string, number>);

  // Lista única de ambientes formatados
  const ambiente = Array.from(
    new Set([...zoneIdToFormattedName.values()])
  ).join(', ');

  return {
    ambiente,
    ...mobiliario,
  };
}
