import { PropsWithChildren } from 'react';
import { setTimeout } from 'timers/promises';
import { redirect } from 'next/navigation';
import { RootLayout } from './RootLayout';
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

  const [recordData, user] = await Promise.all([
    Promise.race([recordPromise, timeout]),
    Promise.race([userPromise, timeout]),
  ]);
  if (typeof user === 'undefined') {
    redirect('/anonymous');
  }
  return (
    <RootLayout
      initialRecordData={recordData === 'timeout' ? undefined : recordData}
      user={user === 'timeout' ? undefined : user}
    >
      {children}
    </RootLayout>
  );
}
