import { headers } from 'next/headers';
import { getSession as auth0GetSession } from '@auth0/nextjs-auth0';
import { IncomingMessage, ServerResponse } from 'http';
import { Socket } from 'net';

export const getSession = () => {
  const req = new IncomingMessage(new Socket());
  headers().forEach((v, k) => (req.headers[k] = v));
  const res = new ServerResponse(req);
  return auth0GetSession(req, res);
};
