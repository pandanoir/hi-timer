'use client';
import { UserProfile, withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import { FC, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import styles from '../../styles/Home.module.css';
import { Timer } from './components/Timer';

type TimerRecord = {
  time: number;
  penalty: boolean;
  dnf: boolean;
  createdAt: number;
  id: string;
};
const useTimerRecords = () => {
  const { mutate } = useSWRConfig();
  const { data: records, error } = useSWR<TimerRecord[]>(
    '/api/record/read',
    async (url) => (await fetch(url)).json()
  );

  if (!records) {
    return { records } as const;
  }

  const update = (id: string, change: Partial<TimerRecord>) => {
    const index = records.findIndex((x) => x.id === id);
    mutate(
      '/api/record/read',
      fetch('/api/record/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...change, id }),
      }).then(async (res) => [
        ...records.slice(0, index),
        await res.json(),
        ...records.slice(index + 1),
      ]),
      {
        optimisticData: [
          ...records.slice(0, index),
          { ...records[index], ...change },
          ...records.slice(index + 1),
        ],
        rollbackOnError: true,
      }
    );
  };
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
    imposePenalty: (id: string) => {
      update(id, { penalty: true });
    },
    toDNF: (id: string) => {
      update(id, { dnf: true });
    },
    undoPenalty: (id: string) => {
      update(id, { penalty: false });
    },
    undoDNF: (id: string) => {
      update(id, { dnf: false });
    },
    deleteRecord: (id: string, change: Partial<TimerRecord>) => {
      const index = records.findIndex((x) => x.id === id);
      mutate(
        '/api/record/read',
        fetch('/api/record/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...change, id }),
        }).then(() => [
          ...records.slice(0, index),
          ...records.slice(index + 1),
        ]),
        {
          optimisticData: [
            ...records.slice(0, index),
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
  const {
    records,
    createNewRecord,
    imposePenalty,
    toDNF,
    undoPenalty,
    undoDNF,
    deleteRecord,
  } = useTimerRecords();
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
              onStop={(record, inspectionTime) => {
                createNewRecord({
                  time: record,
                  penalty: inspectionTime !== null && inspectionTime >= 15000,
                  dnf: inspectionTime !== null && inspectionTime >= 17000,
                  createdAt: Date.now(),
                });
                setIsTimerRecording(false);
              }}
            />
            {records[0] && (
              <>
                {!records[0].dnf && (
                  <button
                    key="+2"
                    onClick={() => {
                      if (records[0].penalty) {
                        undoPenalty(records[0].id);
                      } else {
                        imposePenalty(records[0].id);
                      }
                    }}
                  >
                    {records[0].penalty ? 'undo +2' : '+2'}
                  </button>
                )}
                <button
                  key="DNF"
                  onClick={() => {
                    if (records[0].dnf) {
                      undoDNF(records[0].id);
                    } else {
                      toDNF(records[0].id);
                    }
                  }}
                >
                  {records[0].dnf ? 'undo DNF' : 'DNF'}
                </button>
                <button
                  key="delete"
                  onClick={() => deleteRecord(records[0].id)}
                >
                  delete
                </button>
              </>
            )}
            <ul style={{ overflow: 'scroll', height: 300 }}>
              {records.map(({ time, penalty, dnf, createdAt }) => {
                const timeStr = `${Math.trunc(time) / 1000}sec${
                  penalty ? ' + 2' : ''
                }`;
                return (
                  <li key={createdAt}>{dnf ? `DNF(${timeStr})` : timeStr}</li>
                );
              })}
            </ul>
          </>
        )}
      </main>
    </div>
  );
};
export default withPageAuthRequired(TimerPage);
