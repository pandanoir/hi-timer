'use client';
import { ComponentProps, PropsWithChildren } from 'react';
import { UserProfile, UserProvider } from '@auth0/nextjs-auth0/client';
import {
  ChakraProvider,
  createLocalStorageManager,
  VStack,
} from '@chakra-ui/react';
import './global.css';
import { Header } from './Header';
import { SWRConfig } from 'swr';

const manager = createLocalStorageManager('hi-timer-color-mode-manager');
export const RootLayout = ({
  children,
  swrConfig,
  user,
}: PropsWithChildren<{
  swrConfig: ComponentProps<typeof SWRConfig>['value'];
  user?: UserProfile;
}>) => {
  return (
    <SWRConfig value={swrConfig}>
      <ChakraProvider colorModeManager={manager}>
        <UserProvider user={user}>
          <VStack align="left" height="100dvh" pb="env(safe-area-inset-bottom)">
            <Header />
            {children}
          </VStack>
        </UserProvider>
      </ChakraProvider>
    </SWRConfig>
  );
};
