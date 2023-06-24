/**
 * @jest-environment jsdom
 */
import 'whatwg-fetch';
import RecordPage from './page';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { SWRConfig, unstable_serialize } from 'swr';
import { render } from '../../../__tests__/render';
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: '',
      asPath: '',
    };
  },
}));

describe('RecordPage', () => {
  test('snapshot', async () => {
    const { findByRole, asFragment } = render(
      <UserProvider
        user={{
          nickname: 'user',
          name: 'user@example.com',
          picture: 'https://example.com/profile.png',
          updated_at: '2023-05-31T11:16:50.834Z',
          email: 'user@example.com',
          email_verified: true,
          sub: 'auth0|000000000000000000000000',
          sid: '000000000000000000000000-0000000',
        }}
      >
        <RecordPage params={{ type: undefined }} />
      </UserProvider>
    );
    await findByRole('combobox');
    expect(asFragment()).toMatchSnapshot();
  });
  test('snapshot with prefetch data', async () => {
    const { findByRole, asFragment } = render(
      <SWRConfig
        value={{
          fallback: {
            [`$inf$${unstable_serialize({
              url: '/api/record/read',
              query: { event: '3x3x3', limit: '100' },
            })}`]: [
              {
                data: [
                  {
                    id: '59804293-21f6-4fde-a899-46faba7d99ca',
                    createdAt: '2023-06-07T14:35:54.224Z',
                    time: 13715,
                    penalty: false,
                    dnf: false,
                    scramble:
                      "L  B2 R' D2 U2 B2 R' U2 B2 U2 B  U  R2 D' F' L' U' R2 B  ",
                    userId: 'auth0|000000000000000000000000',
                    event: '3x3x3',
                  },
                  {
                    id: 'dcd7011f-b77d-40cf-9571-b90c51fa90bd',
                    createdAt: '2023-06-07T14:35:23.760Z',
                    time: 15605,
                    penalty: false,
                    dnf: false,
                    scramble:
                      "L  D2 B2 L2 B2 U2 L  F2 R2 U2 F2 R  U' R  F' D' B2 D2 L  B2 ",
                    userId: 'auth0|000000000000000000000000',
                    event: '3x3x3',
                  },
                  {
                    id: '00bdd111-9882-4759-923d-0fe966b8d6fa',
                    createdAt: '2023-06-07T14:34:43.324Z',
                    time: 11508,
                    penalty: false,
                    dnf: false,
                    scramble:
                      "B' U2 B' U2 B' L2 U2 L2 F' L2 U2 F2 R' D  B' L' R2 D' L  D2 F  ",
                    userId: 'auth0|000000000000000000000000',
                    event: '3x3x3',
                  },
                ],
                hasNextPage: true,
              },
            ],
          },
        }}
      >
        <UserProvider
          user={{
            nickname: 'user',
            name: 'user@example.com',
            picture: 'https://example.com/profile.png',
            updated_at: '2023-05-31T11:16:50.834Z',
            email: 'user@example.com',
            email_verified: true,
            sub: 'auth0|000000000000000000000000',
            sid: '000000000000000000000000-0000000',
          }}
        >
          <RecordPage params={{ type: undefined }} />
        </UserProvider>
      </SWRConfig>
    );
    await findByRole('combobox');
    expect(asFragment()).toMatchSnapshot();
  });
});
