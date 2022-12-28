'use client';
import { UserProfile, withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import { FC, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import styles from '../../styles/Home.module.css';
import { Timer } from './components/Timer';

type TimerRecord = { time: number; createdAt: number; id: string };
const useTimerRecords = () => {
  const { mutate } = useSWRConfig();
  const { data: records, error } = useSWR<TimerRecord[]>(
    '/api/record/read',
    (url) => fetch(url).then((res) => res.json())
  );

  if (!records) {
    return { records } as const;
  }
  return {
    records,
    error,
    createNewRecord: (record: Omit<TimerRecord, 'id'>) => {
      mutate(
        '/api/record/read',
        fetch('/api/record/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        }).then(async (res) => [await res.json(), ...records]),
        {
          optimisticData: [
            { ...record, id: 'temp' },
            ...records,
          ] satisfies TimerRecord[],
          rollbackOnError: true,
        }
      );
    },
    update: (id: string, newRecord: TimerRecord) => {
      const index = records.findIndex((x) => x.id === id);
      mutate(
        '/api/record/read',
        fetch('/api/record/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRecord),
        }).then(async (res) => [
          ...records.slice(0, index),
          await res.json(),
          ...records.slice(index + 1),
        ]),
        {
          optimisticData: [
            ...records.slice(0, index),
            newRecord,
            ...records.slice(index + 1),
          ],
          rollbackOnError: true,
        }
      );
    },
  } as const;
};

const TimerPage: FC<{ user: UserProfile }> = () => {
  const [usesInspection, setUsesInspection] = useState(true);
  const { records, createNewRecord } = useTimerRecords();
  const [isTimerRecording, setIsTimerRecording] = useState(false);
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Hi Timer</h1>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/api/auth/logout">Logout</a>
        uses inspection:
        <input
          type="checkbox"
          checked={usesInspection}
          onChange={({ target: { checked } }) => setUsesInspection(checked)}
          disabled={isTimerRecording}
        />
        {records && (
          <>
            <Timer
              usesInspection={usesInspection}
              onStart={() => {
                setIsTimerRecording(true);
              }}
              onStop={(record, _inspectionTime) => {
                createNewRecord({ time: record, createdAt: Date.now() });
                setIsTimerRecording(false);
              }}
            />
            {records.map(({ createdAt, time }) => (
              <li key={createdAt}>{Math.trunc(time) / 1000}sec</li>
            ))}
          </>
        )}
      </main>
    </div>
  );
};
export default withPageAuthRequired(TimerPage);
