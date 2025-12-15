import { createContext, useContext } from "react";

import { type LayoutsSetupContextTypes } from "./LayoutsSetup.types";

export const LayoutsSetupContext = createContext<LayoutsSetupContextTypes>({} as LayoutsSetupContextTypes);

export function useLayoutsSetup(): LayoutsSetupContextTypes {
  const context = useContext(LayoutsSetupContext);

  return context;
}
