/**
 * @jest-environment jsdom
 */
import Page from './page';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import seedrandom from 'seedrandom';
import { render } from '../../__tests__/render';

describe('TimerPage', () => {
  beforeEach(() => {
    seedrandom('', { global: true });
  });
  test('snapshot', async () => {
    const { asFragment, findByRole } = render(
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
        <Page />
      </UserProvider>
    );
    await findByRole('button', { name: 'inspection start' });
    expect(asFragment()).toMatchSnapshot();
  });
});
