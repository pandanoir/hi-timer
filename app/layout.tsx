import { PropsWithChildren } from 'react';
import { Metadata, Viewport } from 'next';
import { setTimeout } from 'timers/promises';
import { RootLayout } from './RootLayout';
import { getSession } from './api/getSession';
import { ColorModeScript } from '@chakra-ui/react';
import { cookies } from 'next/headers';

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
  const timeout = setTimeout(100, 'timeout' as const).then(() => undefined);
  const userPromise = getSession().then((session) => session?.user);

  return (
    <html>
      <body>
        <ColorModeScript
          initialColorMode={
            cookies().get('chakra-ui-color-mode')?.value === 'light'
              ? 'light'
              : 'dark'
          }
        />
        <RootLayout user={await Promise.race([userPromise, timeout])}>
          {children}
        </RootLayout>
      </body>
    </html>
  );
}
