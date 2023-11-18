import { PropsWithChildren } from 'react';
import { UserProfile, UserProvider } from '@auth0/nextjs-auth0/client';
import { VStack } from '@chakra-ui/react';
import './global.css';
import { Header } from './Header';
import { cookies } from 'next/headers';
import { ChakraProviderClient } from './ChakraProviderClient';

export const RootLayout = ({
  children,
  user,
}: PropsWithChildren<{ user?: UserProfile }>) => {
  return (
    <ChakraProviderClient
      colorMode={
        cookies().get('chakra-ui-color-mode')?.value === 'light'
          ? 'light'
          : 'dark'
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
