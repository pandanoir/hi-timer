import { ResponsiveLine } from '@nivo/line';
import { FC } from 'react';
import { TimerRecord } from '../../types/TimerRecord';
import { recordToMilliSeconds } from '../../utils/recordToMilliSeconds';

const RecordGraph: FC<{ records: TimerRecord[] }> = ({ records }) => (
  <ResponsiveLine
    theme={{ tooltip: { basic: { color: 'black' } } }}
    data={[
      {
        id: 'record',
        data: [...records].reverse().map((time) => ({
          x: new Date(time.createdAt).toLocaleString().replace(/^\d+\//, ''),
          y: time.dnf ? null : recordToMilliSeconds(time) / 1000,
        })),
      },
    ]}
    margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
    xScale={{ type: 'point' }}
    yScale={{
      type: 'linear',
      min: 'auto',
      max: 'auto',
      stacked: true,
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
export default RecordGraph;
