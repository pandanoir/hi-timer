'use client';
import { useUser } from '@auth0/nextjs-auth0/client';
import { MoonIcon, SettingsIcon, SunIcon } from '@chakra-ui/icons';
import {
  Button,
  Link,
  Heading,
  HStack,
  IconButton,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { ComponentProps } from 'react';
import { SettingModal } from './SettingModal';

const ColorModeButton = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <IconButton
      onClick={toggleColorMode}
      icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
      aria-label="toggle color theme"
      variant="outline"
    />
  );
};
const SettingButton = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const {
    isOpen: isSettingModalOpen,
    onOpen: onSettingModalOpen,
    onClose: onSettingModalClose,
  } = useDisclosure();
  return (
    <>
      <IconButton
        onClick={onSettingModalOpen}
        icon={<SettingsIcon />}
        aria-label="setting"
        variant="outline"
      />
      <SettingModal
        isOpen={isSettingModalOpen}
        onClose={onSettingModalClose}
        isLoggedIn={isLoggedIn}
      />
    </>
  );
};

export const SecondaryLinkButton = (props: ComponentProps<typeof Button>) => (
  <Button as={NextLink} variant="outline" w="min" {...props} />
);

export const PrimaryLinkButton = (props: ComponentProps<typeof Button>) => (
  <Button as={NextLink} w="min" {...props} />
);

export const Header = () => {
  const { user } = useUser();

  return (
    <HStack justify="space-between" as="header">
      <Heading>
        <Link as={NextLink} href="/" _hover={{ textDecoration: 'none' }}>
          Hi-Timer
        </Link>
      </Heading>
      <HStack>
        <ColorModeButton />
        <SettingButton isLoggedIn={!!user} />
        {user ?
          <SecondaryLinkButton href="/records">Records</SecondaryLinkButton>
        : <PrimaryLinkButton colorScheme="blue" href="/api/auth/login">
            Login
          </PrimaryLinkButton>
        }
      </HStack>
    </HStack>
  );
};
