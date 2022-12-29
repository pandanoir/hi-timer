'use client';
import { FC, PropsWithChildren } from 'react';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { ChakraProvider, createLocalStorageManager } from '@chakra-ui/react';

const manager = createLocalStorageManager('hi-timer-color-mode-manager');
const RootLayout: FC<PropsWithChildren> = ({ children }) => (
  <ChakraProvider colorModeManager={manager}>
    <UserProvider>{children}</UserProvider>
  </ChakraProvider>
);
export default RootLayout;
