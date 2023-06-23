/*
  Warnings:

  - A unique constraint covering the columns `[time,scramble]` on the table `TimerRecord` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `TimerRecord_time_scramble_key` ON `TimerRecord`(`time`, `scramble`);
