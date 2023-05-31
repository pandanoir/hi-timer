import { PropsWithChildren } from 'react';
import { Metadata } from 'next';
import { setTimeout } from 'timers/promises';
import { RootLayout } from './RootLayout';
import { getSession } from './api/getSession';

export const metadata: Metadata = {
  title: 'Hi-Timer',
  viewport: 'width=device-width, initial-scale=1.0, user-scalable=no',
};

export default async function Layout({ children }: PropsWithChildren) {
  const timeout = setTimeout(100, 'timeout' as const);
  const userPromise = getSession().then((session) => session?.user);

  const user = await Promise.race([userPromise, timeout]);
  return (
    <html>
      <body>
        <RootLayout user={user === 'timeout' ? undefined : user}>
          {children}
        </RootLayout>
      </body>
    </html>
  );
}
