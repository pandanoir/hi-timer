import { PropsWithChildren } from 'react';
import { Metadata } from 'next';
import { RootLayout } from './RootLayout';
import { getSession } from './api/getSession';

export const metadata: Metadata = {
  title: 'Hi-Timer',
  viewport: 'width=device-width, initial-scale=1.0, user-scalable=no',
};

export default async function Layout({ children }: PropsWithChildren) {
  const userPromise = getSession().then((session) => session?.user);
  const recordPromise = import('./api/record/read/route')
    .then(({ GET }) =>
      GET(new Request('http://localhost/api/record/read?event=3x3x3&limit=100'))
    )
    .then((res) => res.json())
    .catch(() => undefined);
  return (
    <html>
      <body>
        <RootLayout
          initialRecordData={await recordPromise}
          user={await userPromise}
        >
          {children}
        </RootLayout>
      </body>
    </html>
  );
}
