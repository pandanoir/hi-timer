'use client';
import {
  ChakraProvider,
  ColorModeScript,
  cookieStorageManager,
  extendTheme,
} from '@chakra-ui/react';
import { PropsWithChildren } from 'react';

// extendTheme の返り値の中に関数があるため ChakraProviderClient を作って client component として切り出す必要があった
export const ChakraProviderClient = ({
  children,
  colorMode,
}: PropsWithChildren<{ colorMode: 'light' | 'dark' | 'system' }>) => (
  <ChakraProvider
    colorModeManager={cookieStorageManager}
    theme={extendTheme({ config: { initialColorMode: colorMode } })}
  >
    <ColorModeScript type="cookie" />
    {children}
  </ChakraProvider>
);
