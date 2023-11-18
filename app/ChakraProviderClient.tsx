'use client';
import {
  ChakraProvider,
  extendTheme,
  localStorageManager,
} from '@chakra-ui/react';
import { PropsWithChildren } from 'react';

// extendTheme の返り値の中に関数があるため ChakraProviderClient を作って client component として切り出す必要があった
export const ChakraProviderClient = ({
  children,
  colorMode,
}: PropsWithChildren<{ colorMode: 'light' | 'dark' }>) => (
  <ChakraProvider
    colorModeManager={localStorageManager}
    theme={extendTheme({
      config: {
        initialColorMode: colorMode,
        useSystemColorMode: true,
      },
    })}
  >
    {children}
  </ChakraProvider>
);
