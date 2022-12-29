'use client';
import { FC, PropsWithChildren } from 'react';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { ChakraProvider } from '@chakra-ui/react';

const RootLayout: FC<PropsWithChildren> = ({ children }) => (
  <ChakraProvider>
    <UserProvider>{children}</UserProvider>
  </ChakraProvider>
);
export default RootLayout;
