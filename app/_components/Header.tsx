'use client';
import { useUser } from '@auth0/nextjs-auth0/client';
import { MoonIcon, SettingsIcon, SunIcon } from '@chakra-ui/icons';
import {
  Button,
  Fade,
  Heading,
  HStack,
  IconButton,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react';
import Link from 'next/link';
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

export const SecondaryLinkButton = (props: ComponentProps<typeof Button>) => (
  <Button as="a" variant="outline" w="min" {...props} />
);

export const PrimaryLinkButton = (props: ComponentProps<typeof Button>) => (
  <Button as="a" w="min" {...props} />
);

export const Header = () => {
  const { user, isLoading } = useUser();
  const {
    isOpen: isSettingModalOpen,
    onOpen: onSettingModalOpen,
    onClose: onSettingModalClose,
  } = useDisclosure();

  return (
    <HStack justify="space-between" as="header">
      <Heading>
        <Link href="/">Hi-Timer</Link>
      </Heading>
      <Fade in={!isLoading}>
        <HStack>
          <ColorModeButton />
          <IconButton
            onClick={onSettingModalOpen}
            icon={<SettingsIcon />}
            aria-label="setting"
            variant="outline"
          />
          {user ?
            <SecondaryLinkButton href="/records">Records</SecondaryLinkButton>
          : <PrimaryLinkButton colorScheme="blue" href="/api/auth/login">
              Login
            </PrimaryLinkButton>
          }
        </HStack>
      </Fade>
      <SettingModal
        isOpen={isSettingModalOpen}
        onClose={onSettingModalClose}
        isLoggedIn={!!user}
      />
    </HStack>
  );
};
