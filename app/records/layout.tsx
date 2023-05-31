import { PropsWithChildren } from 'react';
import { setTimeout } from 'timers/promises';
import { SWRConfigClient } from '../SWRConfigClient';
import { fetchRecordInServerSide } from '../api/record/read/route';
const unstable_serialize = (key: () => string) => `$inf$${key()}`; // import 'swr' すると 'use client' をつけてないって怒られるので自前実装している

export default async function Layout({ children }: PropsWithChildren) {
  const timeout = setTimeout(300, 'timeout' as const);
  const recordPromise = fetchRecordInServerSide();

  const initialRecordData = await Promise.race([
    recordPromise,
    timeout.then(() => undefined),
  ]);
  return (
    <SWRConfigClient
      value={{
        fallback: initialRecordData && {
          [unstable_serialize(() => '/api/record/read?event=3x3x3&limit=100')]:
            [initialRecordData],
          [unstable_serialize(() => '/api/record/read?limit=100&event=3x3x3')]:
            [initialRecordData],
        },
      }}
    >
      {children}
    </SWRConfigClient>
  );
}
