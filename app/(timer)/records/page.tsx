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
import { FC, lazy, Suspense } from 'react';
import useSWRInfinite from 'swr/infinite';
import { TimerRecord } from '../types/TimerRecord';
import { RecordTable } from './components/RecordTable';

const RecordGraph = lazy(() => import('./components/RecordGraph'));
const DailyAverageGraph = lazy(() => import('./components/DailyAverageGraph'));
const pageSize = 100;
const useTimerRecordsInfinite = () => {
  const {
    data: records,
    error,
    size,
    setSize,
  } = useSWRInfinite<TimerRecord[]>(
    (_pageIndex, previousPageData) => {
      if (previousPageData && previousPageData.length < pageSize) {
        return null;
      }
      const url = new URL('/api/record/read', location.origin);
      url.searchParams.append('limit', `${pageSize}`);
      if (previousPageData) {
        url.searchParams.append(
          'cursor',
          previousPageData[previousPageData.length - 1].id
        );
      }
      return url.toString();
    },
    async (url) => (await fetch(url)).json()
  );

  if (!records) {
    return { records } as const;
  }

  return {
    records,
    error,
    size,
    setSize,
  } as const;
};

const TimerPage: FC<{ user: UserProfile }> = () => {
  const { records, error, setSize } = useTimerRecordsInfinite();
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
              pageSize={pageSize}
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
