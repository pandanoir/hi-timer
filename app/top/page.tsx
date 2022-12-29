'use client';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import {
  Button,
  Heading,
  VStack,
  HStack,
  IconButton,
  useColorMode,
} from '@chakra-ui/react';

const TopPage = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <VStack h="100vh">
      <HStack justify="space-between" w="full">
        <Heading>Hi-Timer</Heading>
        <HStack>
          <IconButton
            onClick={toggleColorMode}
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            aria-label={'toggle color theme'}
          />
          <Button as="a" href="/api/auth/login">
            login
          </Button>
        </HStack>
      </HStack>
      <VStack as="main" flex="1" justify="center">
        <Heading size="4xl">
          Hi-quality Timer
          <br />
          for speedcubing
        </Heading>
      </VStack>
    </VStack>
  );
};
export default TopPage;
