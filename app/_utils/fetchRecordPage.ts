import { $array, $boolean, $number, $object, $string } from 'lizod';
import { appendSearchParamsByEntries } from './appendSearchParamsByEntries';

const validate = $object({
  data: $array(
    $object(
      {
        time: $number,
        penalty: $boolean,
        dnf: $boolean,
        createdAt: $string,
        scramble: $string,
        id: $string,
        event: $string,
      },
      false
    )
  ),
  hasNextPage: $boolean,
});

export const fetchRecordPage = async (key: {
  url: string;
  query: { event: string; limit: string; cursor: string | undefined };
}) => {
  const url = new URL(key.url, location.origin);
  appendSearchParamsByEntries(url, Object.entries(key.query));
  url.searchParams.sort();

  const res = await (await fetch(url.toString())).json();
  if (!validate(res)) {
    throw new Error('invalid response');
  }
  return { ...res, data: res.data };
};
export type RecordPage = Awaited<ReturnType<typeof fetchRecordPage>>;
