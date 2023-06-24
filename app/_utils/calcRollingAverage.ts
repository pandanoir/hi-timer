import { TimerRecord } from '../_types/TimerRecord';
import { calcAo } from './calcAo';

export const calcRa = (records: TimerRecord[], size: number) => {
  const res: (number | null)[] = Array(records.length);
  for (let i = 0; i < size - 1; i++) {
    res[i] = null;
  }
  for (let i = 0; i + size - 1 < records.length; i++) {
    res[i + size - 1] = calcAo(records.slice(i, i + size));
  }
  return res;
};
