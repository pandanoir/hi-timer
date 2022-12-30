'use client';
import { FC, PropsWithChildren } from 'react';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import {
  Button,
  ChakraProvider,
  createLocalStorageManager,
  Heading,
  HStack,
  IconButton,
  useColorMode,
  VStack,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import './global.css';

const Header = () => {
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
const manager = createLocalStorageManager('hi-timer-color-mode-manager');
const RootLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ChakraProvider colorModeManager={manager}>
      <UserProvider>
        <VStack align="left" height="100dvh">
          <Header />
          {children}
        </VStack>
      </UserProvider>
    </ChakraProvider>
  );
};
export default RootLayout;
