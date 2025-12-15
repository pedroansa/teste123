import { Divider, Flex, Text } from '@chakra-ui/react';
import React from 'react';

import { type EnvironmentCardProps } from './EnvironmentCard.types';

export function EnvironmentCard({
  icon,
  label,
  areaLabel,
  rightElement,
  children,
  ...props
}: EnvironmentCardProps) {
  return (
    <Flex
      border="1px solid #E2E8F0"
      borderRadius="8px"
      flexDirection="column"
      {...props}
    >
      <Flex gap="8px" p="8px">
        <Flex
          backgroundColor="#D8FFF1"
          borderRadius="4px"
          alignItems="center"
          justifyContent="center"
          minWidth="40px"
          minHeight="40px"
        >
          {icon}
        </Flex>

        <Flex flexDirection="column" gap="4px" justifyContent="center">
          <Text fontSize="14px" color="#2D3748">
            {label}
          </Text>
          {areaLabel && (
            <Text fontSize="18px" color="#2D3748">
              {areaLabel}
            </Text>
          )}
        </Flex>

        {rightElement}
      </Flex>

      {children && <Divider />}
      {children}
    </Flex>
  );
}
