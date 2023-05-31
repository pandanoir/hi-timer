import { PropsWithChildren } from 'react';
import { setTimeout } from 'timers/promises';
import { redirect } from 'next/navigation';
import { SWRConfigClient } from '../SWRConfigClient';
import { getSession } from '../api/getSession';

export default async function Layout({ children }: PropsWithChildren) {
  const timeout = setTimeout(100, 'timeout' as const);
  const userPromise = getSession().then((session) => session?.user);
  const recordPromise = import('../api/record/read/route')
    .then(({ GET }) =>
      GET(new Request('http://localhost/api/record/read?event=3x3x3&limit=100'))
    )
    .then((res) => res.json())
    .catch(() => undefined);

  if (typeof (await Promise.race([userPromise, timeout])) === 'undefined') {
    redirect('/anonymous');
  }
  const initialRecordData = await Promise.race([
    recordPromise,
    timeout.then(() => undefined),
  ]);
  return (
    <SWRConfigClient
      value={{
        fallback: {
          '/api/record/read?event=3x3x3': initialRecordData,
          '/api/record/read?event=3x3x3&limit=100': initialRecordData,
          '/api/record/read?limit=100&event=3x3x3': initialRecordData,
        },
      }}
    >
      {children}
    </SWRConfigClient>
  );
}
