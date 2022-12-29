import { FC, PropsWithChildren } from 'react';
import { UserProvider } from '@auth0/nextjs-auth0/client';

const RootLayout: FC<PropsWithChildren> = ({ children }) => (
  <UserProvider>{children}</UserProvider>
);
export default RootLayout;
