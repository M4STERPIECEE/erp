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
  Select,
} from "@chakra-ui/react";
import { useMyAbsences } from "../../hooks/useMyAbsences";

const MOIS_LABELS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR");
}

export default function MyAbsencesPage() {
  const { absences, isLoading, error, mois, annee, setMois, setAnnee } = useMyAbsences();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  if (isLoading) {
    return (
      <Flex h="full" align="center" justify="center" direction="column" gap={4}>
        <Spinner size="xl" color="#1E3A5F" thickness="3px" />
        <Text color="gray.500" fontSize="sm">Chargement des absences…</Text>
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
            Mes Absences
          </Heading>
          <Text color="gray.500" mt={1}>Consultez votre historique d'absences</Text>
        </Box>
        <Flex gap={3}>
          <Select
            value={mois}
            onChange={(e) => setMois(Number(e.target.value))}
            bg="white"
            borderColor="gray.200"
            rounded="lg"
            fontSize="sm"
            w="auto"
            _focus={{ borderColor: "#0d9488", boxShadow: "0 0 0 1px #0d9488" }}
          >
            {MOIS_LABELS.map((label, i) => (
              <option key={i} value={i + 1}>{label}</option>
            ))}
          </Select>
          <Select
            value={annee}
            onChange={(e) => setAnnee(Number(e.target.value))}
            bg="white"
            borderColor="gray.200"
            rounded="lg"
            fontSize="sm"
            w="auto"
            _focus={{ borderColor: "#0d9488", boxShadow: "0 0 0 1px #0d9488" }}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </Select>
        </Flex>
      </Flex>

      <Flex gap={4}>
        <Box bg="white" rounded="xl" p={6} shadow="sm" borderWidth="1px" borderColor="gray.200" display="flex" alignItems="center" gap={4}>
          <Flex boxSize={12} bg="red.50" rounded="xl" align="center" justify="center" flexShrink={0}>
            <Box as="span" className="material-symbols-outlined" fontSize="24px" color="red.500">person_off</Box>
          </Flex>
          <Box>
            <Text color="gray.500" fontSize="sm">Total absences</Text>
            <Heading as="h3" fontSize="2xl" fontWeight="bold" color="gray.900">{absences.length}</Heading>
          </Box>
        </Box>
        <Box bg="white" rounded="xl" p={6} shadow="sm" borderWidth="1px" borderColor="gray.200" display="flex" alignItems="center" gap={4}>
          <Flex boxSize={12} bg="green.50" rounded="xl" align="center" justify="center" flexShrink={0}>
            <Box as="span" className="material-symbols-outlined" fontSize="24px" color="green.500">verified</Box>
          </Flex>
          <Box>
            <Text color="gray.500" fontSize="sm">Justifiées</Text>
            <Heading as="h3" fontSize="2xl" fontWeight="bold" color="gray.900">{absences.filter((a) => a.justifiee).length}</Heading>
          </Box>
        </Box>
        <Box bg="white" rounded="xl" p={6} shadow="sm" borderWidth="1px" borderColor="gray.200" display="flex" alignItems="center" gap={4}>
          <Flex boxSize={12} bg="orange.50" rounded="xl" align="center" justify="center" flexShrink={0}>
            <Box as="span" className="material-symbols-outlined" fontSize="24px" color="orange.500">warning</Box>
          </Flex>
          <Box>
            <Text color="gray.500" fontSize="sm">Non justifiées</Text>
            <Heading as="h3" fontSize="2xl" fontWeight="bold" color="gray.900">{absences.filter((a) => !a.justifiee).length}</Heading>
          </Box>
        </Box>
      </Flex>

      <Box bg="white" rounded="xl" shadow="sm" borderWidth="1px" borderColor="gray.200" overflow="hidden">
        <Flex px={6} py={4} borderBottomWidth="1px" borderColor="gray.200" justify="space-between" align="center">
          <Heading as="h3" fontSize="lg" fontWeight="bold" color="gray.900">
            {MOIS_LABELS[mois - 1]} {annee}
          </Heading>
          <Text fontSize="sm" color="gray.500">{absences.length} absence(s)</Text>
        </Flex>

        {absences.length === 0 ? (
          <Flex p={12} direction="column" align="center" gap={3}>
            <Box as="span" className="material-symbols-outlined" fontSize="48px" color="gray.300">check_circle</Box>
            <Text color="gray.400" fontSize="sm">Aucune absence ce mois</Text>
          </Flex>
        ) : (
          <Box overflowX="auto">
            <Table variant="unstyled" size="md">
              <Thead bg="gray.50">
                <Tr>
                  {["Date", "Motif", "Justifiée"].map((h) => (
                    <Th key={h} px={6} py={4} fontSize="xs" textTransform="uppercase" fontWeight="semibold" color="gray.500" letterSpacing="wider">
                      {h}
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {absences.map((a) => (
                  <Tr key={a.id} _hover={{ bg: "gray.50" }} transition="background 0.15s">
                    <Td px={6} py={4} color="gray.900" fontWeight="medium" fontSize="sm">{formatDate(a.date)}</Td>
                    <Td px={6} py={4} color="gray.600" fontSize="sm">{a.motif ?? "—"}</Td>
                    <Td px={6} py={4}>
                      <Badge
                        px={2.5} py={0.5} borderRadius="full" fontSize="xs" fontWeight="medium"
                        colorScheme={a.justifiee ? "green" : "red"}
                        variant="subtle"
                      >
                        {a.justifiee ? "Oui" : "Non"}
                      </Badge>
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
