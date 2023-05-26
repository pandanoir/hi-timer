import { PropsWithChildren } from 'react';
import { Metadata } from 'next';
import { RootLayout } from './RootLayout';

export const metadata: Metadata = {
  title: 'Hi-Timer',
  viewport: 'width=device-width, initial-scale=1.0, user-scalable=no',
};

export default function Layout({ children }: PropsWithChildren) {
  return (
    <html>
      <body>
        <RootLayout>{children}</RootLayout>
      </body>
    </html>
  );
}
