import { type ArchprogPayloadTypes } from "../../context/LayoutsData/LayoutsData.types";

export function factoryValuesFromArchProg(payloadArray: ArchprogPayloadTypes[]) {
  const values: Record<string, unknown> = {};

  payloadArray.forEach((item) => {
    const zone = item.zone_id;
    const value = item.value ?? 0;

    if (item.class_path) {
      const path = `${zone}${item.class_path}`;
      values[path] = value;
    }

    if (item.class_paths && Array.isArray(item.class_paths)) {
      item.class_paths.forEach((path) => {
        const fullPath = `${zone}${path}`;
        values[fullPath] = value;
      });
    }
  });

  return values;
}
