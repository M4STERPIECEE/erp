import {
  Box,
  Flex,
  Text,
  Heading,
  Button,
  Spinner,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  SimpleGrid,
  useDisclosure,
} from "@chakra-ui/react";
import { useMyLeaves } from "../../hooks/useMyLeaves";
import RequestLeaveModal from "../../components/RequestLeaveModal";

function statutColor(statut: string): string {
  if (statut === "APPROUVE") return "green";
  if (statut === "EN_ATTENTE") return "yellow";
  return "red";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR");
}

export default function MyLeavesPage() {
  const { conges, stats, isLoading, error, annuler, refresh } = useMyLeaves();
  const { isOpen, onOpen, onClose } = useDisclosure();

  if (isLoading) {
    return (
      <Flex h="full" align="center" justify="center" direction="column" gap={4}>
        <Spinner size="xl" color="#1E3A5F" thickness="3px" />
        <Text color="gray.500" fontSize="sm">Chargement des congés…</Text>
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

  return (
    <Box as="main" p={{ base: 4, lg: 8 }} maxW="1600px" mx="auto" w="full" display="flex" flexDir="column" gap={8}>
      <Flex as="header" justify="space-between" align="flex-end" pb={4} borderBottomWidth="1px" borderColor="gray.200">
        <Box>
          <Heading as="h2" fontSize="3xl" fontWeight="bold" color="gray.900" letterSpacing="tight">
            Mes Congés
          </Heading>
          <Text color="gray.500" mt={1}>Gérez vos demandes de congés</Text>
        </Box>
        <Button bg="#1E3A5F" color="white" px={5} py={2.5} rounded="lg" fontSize="sm" fontWeight="medium" leftIcon={<Box as="span" className="material-symbols-outlined" fontSize="18px" lineHeight="1">add</Box>} _hover={{ bg: "rgba(30,58,95,0.9)" }} boxShadow="sm" onClick={onOpen}>
          Demander un congé
        </Button>
      </Flex>

      {stats && (
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Box bg="white" rounded="xl" p={6} shadow="sm" borderWidth="1px" borderColor="gray.200" display="flex" alignItems="center" gap={4}>
            <Flex boxSize={12} bg="green.50" rounded="xl" align="center" justify="center" flexShrink={0}>
              <Box as="span" className="material-symbols-outlined" fontSize="24px" color="green.500">event_available</Box>
            </Flex>
            <Box>
              <Text color="gray.500" fontSize="sm">Jours restants</Text>
              <Heading as="h3" fontSize="2xl" fontWeight="bold" color="gray.900">{stats.remainingBalance}</Heading>
            </Box>
          </Box>
          <Box bg="white" rounded="xl" p={6} shadow="sm" borderWidth="1px" borderColor="gray.200" display="flex" alignItems="center" gap={4}>
            <Flex boxSize={12} bg="blue.50" rounded="xl" align="center" justify="center" flexShrink={0}>
              <Box as="span" className="material-symbols-outlined" fontSize="24px" color="blue.500">event_busy</Box>
            </Flex>
            <Box>
              <Text color="gray.500" fontSize="sm">Jours utilisés</Text>
              <Heading as="h3" fontSize="2xl" fontWeight="bold" color="gray.900">{stats.daysTaken}</Heading>
            </Box>
          </Box>
          <Box bg="white" rounded="xl" p={6} shadow="sm" borderWidth="1px" borderColor="gray.200" display="flex" alignItems="center" gap={4}>
            <Flex boxSize={12} bg="orange.50" rounded="xl" align="center" justify="center" flexShrink={0}>
              <Box as="span" className="material-symbols-outlined" fontSize="24px" color="orange.500">pending_actions</Box>
            </Flex>
            <Box>
              <Text color="gray.500" fontSize="sm">En attente</Text>
              <Heading as="h3" fontSize="2xl" fontWeight="bold" color="gray.900">{stats.pending}</Heading>
            </Box>
          </Box>
        </SimpleGrid>
      )}

      <Box bg="white" rounded="xl" shadow="sm" borderWidth="1px" borderColor="gray.200" overflow="hidden">
        <Flex px={6} py={4} borderBottomWidth="1px" borderColor="gray.200" justify="space-between" align="center">
          <Heading as="h3" fontSize="lg" fontWeight="bold" color="gray.900">
            Historique des congés
          </Heading>
          <Text fontSize="sm" color="gray.500">{conges.length} demande(s)</Text>
        </Flex>

        {conges.length === 0 ? (
          <Flex p={12} direction="column" align="center" gap={3}>
            <Box as="span" className="material-symbols-outlined" fontSize="48px" color="gray.300">event_available</Box>
            <Text color="gray.400" fontSize="sm">Aucune demande de congé</Text>
          </Flex>
        ) : (
          <Box overflowX="auto">
            <Table variant="unstyled" size="md">
              <Thead bg="gray.50">
                <Tr>
                  {["Type", "Date début", "Date fin", "Jours", "Motif", "Statut", "Date demande", "Actions"].map((h, i) => (
                    <Th key={h} px={6} py={4} fontSize="xs" textTransform="uppercase" fontWeight="semibold" color="gray.500" letterSpacing="wider" textAlign={i === 7 ? "right" : "left"}>
                      {h}
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {conges.map((c) => (
                  <Tr key={c.id} _hover={{ bg: "gray.50" }} transition="background 0.15s">
                    <Td px={6} py={4}>
                      <Badge px={2} py={0.5} rounded="md" fontSize="xs" colorScheme="blue" variant="subtle">
                        {c.type.replace("_", " ")}
                      </Badge>
                    </Td>
                    <Td px={6} py={4} color="gray.700" fontSize="sm">{formatDate(c.dateDebut)}</Td>
                    <Td px={6} py={4} color="gray.700" fontSize="sm">{formatDate(c.dateFin)}</Td>
                    <Td px={6} py={4} color="gray.900" fontWeight="semibold" fontSize="sm">{c.joursOuvrables}</Td>
                    <Td px={6} py={4} color="gray.600" fontSize="sm" maxW="200px" isTruncated>{c.motif ?? "—"}</Td>
                    <Td px={6} py={4}>
                      <Badge px={2.5} py={0.5} borderRadius="full" fontSize="xs" fontWeight="medium" colorScheme={statutColor(c.statut)} variant="subtle">
                        {c.statut.replace("_", " ")}
                      </Badge>
                    </Td>
                    <Td px={6} py={4} color="gray.500" fontSize="sm">{formatDate(c.dateDemande)}</Td>
                    <Td px={6} py={4} textAlign="right">
                      {c.statut === "EN_ATTENTE" && (
                        <IconButton aria-label="Annuler" variant="ghost" size="sm" icon={<Box as="span" className="material-symbols-outlined" fontSize="20px" lineHeight="1">close</Box>} color="red.400" _hover={{ color: "red.600", bg: "red.50" }} onClick={() => annuler(c.id)} />
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>

      <RequestLeaveModal isOpen={isOpen} onClose={onClose} onCreated={refresh} />
    </Box>
  );
}
