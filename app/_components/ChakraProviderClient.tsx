'use client';
import {
  ChakraProvider,
  ColorMode,
  extendTheme,
  localStorageManager,
} from '@chakra-ui/react';
import { PropsWithChildren } from 'react';

// extendTheme の返り値の中に関数があるため ChakraProviderClient を作って client component として切り出す必要があった
export const ChakraProviderClient = ({
  children,
  colorMode,
}: PropsWithChildren<{ colorMode: 'light' | 'dark' | 'system' }>) => {
  // HACK: cookie にも設定するために無理やり set メソッドを書き換えている
  const colorModeManager = {
    ...localStorageManager,
    set(value: 'system' | ColorMode) {
      document.cookie = `chakra-ui-color-mode=${value}; max-age=31536000; path=/`;
      localStorageManager.set(value);
    },
  };

  return (
    <ChakraProvider
      colorModeManager={colorModeManager}
      theme={extendTheme({ config: { initialColorMode: colorMode } })}
    >
      {children}
    </ChakraProvider>
  );
};
