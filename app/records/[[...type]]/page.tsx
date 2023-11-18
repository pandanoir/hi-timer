'use client';
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import {
  Card,
  CardBody,
  Center,
  FormLabel,
  Select,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  VStack,
} from '@chakra-ui/react';
import { lazy, Suspense, useMemo, useState } from 'react';
import useSWRInfinite from 'swr/infinite';
import { RecordTable } from './_components/RecordTable';
import { RecordPage, fetchRecordPage } from '../../_utils/fetchRecordPage';
import { useRouter } from 'next/navigation';

const RecordGraph = lazy(() => import('./_components/RecordGraph'));
const DailyAverageGraph = lazy(() => import('./_components/DailyAverageGraph'));
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
    fetchRecordPage,
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

const TimerPage = ({ params: { type } }: { params: { type?: string[] } }) => {
  const [currentEvent, setCurrentEvent] = useState('3x3x3');
  const [pageSize, setPageSize] = useState(100);
  const { records, error, hasNextPage, setSize } =
    useTimerRecordsInfinite(currentEvent);
  const router = useRouter();

  const tabs = [
    { title: 'graph', url: '/records' },
    { title: 'daily average', url: '/records/daily' },
    { title: 'table', url: '/records/table' },
  ];

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
        index={
          type ?
            tabs.findIndex(({ url }) => url === `/records/${type[0]}`)
          : tabs.findIndex(({ url }) => url === '/records')
        }
        onChange={(index) => {
          router.push(tabs[index].url, { forceOptimisticNavigation: true });
        }}
      >
        <TabList>
          {tabs.map(({ title }) => (
            <Tab key={title}>{title}</Tab>
          ))}
        </TabList>
        <TabPanels>
          <TabPanel>
            <FormLabel display="flex" alignItems="center" gap="2">
              number of records:
              <Select
                w="max-content"
                variant="filled"
                value={pageSize}
                onChange={(e) => {
                  const pageSize = Number(e.target.value);
                  setPageSize(pageSize);
                  setSize?.(pageSize / 100);
                }}
              >
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="500">500</option>
                <option value="1000">1000</option>
                <option value="2500">2500</option>
              </Select>
            </FormLabel>
            <Card h={96} align="center" justify="center" variant="filled">
              <Suspense fallback={<Spinner color="black" size="xl" />}>
                {!records ?
                  <Spinner size="xl" />
                : records.flat().length === 0 ?
                  <CardBody color="black" textAlign="left" w="full">
                    No data exists
                  </CardBody>
                : <RecordGraph records={records.flat().slice(0, pageSize)} />}
              </Suspense>
            </Card>
          </TabPanel>
          <TabPanel>
            <DailyAverageGraph event={currentEvent} />
          </TabPanel>
          <TabPanel>
            {records ?
              <RecordTable
                records={records}
                hasNextPage={hasNextPage}
                onLoadMoreClick={() => setSize((size) => size + 1)}
              />
            : <Center>
                <Spinner size="xl" />
              </Center>
            }
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};

export default withPageAuthRequired(TimerPage);
