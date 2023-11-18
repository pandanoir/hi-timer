import { PropsWithChildren } from 'react';
import { UserProfile, UserProvider } from '@auth0/nextjs-auth0/client';
import { ChakraProvider, VStack, localStorageManager } from '@chakra-ui/react';
import './global.css';
import { Header } from './Header';

export const RootLayout = ({
  children,
  user,
}: PropsWithChildren<{ user?: UserProfile }>) => {
  return (
    <ChakraProvider colorModeManager={localStorageManager}>
      <UserProvider user={user}>
        <VStack align="left" height="100dvh" pb="env(safe-area-inset-bottom)">
          <Header />
          {children}
        </VStack>
      </UserProvider>
    </ChakraProvider>
  );
};
