'use client';
import { FC, PropsWithChildren } from 'react';
import { ChakraProvider, createLocalStorageManager } from '@chakra-ui/react';

const manager = createLocalStorageManager('hi-timer-color-mode-manager');
const RootLayout: FC<PropsWithChildren> = ({ children }) => (
  <ChakraProvider colorModeManager={manager}>{children}</ChakraProvider>
);
export default RootLayout;
