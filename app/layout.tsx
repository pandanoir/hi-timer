import { FC, PropsWithChildren } from 'react';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import '../styles/globals.css';

const RootLayout: FC<PropsWithChildren> = ({ children }) => (
  <html>
    <body>
      <UserProvider>{children}</UserProvider>
    </body>
  </html>
);
export default RootLayout;
