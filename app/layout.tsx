import { PropsWithChildren } from 'react';
import { Metadata, Viewport } from 'next';
import { setTimeout } from 'timers/promises';
import './global.css';
import { getSession } from '@auth0/nextjs-auth0';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { VStack } from '@chakra-ui/react';
import { $enum } from 'lizod';
import { cookies } from 'next/headers';
import { ChakraProviderClient } from './_components/ChakraProviderClient';
import { Header } from './_components/Header';

export const metadata: Metadata = {
  title: 'Hi-Timer',
};
const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  userScalable: false,
};
export { viewport };

export default async function Layout({ children }: PropsWithChildren) {
  const initColorMode = cookies().get('chakra-ui-color-mode')?.value;
  const timeout = setTimeout(100, 'timeout' as const).then(() => undefined);
  const userPromise = getSession().then((session) => session?.user);

  return (
    <html>
      <body>
        <ChakraProviderClient
          colorMode={
            $enum(['light', 'dark'])(initColorMode) ? initColorMode : 'system'
          }
        >
          <UserProvider user={await Promise.race([userPromise, timeout])}>
            <VStack
              align="left"
              height="100dvh"
              pb="env(safe-area-inset-bottom)"
            >
              <Header />
              {children}
            </VStack>
          </UserProvider>
        </ChakraProviderClient>
      </body>
    </html>
  );
}
