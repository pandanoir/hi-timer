import { PropsWithChildren } from 'react';
import { render } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';

const AllTheProviders = ({ children }: PropsWithChildren) => (
  <ChakraProvider>{children}</ChakraProvider>
);

const customRender = (...args: Parameters<typeof render>) =>
  render(args[0], { wrapper: AllTheProviders, ...args[1] });

export { customRender as render };
