'use client';
import { PropsWithChildren, createContext, useContext } from 'react';
import { TimerRecord } from '../../_types/TimerRecord';

export const LatestRecordContext = createContext<TimerRecord | null>(null);
export const LatestRecordProvider = ({
  value,
  children,
}: PropsWithChildren<{
  value: TimerRecord | null;
}>) => (
  <LatestRecordContext.Provider value={value}>
    {children}
  </LatestRecordContext.Provider>
);
export const useLatestRecord = () => useContext(LatestRecordContext);
