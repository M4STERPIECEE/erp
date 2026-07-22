import { useRef } from "react";
import {
  Box, Text, Button, Spinner, Flex,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
} from "@chakra-ui/react";
import type { DepartmentResponse } from "../../types/department.types";

export default function DeleteDepartementDialog({ dept, isOpen, onClose, onConfirm, isDeleting }: {
  dept: DepartmentResponse | null; isOpen: boolean; onClose: () => void;
  onConfirm: () => void; isDeleting: boolean;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
      <AlertDialogOverlay bg="rgba(15,23,42,0.45)" backdropFilter="blur(6px)">
        <AlertDialogContent rounded="2xl" mx={4} bg="white" fontFamily="'Inter', sans-serif">
          <Box h="4px" bgGradient="linear(to-r, #dc2626, #ef4444)" />
          <AlertDialogHeader fontSize="lg" fontWeight="700" color="gray.900" pt={6}>
            Supprimer le département
          </AlertDialogHeader>
          <AlertDialogBody color="gray.600" fontSize="sm">
            Êtes-vous sûr de vouloir supprimer{" "}
            <Text as="span" fontWeight="600" color="gray.900">
              {dept?.nom}
            </Text>{" "}? Cette action est irréversible.
            {(dept?.nombreEmployes ?? 0) > 0 && (
              <Text mt={2} color="orange.600" fontSize="xs">
                ⚠ Ce département contient {dept?.nombreEmployes} employé(s). Ils seront dissociés.
              </Text>
            )}
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
