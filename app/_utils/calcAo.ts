import { TimerRecord } from '../_types/TimerRecord';
import { recordToMilliSeconds } from './recordToMilliSeconds';

export const calcAo = (records: TimerRecord[]) => {
  const sorted = records.map(recordToMilliSeconds).sort((a, b) => a - b);
  const numToOmit = Math.ceil(records.length * 0.05) * 2;
  return (
    sorted
      .slice(numToOmit / 2, sorted.length - numToOmit / 2)
      .reduce((sum, x) => sum + x, 0) /
    (records.length - numToOmit)
  );
};
