import { PropsWithChildren } from 'react';
import { UserProfile, UserProvider } from '@auth0/nextjs-auth0/client';
import { VStack } from '@chakra-ui/react';
import './global.css';
import { Header } from './Header';
import { cookies } from 'next/headers';
import { ChakraProviderClient } from './ChakraProviderClient';
import { $enum } from 'lizod';

export const RootLayout = ({
  children,
  user,
}: PropsWithChildren<{ user?: UserProfile }>) => {
  const initColorMode = cookies().get('chakra-ui-color-mode')?.value;
  return (
    <ChakraProviderClient
      colorMode={
        $enum(['light', 'dark'])(initColorMode) ? initColorMode : 'system'
      }
    >
      <UserProvider user={user}>
        <VStack align="left" height="100dvh" pb="env(safe-area-inset-bottom)">
          <Header />
          {children}
        </VStack>
      </UserProvider>
    </ChakraProviderClient>
  );
};
