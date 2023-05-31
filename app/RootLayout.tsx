'use client';
import { PropsWithChildren } from 'react';
import { UserProfile, UserProvider } from '@auth0/nextjs-auth0/client';
import {
  ChakraProvider,
  createLocalStorageManager,
  VStack,
} from '@chakra-ui/react';
import './global.css';
import { Header } from './Header';

const manager = createLocalStorageManager('hi-timer-color-mode-manager');
export const RootLayout = ({
  children,
  user,
}: PropsWithChildren<{ user?: UserProfile }>) => {
  return (
    <ChakraProvider colorModeManager={manager}>
      <UserProvider user={user}>
        <VStack align="left" height="100dvh" pb="env(safe-area-inset-bottom)">
          <Header />
          {children}
        </VStack>
      </UserProvider>
    </ChakraProvider>
  );
};
