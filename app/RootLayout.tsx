'use client';
import { PropsWithChildren } from 'react';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import {
  ChakraProvider,
  createLocalStorageManager,
  VStack,
} from '@chakra-ui/react';
import './global.css';
import { Header } from './Header';

const manager = createLocalStorageManager('hi-timer-color-mode-manager');
export const RootLayout = ({ children }: PropsWithChildren) => (
  <ChakraProvider colorModeManager={manager}>
    <UserProvider>
      <VStack align="left" height="100dvh" pb="env(safe-area-inset-bottom)">
        <Header />
        {children}
      </VStack>
    </UserProvider>
  </ChakraProvider>
);
