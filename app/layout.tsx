import { FC, PropsWithChildren } from 'react';
import { UserProvider } from '@auth0/nextjs-auth0/client';

const RootLayout: FC<PropsWithChildren> = ({ children }) => (
  <html>
    <body>{children}</body>
  </html>
);
export default RootLayout;
