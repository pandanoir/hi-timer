'use client';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import {
  Button,
  Heading,
  HStack,
  IconButton,
  useColorMode,
} from '@chakra-ui/react';

export const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <HStack justify="space-between" as="header">
      <Heading>Hi-Timer</Heading>
      <HStack>
        <IconButton
          onClick={toggleColorMode}
          icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          aria-label={'toggle color theme'}
        />
        <Button as="a" href="/api/auth/logout">
          Logout
        </Button>
      </HStack>
    </HStack>
  );
};
