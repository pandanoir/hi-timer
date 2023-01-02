'use client';
import { useUser } from '@auth0/nextjs-auth0/client';
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
  const { user } = useUser();
  return (
    <HStack justify="space-between" as="header">
      <Heading>Hi-Timer</Heading>
      <HStack>
        <IconButton
          onClick={toggleColorMode}
          icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          aria-label={'toggle color theme'}
        />
        {user ? (
          <Button as="a" href="/api/auth/logout">
            Logout
          </Button>
        ) : (
          <Button as="a" href="/api/auth/login">
            login
          </Button>
        )}
      </HStack>
    </HStack>
  );
};
