import { PropsWithChildren } from 'react';
import { setTimeout } from 'timers/promises';
import { redirect } from 'next/navigation';
import { SWRConfigClient } from '../SWRConfigClient';
import { getSession } from '../api/getSession';
import { fetchRecordInServerSide } from '../api/record/read/route';

export default async function Layout({ children }: PropsWithChildren) {
  const timeout = setTimeout(100, 'timeout' as const);
  const userPromise = getSession().then((session) => session?.user);
  const recordPromise = fetchRecordInServerSide();

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
      keyValues={[
        [
          { url: '/api/record/read', query: { event: '3x3x3', limit: '100' } },
          initialRecordData,
        ],
      ]}
    >
      {children}
    </SWRConfigClient>
  );
}
