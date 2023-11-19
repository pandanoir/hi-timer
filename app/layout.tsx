import { PropsWithChildren } from 'react';
import { Metadata, Viewport } from 'next';
import { setTimeout } from 'timers/promises';
import { RootLayout } from './_components/RootLayout';
import { ColorModeScript } from '@chakra-ui/react';
import { cookies } from 'next/headers';
import './global.css';
import { getSession } from '@auth0/nextjs-auth0';

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
  const cookieStore = cookies(); // HACK: getSession より後に cookies を呼び出すと DynamicServerError - Dynamic Server Usage で怒られる。そのためココで cookieStore に格納している
  const timeout = setTimeout(100, 'timeout' as const).then(() => undefined);
  const userPromise = getSession().then((session) => session?.user);

  return (
    <html>
      <body>
        <ColorModeScript
          initialColorMode={
            cookieStore.get('chakra-ui-color-mode')?.value === 'light' ?
              'light'
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
