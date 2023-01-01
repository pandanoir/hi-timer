import { TimerRecord } from '../types/TimerRecord';

export const recordToMilliSeconds = ({ time, penalty, dnf }: TimerRecord) =>
  dnf ? Infinity : time + (penalty ? 2000 : 0);
