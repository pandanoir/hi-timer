'use client';
import { UserProfile, withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import { FC, useState } from 'react';
import styles from '../../styles/Home.module.css';
import { Timer } from './components/Timer';

const TimerPage: FC<{ user: UserProfile }> = () => {
  const [usesInspection, setUsesInspection] = useState(true);
  const [records, setRecords] = useState<{ time: number; createdAt: number }[]>(
    []
  );
  const [isTimerRecording, setIsTimerRecording] = useState(false);
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Hi Timer</h1>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/api/auth/logout">Logout</a>
        uses inspection:{' '}
        <input
          type="checkbox"
          checked={usesInspection}
          onChange={({ target: { checked } }) => setUsesInspection(checked)}
          disabled={isTimerRecording}
        />
        <Timer
          usesInspection={usesInspection}
          onStart={() => {
            setIsTimerRecording(true);
          }}
          onStop={(record, _inspectionTime) => {
            setRecords((records) => [
              ...records,
              { time: record, createdAt: Date.now() },
            ]);
            setIsTimerRecording(false);
          }}
        />
        {records.map(({ createdAt, time }) => (
          <li key={createdAt}>{Math.trunc(time) / 1000}sec</li>
        ))}
      </main>
    </div>
  );
};
export default withPageAuthRequired(TimerPage);
