import { FC, PropsWithChildren } from 'react';

const RootLayout: FC<PropsWithChildren> = ({ children }) => (
  <html>
    <body>{children}</body>
  </html>
);
export default RootLayout;
