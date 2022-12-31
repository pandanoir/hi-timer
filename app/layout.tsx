import { PropsWithChildren } from 'react';
import { cookies } from 'next/headers';
import { UserProvider } from '@auth0/nextjs-auth0/client';

const getUser = async () =>
  (
    await fetch(`${process.env.AUTH0_BASE_URL}/api/auth/me`, {
      headers: { cookie: `appSession=${cookies().get('appSession')?.value}` },
    })
  ).text();

export default async function RootLayout({ children }: PropsWithChildren) {
  const user = await getUser();
  return (
    <html>
      <body>
        <UserProvider user={user === '' ? undefined : JSON.parse(user)}>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
