export const appendSearchParamsByEntries = (
  url: URL,
  entries: [string, unknown][]
) => {
  for (const [k, v] of entries) {
    if (typeof v !== 'string') {
      continue;
    }
    url.searchParams.append(k, v);
  }
  url.searchParams.sort();
};
