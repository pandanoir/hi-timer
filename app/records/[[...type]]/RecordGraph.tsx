import { ResponsiveLine } from '@nivo/line';
import { FC, useMemo } from 'react';
import { TimerRecord } from '../../_types/TimerRecord';
import { recordToMilliSeconds } from '../../_utils/recordToMilliSeconds';
import { calcRa } from '../../_utils/calcRollingAverage';

const RecordGraph: FC<{ records: TimerRecord[] }> = ({ records }) => {
  const reversed = useMemo(() => [...records].reverse(), [records]);
  const data = useMemo(
    () =>
      reversed.map((time) => ({
        x: time.createdAt.replace(/^\d+\//, ''),
        y: time.dnf ? null : recordToMilliSeconds(time) / 1000,
      })),
    [reversed]
  );
  const ao5 = useMemo(
    () =>
      calcRa(reversed, 5).map((time, i) => ({
        x: reversed[i].createdAt.replace(/^\d+\//, ''),
        y: time && Number.isFinite(time) ? time / 1000 : null,
      })),
    [reversed]
  );
  const ao12 = useMemo(
    () =>
      calcRa(reversed, 12).map((time, i) => ({
        x: reversed[i].createdAt.replace(/^\d+\//, ''),
        y: time && Number.isFinite(time) ? time / 1000 : null,
      })),
    [reversed]
  );

  return (
    <ResponsiveLine
      theme={{ tooltip: { basic: { color: 'black' } } }}
      data={[
        { id: 'record', data },
        { id: 'ao5', data: ao5 },
        { id: 'ao12', data: ao12 },
      ]}
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      xScale={{ type: 'point' }}
      yScale={{
        type: 'linear',
        min: 'auto',
        max: 'auto',
        stacked: false,
        reverse: false,
      }}
      yFormat=" >-.2f"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 15,
        legend: 'date',
        legendOffset: 36,
        legendPosition: 'middle',
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'time',
        legendOffset: -40,
        legendPosition: 'middle',
      }}
      pointSize={10}
      pointColor={{ theme: 'background' }}
      pointBorderWidth={2}
      pointBorderColor={{ from: 'serieColor' }}
      pointLabelYOffset={-12}
      useMesh
      legends={[
        {
          anchor: 'bottom-right',
          direction: 'column',
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: 'left-to-right',
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: 'circle',
          symbolBorderColor: 'rgba(0, 0, 0, .5)',
          effects: [
            {
              on: 'hover',
              style: { itemBackground: 'rgba(0, 0, 0, .03)', itemOpacity: 1 },
            },
          ],
        },
      ]}
    />
  );
};
export default RecordGraph;
