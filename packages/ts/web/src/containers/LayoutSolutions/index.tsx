import React from "react"

import { LayoutsDataProvider } from "../../context/LayoutsData/LayoutsData.provider"
import { LayoutsSetupProvider } from "../../context/LayoutsSetup"
import LayoutSolutions from "./LayoutSolutions.view"

export default function LayoutsView() {
  return (
    <LayoutsDataProvider>
      <LayoutsSetupProvider>
        <LayoutSolutions />
      </LayoutsSetupProvider>
    </LayoutsDataProvider>
  )
}
