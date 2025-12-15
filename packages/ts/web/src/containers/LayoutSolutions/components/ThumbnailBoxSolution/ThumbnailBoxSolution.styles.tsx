import { Flex } from '@chakra-ui/react';
import styled from 'styled-components';

export const FlexStyled = styled(Flex)`
  flex-direction: column;
  padding: 8px 12px 8px 12px;
  border: 1px solid #f7fafc;
  border-radius: 8px;
`;

export const IconContainer = styled.button`
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;

  &[aria-disabled='true'] {
    cursor: not-allowed;
  }
`;
