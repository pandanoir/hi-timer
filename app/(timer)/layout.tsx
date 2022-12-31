'use client';
import { FC, PropsWithChildren } from 'react';
import {
  ChakraProvider,
  createLocalStorageManager,
  VStack,
} from '@chakra-ui/react';
import './global.css';
import { Header } from './components/Header';

const manager = createLocalStorageManager('hi-timer-color-mode-manager');
const RootLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ChakraProvider colorModeManager={manager}>
      <VStack align="left" height="100dvh">
        <Header />
        {children}
      </VStack>
    </ChakraProvider>
  );
};
export default RootLayout;
