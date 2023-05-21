import { TimerRecord } from '../_types/TimerRecord';
import { calcAo } from './calcAo';

export const calcBestAo = (records: TimerRecord[], size: number) => {
  let ao = Infinity;
  for (let i = 0; i + size <= records.length; i++) {
    ao = Math.min(ao, calcAo(records.slice(i, i + size)));
  }
  return ao;
};
