import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';
export default handleAuth({
  login: (req, res) => handleLogin(req, res, { returnTo: '/todo' }),
});
