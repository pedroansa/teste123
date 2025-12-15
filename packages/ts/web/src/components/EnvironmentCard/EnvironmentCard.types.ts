import { FlexProps } from "@chakra-ui/react";
import { ReactNode } from "react";

export interface EnvironmentCardProps extends FlexProps {
  icon: ReactNode;
  label: string;
  areaLabel?: string;
  children?: ReactNode;
  rightElement?: ReactNode;
}
