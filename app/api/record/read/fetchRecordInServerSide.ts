import { GET } from './route';

export const fetchRecordInServerSide = () =>
  GET(new Request('http://localhost/api/record/read?event=3x3x3&limit=100'))
    .then((res) => res.json() as Promise<Response>)
    .catch(() => undefined);
