'use client';
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import {
  Card,
  CardBody,
  Center,
  Select,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  VStack,
} from '@chakra-ui/react';
import { FC, lazy, Suspense, useMemo, useState } from 'react';
import useSWRInfinite from 'swr/infinite';
import { RecordTable } from './RecordTable';
import { RecordPage, fetchRecordPage } from '../../_utils/fetchRecordPage';
import { useRouter } from 'next/navigation';

const RecordGraph = lazy(() => import('./RecordGraph'));
const DailyAverageGraph = lazy(() => import('./DailyAverageGraph'));
const pageSize = 100;
const useTimerRecordsInfinite = (event: string) => {
  const { data, error, size, setSize } = useSWRInfinite(
    (_pageIndex, prevPage: RecordPage | null) => {
      if (prevPage?.hasNextPage === false) {
        return null;
      }
      return {
        url: '/api/record/read',
        query: {
          event,
          limit: `${pageSize}`,
          cursor: prevPage?.data[prevPage.data.length - 1].id,
        },
      } satisfies Parameters<typeof fetchRecordPage>[0];
    },
    fetchRecordPage
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

const tabUrls = ['/records', '/records/graph', '/records/daily'];
const TimerPage: FC<{ params: { type?: string[] } }> = ({
  params: { type },
}) => {
  const [currentEvent, setCurrentEvent] = useState('3x3x3');
  const { records, error, hasNextPage, setSize } =
    useTimerRecordsInfinite(currentEvent);
  const router = useRouter();

  if (error) {
    return <div>error caused</div>;
  }
  return (
    <VStack w="full" align="left">
      <Select
        w="max-content"
        variant="filled"
        id="event"
        value={currentEvent}
        onChange={(e) => setCurrentEvent(e.target.value)}
      >
        <option value="3x3x3">3x3x3</option>
        <option value="2x2x2">2x2x2</option>
        <option value="4x4x4">4x4x4</option>
        <option value="5x5x5">5x5x5</option>
        <option value="6x6x6">6x6x6</option>
        <option value="7x7x7">7x7x7</option>
      </Select>
      <Tabs
        isLazy
        w="full"
        defaultIndex={tabUrls.indexOf(`/records${type ? `/${type[0]}` : ''}`)}
        onChange={(index) => {
          router.push(tabUrls[index]);
        }}
      >
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
              <Center>
                <Spinner size="xl" />
              </Center>
            )}
          </TabPanel>
          <TabPanel>
            <Card h={96} bg="gray.50" align="center" justify="center">
              <Suspense fallback={<Spinner color="black" size="xl" />}>
                {!records ? (
                  <Spinner size="xl" />
                ) : records.flat().length === 0 ? (
                  <CardBody color="black" textAlign="left" w="full">
                    No data exists
                  </CardBody>
                ) : (
                  <RecordGraph records={records.flat().slice(0, 50)} />
                )}
              </Suspense>
            </Card>
          </TabPanel>
          <TabPanel>
            <DailyAverageGraph event={currentEvent} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};

// HACK: 単に withPageAuthRequired(TimerPage) を export すると TypeError になるのでラップしている
export default function Page({ params }: { params: { type?: string[] } }) {
  return withPageAuthRequired(TimerPage)({ params });
}
