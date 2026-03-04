import {
  Box,
  Flex,
  Text,
  Heading,
  Spinner,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
} from "@chakra-ui/react";
import { useMyPayslips } from "../../hooks/useMyPayslips";

const MOIS_LABELS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function formatAriary(amount: number): string {
  return amount.toLocaleString("fr-FR") + " Ar";
}

function statutColor(statut: string): string {
  if (statut === "PAYEE") return "green";
  if (statut === "VALIDEE") return "blue";
  return "yellow";
}

export default function MyPayslipsPage() {
  const { fiches, isLoading, error, telecharger } = useMyPayslips();

  if (isLoading) {
    return (
      <Flex h="full" align="center" justify="center" direction="column" gap={4}>
        <Spinner size="xl" color="#1E3A5F" thickness="3px" />
        <Text color="gray.500" fontSize="sm">Chargement des fiches de paie…</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex h="full" align="center" justify="center" direction="column" gap={4}>
        <Box as="span" className="material-symbols-outlined" fontSize="64px" color="red.400">error</Box>
        <Text color="gray.700" fontWeight="bold">{error}</Text>
      </Flex>
    );
  }

  const totalNet = fiches.reduce((sum, f) => sum + f.salaireNet, 0);

  return (
    <Box as="main" p={{ base: 4, lg: 8 }} maxW="1600px" mx="auto" w="full" display="flex" flexDir="column" gap={8}>
      <Box pb={4} borderBottomWidth="1px" borderColor="gray.200">
        <Heading as="h2" fontSize="3xl" fontWeight="bold" color="gray.900" letterSpacing="tight">
          Mes Fiches de Paie
        </Heading>
        <Text color="gray.500" mt={1}>Consultez et téléchargez vos fiches de paie</Text>
      </Box>

      <Flex gap={4} flexWrap="wrap">
        <Box bg="white" rounded="xl" p={6} shadow="sm" borderWidth="1px" borderColor="gray.200" display="flex" alignItems="center" gap={4}>
          <Flex boxSize={12} bg="blue.50" rounded="xl" align="center" justify="center" flexShrink={0}>
            <Box as="span" className="material-symbols-outlined" fontSize="24px" color="blue.500">receipt_long</Box>
          </Flex>
          <Box>
            <Text color="gray.500" fontSize="sm">Total fiches</Text>
            <Heading as="h3" fontSize="2xl" fontWeight="bold" color="gray.900">{fiches.length}</Heading>
          </Box>
        </Box>
        {fiches.length > 0 && (
          <>
            <Box bg="white" rounded="xl" p={6} shadow="sm" borderWidth="1px" borderColor="gray.200" display="flex" alignItems="center" gap={4}>
              <Flex boxSize={12} bg="green.50" rounded="xl" align="center" justify="center" flexShrink={0}>
                <Box as="span" className="material-symbols-outlined" fontSize="24px" color="green.500">payments</Box>
              </Flex>
              <Box>
                <Text color="gray.500" fontSize="sm">Dernier salaire net</Text>
                <Heading as="h3" fontSize="2xl" fontWeight="bold" color="gray.900">{formatAriary(fiches[0].salaireNet)}</Heading>
              </Box>
            </Box>
            <Box bg="white" rounded="xl" p={6} shadow="sm" borderWidth="1px" borderColor="gray.200" display="flex" alignItems="center" gap={4}>
              <Flex boxSize={12} bg="purple.50" rounded="xl" align="center" justify="center" flexShrink={0}>
                <Box as="span" className="material-symbols-outlined" fontSize="24px" color="purple.500">account_balance</Box>
              </Flex>
              <Box>
                <Text color="gray.500" fontSize="sm">Total net perçu</Text>
                <Heading as="h3" fontSize="2xl" fontWeight="bold" color="gray.900">{formatAriary(totalNet)}</Heading>
              </Box>
            </Box>
          </>
        )}
      </Flex>

      <Box bg="white" rounded="xl" shadow="sm" borderWidth="1px" borderColor="gray.200" overflow="hidden">
        <Flex px={6} py={4} borderBottomWidth="1px" borderColor="gray.200" justify="space-between" align="center">
          <Heading as="h3" fontSize="lg" fontWeight="bold" color="gray.900">
            Historique des fiches de paie
          </Heading>
          <Text fontSize="sm" color="gray.500">{fiches.length} fiche(s)</Text>
        </Flex>

        {fiches.length === 0 ? (
          <Flex p={12} direction="column" align="center" gap={3}>
            <Box as="span" className="material-symbols-outlined" fontSize="48px" color="gray.300">receipt_long</Box>
            <Text color="gray.400" fontSize="sm">Aucune fiche de paie disponible</Text>
          </Flex>
        ) : (
          <Box overflowX="auto">
            <Table variant="unstyled" size="md">
              <Thead bg="gray.50">
                <Tr>
                  {["Période", "Salaire base", "Déductions", "Prime", "Cotisations", "Salaire net", "Statut", ""].map((h, i) => (
                    <Th key={h || `col-${i}`} px={6} py={4} fontSize="xs" textTransform="uppercase" fontWeight="semibold" color="gray.500" letterSpacing="wider" textAlign={i === 7 ? "right" : "left"}>
                      {h}
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {fiches.map((f) => (
                  <Tr key={f.id} _hover={{ bg: "gray.50" }} transition="background 0.15s">
                    <Td px={6} py={4} fontWeight="semibold" color="gray.900" fontSize="sm">
                      {MOIS_LABELS[f.mois - 1]} {f.annee}
                    </Td>
                    <Td px={6} py={4} color="gray.700" fontSize="sm">{formatAriary(f.salaireBase)}</Td>
                    <Td px={6} py={4} color="red.500" fontSize="sm">-{formatAriary(f.deductionAbsences)}</Td>
                    <Td px={6} py={4} color="green.500" fontSize="sm">+{formatAriary(f.primePresence)}</Td>
                    <Td px={6} py={4} color="red.500" fontSize="sm">-{formatAriary(f.cotisationsTotal)}</Td>
                    <Td px={6} py={4} fontWeight="bold" color="gray.900" fontSize="sm">{formatAriary(f.salaireNet)}</Td>
                    <Td px={6} py={4}>
                      <Badge px={2.5} py={0.5} borderRadius="full" fontSize="xs" fontWeight="medium" colorScheme={statutColor(f.statut)} variant="subtle">
                        {f.statut}
                      </Badge>
                    </Td>
                    <Td px={6} py={4} textAlign="right">
                      <IconButton
                        aria-label="Télécharger PDF"
                        variant="ghost"
                        size="sm"
                        icon={<Box as="span" className="material-symbols-outlined" fontSize="20px" lineHeight="1">download</Box>}
                        color="#1E3A5F"
                        _hover={{ bg: "blue.50" }}
                        onClick={() => telecharger(f.id, f.mois, f.annee)}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>
    </Box>
  );
}
