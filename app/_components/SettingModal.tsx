import {
  Button,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Switch,
  useColorMode,
  VStack,
} from '@chakra-ui/react';
import { FC } from 'react';
import { usePathname } from 'next/navigation';
import { SecondaryLinkButton, PrimaryLinkButton } from './Header';

export const SettingModal: FC<{
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
}> = ({ isOpen, onClose, isLoggedIn }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const pathname = usePathname();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Settings</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack align="left">
            <FormLabel display="inline-block">
              use light mode{' '}
              <Switch
                isChecked={colorMode === 'light'}
                onChange={toggleColorMode}
              />
            </FormLabel>
            {!isLoggedIn ? null : (
              <>
                {pathname === '/anonymous' ?
                  <SecondaryLinkButton href="/">
                    Switch to Normal Mode
                  </SecondaryLinkButton>
                : <SecondaryLinkButton href="/anonymous">
                    Switch to Anonymous Mode
                  </SecondaryLinkButton>
                }
                <PrimaryLinkButton colorScheme="red" href="/api/auth/logout">
                  Logout
                </PrimaryLinkButton>
              </>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
