import { PropsWithChildren } from 'react';
import { setTimeout } from 'timers/promises';
import { redirect } from 'next/navigation';
import { kv } from '@vercel/kv';
import { SWRConfigClient } from '../SWRConfigClient';
import { getSession } from '../api/getSession';
import { fetchRecordInServerSide } from '../api/record/read/fetchRecordInServerSide';
import { TimerRecord } from '../_types/TimerRecord';
import { LatestRecordProvider } from './_components/LatestRecordContext';

export default async function Layout({ children }: PropsWithChildren) {
  const timeout = setTimeout(100, 'timeout' as const);
  const userPromise = getSession().then((session) => session?.user);
  const recordPromise = fetchRecordInServerSide();

  const user = await Promise.race([userPromise, timeout]);
  if (typeof user === 'undefined') {
    redirect('/anonymous');
  }
  const initialRecordData = await Promise.race([
    recordPromise,
    timeout.then(() => undefined),
  ]);
  const latestRecordPromise =
    user === 'timeout' ? null : kv.get<TimerRecord>(`${user}--latest-record`);
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
      <LatestRecordProvider value={await latestRecordPromise}>
        {children}
      </LatestRecordProvider>
    </SWRConfigClient>
  );
}
