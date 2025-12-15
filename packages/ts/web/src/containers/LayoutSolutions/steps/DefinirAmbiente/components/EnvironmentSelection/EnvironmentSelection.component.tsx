import { Divider, Flex } from '@chakra-ui/react';
import React, { type ChangeEvent, useState } from 'react';
import { RadioOptionSelector, SearchBar } from 'saas_root/Components';

import { useLayoutsData } from '../../../../../../context/LayoutsData/LayoutsData.context';
import {
  type ArchProjectDictType,
  type PlotSpecsTypes,
  type Sector,
  type Zone
} from '../../../../../../context/LayoutsData/LayoutsData.types';
import { useLayoutsSetup } from '../../../../../../context/LayoutsSetup/LayoutsSetup.context';

export function EnvironmentSelection() {
  const [searchTerm, setSearchTerm] = useState('');
  const { ambiente, updateZone, updateSector } = useLayoutsSetup();
  const { archProjectDict, plotSpecsData } = useLayoutsData();

  const normalize = (str: string) =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const isZoneAlreadyUsed = (zonePath: string): boolean => {
    return Object.values(plotSpecsData ?? {}).some((ambiente: PlotSpecsTypes) => ambiente?.zone === zonePath);
  };

  const removeUsedUniqueZones = (): ArchProjectDictType => {
    const cleanDict: ArchProjectDictType = {};

    for (const [key, entry] of Object.entries(archProjectDict)) {
      if ('zones' in entry && typeof entry.zones === 'object') {
        const zones = Object.entries(entry.zones).filter(
          ([zoneKey, zone]) => !zone.unique || !isZoneAlreadyUsed(zoneKey)
        );

        if (zones.length > 0 || normalize(entry.label ?? '').includes(normalize(searchTerm))) {
          cleanDict[key] = {
            ...entry,
            zones: Object.fromEntries(zones),
          } as Sector;
        }
      } else {
        if (!entry.unique || !isZoneAlreadyUsed(key)) {
          cleanDict[key] = entry as Zone;
        }
      }
    }

    return cleanDict;
  };

  const [filteredSectors, setFilteredSectors] = useState<ArchProjectDictType>(() => removeUsedUniqueZones());

  const handleSearch = (term: string) => {
    setSearchTerm(term);

    if (!term.trim()) {
      setFilteredSectors(removeUsedUniqueZones());
      return;
    }

    const search = normalize(term);

    const filtered: ArchProjectDictType = {};

    for (const [key, entry] of Object.entries(archProjectDict)) {
      if ('zones' in entry && typeof entry.zones === 'object') {
        const filteredZones = Object.entries(entry.zones).filter(([zoneKey, zone]) => {
          const isUsed = zone.unique && isZoneAlreadyUsed(zoneKey);
          return !isUsed && normalize(zone?.label ?? '').includes(search);
        });

        const sectorMatches = normalize(entry.label ?? '').includes(search);

        if (sectorMatches || filteredZones.length > 0) {
          filtered[key] = {
            ...entry,
            zones: Object.fromEntries(filteredZones),
          } as ArchProjectSector;
        }
      } else {
        const isUsed = entry.unique && isZoneAlreadyUsed(key);

        if (!isUsed && normalize(entry?.label ?? '').includes(search)) {
          filtered[key] = entry as ArchProjectZone;
        }
      }
    }

    setFilteredSectors(filtered);
  };

  const isTwoLevelDict = (dict: ArchProjectDictType): boolean => {
    return Object.values(dict ?? {}).some(entry => 'zones' in entry && typeof entry.zones === 'object');
  };

  return (
    <Flex p="12px" flexDirection="column">
      <SearchBar
        placeholder="Buscar por nome"
        border="none"
        value={searchTerm}
        inputLeftElementProps={{ width: '21px', height: '40px' }}
        onChange={(e: ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
        paddingLeft='30px'
      />

      <Divider />

      <RadioOptionSelector
        groups={filteredSectors}
        selectedGroup={ambiente.sector}
        setSelectedGroup={updateSector}
        selectedOption={ambiente.zone}
        setSelectedOption={updateZone}
        isSearching={searchTerm.length > 0}
        onlyFirstLevel={!isTwoLevelDict(archProjectDict)}
      />
    </Flex>
  );
}