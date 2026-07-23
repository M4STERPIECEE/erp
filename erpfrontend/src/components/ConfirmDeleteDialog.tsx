import { useRef, type ReactNode } from "react";
import {
  Box, Button, Spinner, Flex,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
} from "@chakra-ui/react";

export interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  title: string;
  children: ReactNode;
}

export default function ConfirmDeleteDialog({ isOpen, onClose, onConfirm, isDeleting, title, children }: ConfirmDeleteDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
      <AlertDialogOverlay bg="rgba(15,23,42,0.45)" backdropFilter="blur(6px)">
        <AlertDialogContent rounded="2xl" mx={4} bg="white">
          <Box h="4px" bgGradient="linear(to-r, #dc2626, #ef4444)" />
          <AlertDialogHeader fontSize="lg" fontWeight="700" color="gray.900" pt={6}>
            {title}
          </AlertDialogHeader>
          <AlertDialogBody color="gray.600" fontSize="sm">
            {children}
          </AlertDialogBody>
          <AlertDialogFooter pb={6}>
            <Flex w="full" gap={3}>
              <Button ref={cancelRef} flex={1} h="44px" bg="gray.100" color="gray.700" fontWeight="600" fontSize="sm" rounded="xl" _hover={{ bg: "gray.200" }} onClick={onClose} isDisabled={isDeleting}>
                Annuler
              </Button>
              <Button flex={1} h="44px" bg="#dc2626" color="white" fontWeight="600" fontSize="sm" rounded="xl" _hover={{ bg: "#b91c1c" }} onClick={onConfirm} isLoading={isDeleting} spinner={<Spinner size="sm" />}>
                Supprimer
              </Button>
            </Flex>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
