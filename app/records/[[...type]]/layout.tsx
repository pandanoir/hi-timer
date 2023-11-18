import { PropsWithChildren } from 'react';
import { setTimeout } from 'timers/promises';
import { SWRConfigClient } from '../../SWRConfigClient';
import { fetchRecordInServerSide } from '../../api/record/read/fetchRecordInServerSide';

export default async function Layout({ children }: PropsWithChildren) {
  const timeout = setTimeout(300, 'timeout' as const);
  const recordPromise = fetchRecordInServerSide();

  const initialRecordData = await Promise.race([
    recordPromise,
    timeout.then(() => undefined),
  ]);
  return (
    <SWRConfigClient
      keyValues={
        initialRecordData
          ? [
              [
                {
                  url: '/api/record/read',
                  query: { event: '3x3x3', limit: '100' },
                },
                initialRecordData,
              ],
            ]
          : []
      }
    >
      {children}
    </SWRConfigClient>
  );
}
