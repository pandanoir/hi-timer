'use client';
import { Center, Spinner } from '@chakra-ui/react';

const LoadingPage = () => (
  <Center flex="1">
    <Spinner size="xl" />
  </Center>
);
export default LoadingPage;
