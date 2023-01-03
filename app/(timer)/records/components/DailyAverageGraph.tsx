import { ResponsiveLine } from '@nivo/line';
import { FC, useMemo } from 'react';
import { recordToMilliSeconds } from '../../utils/recordToMilliSeconds';

import useSWRInfinite from 'swr/infinite';
import { TimerRecord } from '../../types/TimerRecord';
import { Button, Card, VStack } from '@chakra-ui/react';
const pageSize = 1000;
const useDailyAverageInfinite = () => {
  const { data, error, size, setSize } = useSWRInfinite<{
    data: TimerRecord[];
    hasNextPage: boolean;
  }>(
    (_pageIndex, previousPageData) => {
      if (previousPageData?.hasNextPage === false) {
        return null;
      }
      const url = new URL('/api/record/read', location.origin);
      url.searchParams.append('limit', `${pageSize}`);
      if (previousPageData) {
        url.searchParams.append(
          'cursor',
          previousPageData.data[previousPageData.data.length - 1].id
        );
      }
      return url.toString();
    },
    async (url) => (await fetch(url)).json()
  );
  const records = data?.map(({ data }) => data);

  const averages = useMemo<Record<string, number>>(() => {
    if (!records) {
      return {};
    }

    const averages: Record<string, number> = {};
    const groupedByDate: Record<string, number[]> = {};
    for (const record of records.flat()) {
      if (record.dnf) {
        continue;
      }
      const date = record.createdAt.replace(/T.+/, '');
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      groupedByDate[date].push(recordToMilliSeconds(record));
    }
    for (const date of Object.keys(groupedByDate)) {
      averages[date] =
        groupedByDate[date].reduce((sum, x) => sum + x, 0) /
        groupedByDate[date].length;
    }
    return averages;
  }, [records]);

  if (!records) {
    return { averages: undefined } as const;
  }
  const hasNextPage = data?.[data.length - 1].hasNextPage !== false; // !data だったら !records なので、undefined になることはない
  return {
    averages,
    error,
    size,
    setSize,
    hasNextPage,
  } as const;
};

const DailyAverageGraph: FC = () => {
  const { averages, setSize, hasNextPage } = useDailyAverageInfinite();
  const data = useMemo(
    () =>
      averages
        ? Object.entries(averages)
            .sort(([a], [b]) => (a > b ? 1 : a === b ? 0 : -1)) // 左のほうが日付が古くなるようにソート
            .map(([date, averageMillisec]) => ({
              x: date,
              y: averageMillisec / 1000,
            }))
        : [],
    [averages]
  );

  if (!averages) {
    return null;
  }
  return (
    <VStack w="full">
      <Card w="full" h={96} bg="gray.50" align="center" justify="center">
        <ResponsiveLine
          theme={{ tooltip: { basic: { color: 'black' } } }}
          data={[{ id: 'record', data }]}
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
                  style: {
                    itemBackground: 'rgba(0, 0, 0, .03)',
                    itemOpacity: 1,
                  },
                },
              ],
            },
          ]}
        />
      </Card>
      {hasNextPage && (
        <Button onClick={() => setSize((size) => size + 1)}>load more</Button>
      )}
    </VStack>
  );
};
export default DailyAverageGraph;
