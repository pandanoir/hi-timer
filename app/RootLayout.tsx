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
import { SWRConfig } from 'swr';
import { unstable_serialize } from 'swr/infinite';

const manager = createLocalStorageManager('hi-timer-color-mode-manager');
export const RootLayout = ({
  children,
  initialRecordData,
  user,
}: PropsWithChildren<{
  initialRecordData: unknown;
  user?: UserProfile;
}>) => (
  <SWRConfig
    value={{
      fallback: {
        '/api/record/read?event=3x3x3': initialRecordData,
        '/api/record/read?event=3x3x3&limit=100': initialRecordData,
        '/api/record/read?limit=100&event=3x3x3': initialRecordData,
        [unstable_serialize(() => '/api/record/read?event=3x3x3&limit=100')]: [
          initialRecordData,
        ],
        [unstable_serialize(() => '/api/record/read?limit=100&event=3x3x3')]: [
          initialRecordData,
        ],
      },
    }}
  >
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
