'use client';
import { UserProfile, withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import {
  Card,
  Flex,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';
import { FC, lazy, Suspense, useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';
import { TimerRecord } from '../types/TimerRecord';
import { RecordTable } from './components/RecordTable';

const RecordGraph = lazy(() => import('./components/RecordGraph'));
const DailyAverageGraph = lazy(() => import('./components/DailyAverageGraph'));
const pageSize = 100;
const useTimerRecordsInfinite = () => {
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
  const records = useMemo(() => data?.map(({ data }) => data), [data]);

  if (!records) {
    // !records と !data どっちかだけでいいんだけど、型推論のために両方必要
    return { records } as const;
  }

  return {
    records,
    hasNextPage: data?.[data.length - 1].hasNextPage !== false, // data は undefined にはならないはず
    error,
    size,
    setSize,
  } as const;
};

const TimerPage: FC<{ user: UserProfile }> = () => {
  const { records, error, hasNextPage, setSize } = useTimerRecordsInfinite();
  if (error) {
    return <div>error caused</div>;
  }
  return (
    <Tabs isLazy>
      <TabList>
        <Tab>table</Tab>
        <Tab>graph</Tab>
        <Tab>daily average</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          {records ? (
            <RecordTable
              records={records}
              hasNextPage={hasNextPage}
              onLoadMoreClick={() => setSize((size) => size + 1)}
            />
          ) : (
            <Flex justify="center">
              <Spinner size="xl" />
            </Flex>
          )}
        </TabPanel>
        <TabPanel>
          <Card h={96} bg="gray.50" align="center" justify="center">
            <Suspense fallback={<Spinner color="black" size="xl" />}>
              {records ? (
                <RecordGraph records={records.flat().slice(0, 50)} />
              ) : (
                <Spinner size="xl" />
              )}
            </Suspense>
          </Card>
        </TabPanel>
        <TabPanel>
          <DailyAverageGraph />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};
export default withPageAuthRequired(TimerPage);
