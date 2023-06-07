'use client';
import { useUser } from '@auth0/nextjs-auth0/client';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import {
  Button,
  Fade,
  Heading,
  HStack,
  IconButton,
  useColorMode,
} from '@chakra-ui/react';
import Link from 'next/link';

export const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, isLoading } = useUser();
  return (
    <HStack justify="space-between" as="header">
      <Heading>
        <Link href="/">Hi-Timer</Link>
      </Heading>
      <Fade in={!isLoading}>
        <HStack>
          <IconButton
            onClick={toggleColorMode}
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            aria-label={'toggle color theme'}
            variant="outline"
          />
          <Button
            as="a"
            href="/records"
            variant="outline"
            display={{ base: 'none', md: 'inline-flex' }}
          >
            Records
          </Button>
          {user ? (
            <Button as="a" href="/api/auth/logout">
              Logout
            </Button>
          ) : (
            <Button as="a" href="/api/auth/login">
              Login
            </Button>
          )}
        </HStack>
      </Fade>
    </HStack>
  );
};
