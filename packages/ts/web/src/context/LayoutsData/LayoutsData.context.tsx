import { createContext, useContext } from "react";

import { type LayoutsDataTypes } from "./LayoutsData.types";


export const LayoutsDataContext = createContext<LayoutsDataTypes>({} as LayoutsDataTypes);

export function useLayoutsData(): LayoutsDataTypes {
  const context = useContext(LayoutsDataContext);

  return context;
}
