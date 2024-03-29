import { TimerRecord } from '../_types/TimerRecord';

export const recordToMilliSeconds = ({ time, penalty, dnf }: TimerRecord) =>
  dnf ? Infinity : time + (penalty ? 2000 : 0);
