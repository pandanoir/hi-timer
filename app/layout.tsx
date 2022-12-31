import { PropsWithChildren } from 'react';
import { headers } from 'next/headers';
import { UserProvider } from '@auth0/nextjs-auth0/client';

import { getSession as auth0GetSession } from '@auth0/nextjs-auth0';
import { IncomingMessage, ServerResponse } from 'http';
import { Socket } from 'net';

// https://github.com/auth0/nextjs-auth0/issues/889#issuecomment-1337896197
// Note: This is an experiment to test that the SDK works in the experimental app directory.
// You should not rely on this code (or the app directory) in production.
const reqRes = () => {
  const req = new IncomingMessage(new Socket());
  const header = headers();
  for (const key of header.keys()) {
    req.headers[key] = header.get(key) || '';
  }
  return { req, res: new ServerResponse(req) };
};

const getSession = () => {
  const { req, res } = reqRes();
  return auth0GetSession(req, res);
};

export default async function RootLayout({ children }: PropsWithChildren) {
  const session = await getSession();
  return (
    <html>
      <body>
        <UserProvider user={session?.user}>{children}</UserProvider>
      </body>
    </html>
  );
}
