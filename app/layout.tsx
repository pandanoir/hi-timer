import { PropsWithChildren } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hi-Timer',
  viewport: 'width=device-width, initial-scale=1.0, user-scalable=no',
};

export default async function Layout({ children }: PropsWithChildren) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
