import {
  Box, Flex, Text, Badge, Grid, Divider,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
} from "@chakra-ui/react";
import type { EmployeeResponse } from "../types/employee.types";
import { useDepartments } from "../hooks/useDepartments";

interface ViewEmployeeModalProps {
  employee: EmployeeResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

function InfoField({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <Box>
      <Text fontSize="xs" fontWeight="medium" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={0.5}>{label}</Text>
      <Text fontSize="sm" color={value != null ? "gray.900" : "gray.400"}>{value ?? "—"}</Text>
    </Box>
  );
}

const statutColor: Record<string, string> = {
  ACTIF: "green",
  INACTIF: "gray",
  SUSPENDU: "red",
};

const contratColor: Record<string, string> = {
  CDI: "blue",
  CDD: "orange",
  FREELANCE: "purple",
  STAGE: "yellow",
};

export default function ViewEmployeeModal({ employee, isOpen, onClose }: ViewEmployeeModalProps) {
  const { departements } = useDepartments();

  if (!employee) return null;

  const deptName = departements.find((d) => d.id === employee.departementId)?.nom ?? "—";

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay bg="rgba(15,23,42,0.45)" backdropFilter="blur(6px)" />
      <ModalContent rounded="2xl" fontFamily="'Inter', sans-serif" overflow="hidden" bg="white">
        <Box h="4px" bgGradient="linear(to-r, #0f4c81, #1e88e5)" />
        <ModalHeader px={7} pt={6} pb={3}>
          <Flex align="flex-start" justify="space-between" gap={3}>
            <Box>
              <Text fontSize="xl" fontWeight="700" color="gray.900">{employee.prenom} {employee.nom}</Text>
              <Text fontSize="sm" color="gray.500" mt={0.5}>{employee.matricule} · {employee.poste}</Text>
            </Box>
            <Flex gap={2} flexShrink={0}>
              <Badge colorScheme={statutColor[employee.statut] ?? "gray"} px={2.5} py={1} borderRadius="full" fontSize="xs" fontWeight="medium">
                {employee.statut}
              </Badge>
              {employee.contractType && (
                <Badge colorScheme={contratColor[employee.contractType] ?? "gray"} px={2.5} py={1} borderRadius="full" fontSize="xs" fontWeight="medium">
                  {employee.contractType}
                </Badge>
              )}
            </Flex>
          </Flex>
        </ModalHeader>
        <ModalCloseButton top={5} right={5} color="gray.500" _hover={{ bg: "gray.100", color: "gray.700" }} />
        <ModalBody px={7} pb={7}>
          <Divider mb={5} />
          <Text fontSize="xs" fontWeight="semibold" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={4}>
            Informations personnelles
          </Text>
          <Grid templateColumns="1fr 1fr" gap={5} mb={6}>
            <InfoField label="Nom" value={employee.nom} />
            <InfoField label="Prénom" value={employee.prenom} />
            <InfoField label="Email" value={employee.email} />
            <InfoField label="Téléphone" value={employee.telephone} />
            <InfoField label="Date de naissance" value={employee.dateNaissance} />
          </Grid>
          <Divider mb={5} />
          <Text fontSize="xs" fontWeight="semibold" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={4}>
            Informations professionnelles
          </Text>
          <Grid templateColumns="1fr 1fr" gap={5} mb={6}>
            <InfoField label="Poste" value={employee.poste} />
            <InfoField label="Département" value={deptName} />
            <InfoField label="Date d'embauche" value={employee.dateEmbauche} />
            <InfoField label="Statut" value={employee.statut} />
          </Grid>
          <Divider mb={5} />
          <Text fontSize="xs" fontWeight="semibold" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={4}>
            Contrat
          </Text>
          <Grid templateColumns="1fr 1fr" gap={5}>
            <InfoField label="Type de contrat" value={employee.contractType} />
            <InfoField
              label="Salaire de base"
              value={employee.salaireBase != null ? `${Number(employee.salaireBase).toLocaleString("fr-FR")} €` : null}
            />
          </Grid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
