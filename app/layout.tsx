import { PropsWithChildren } from 'react';
import { UserProvider } from '@auth0/nextjs-auth0/client';

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <html>
      <body>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
