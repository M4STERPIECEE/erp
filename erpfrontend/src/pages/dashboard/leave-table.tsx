import { Box, Flex, Text, Heading, Table, Thead, Tbody, Tr, Th, Td, Badge, IconButton, Link } from "@chakra-ui/react";

const leaveData = [
  { initials: "SM", bgColor: "rgba(30,58,95,0.1)", textColor: "#1E3A5F", name: "Sophie Martin", type: "Congés payés", dates: "12 Oct - 15 Oct", days: "4 jours", status: "EN ATTENTE" },
  { initials: "TL", bgColor: "rgba(13,148,136,0.1)", textColor: "#0d9488", name: "Thomas Leroy", type: "RTT", dates: "20 Oct - 20 Oct", days: "1 jour", status: "APPROUVÉ" },
  { initials: "LB", bgColor: "#f3e8ff", textColor: "#9333ea", name: "Lucas Bernard", type: "Maladie", dates: "05 Oct - 07 Oct", days: "3 jours", status: "APPROUVÉ" },
  { initials: "CD", bgColor: "#dbeafe", textColor: "#2563eb", name: "Claire Dubois", type: "Sans solde", dates: "15 Nov - 30 Nov", days: "15 jours", status: "EN ATTENTE" },
];

function StatusBadge(status: string) {
  const isPending = status === "EN ATTENTE";
  return (
    <Badge px={2.5} py={0.5} borderRadius="full" fontSize="xs" fontWeight="medium" textTransform="uppercase" colorScheme={isPending ? "yellow" : "green"} variant="subtle">
      {status}
    </Badge>
  );
}

export default function LeaveTable() {
  const cardBg = "white";
  const borderClr = "gray.200";
  const headBg = "gray.50";
  const textMain = "gray.900";
  const textMuted = "gray.600";
  const rowHover = "gray.50";
  const footerBg = "gray.50";

  return (
    <Box bg={cardBg} rounded="xl" shadow="sm" borderWidth="1px" borderColor={borderClr} overflow="hidden">
      <Flex px={6} py={4} borderBottomWidth="1px" borderColor={borderClr} justify="space-between" align="center">
        <Heading as="h3" fontSize="lg" fontWeight="bold" color={textMain}>
          Dernières demandes de congés
        </Heading>
        <IconButton aria-label="Plus d'options" variant="ghost" icon={<Box as="span" className="material-symbols-outlined" fontSize="20px" lineHeight="1">more_horiz</Box>} color="gray.500" _hover={{ color: "#1E3A5F" }} size="sm" />
      </Flex>
      <Box overflowX="auto">
        <Table variant="unstyled" size="md">
          <Thead bg={headBg}>
            <Tr>
              {["Employé", "Type", "Dates", "Durée", "Statut", "Actions"].map((h, i) => (
                <Th key={h} px={6} py={4} fontSize="xs" textTransform="uppercase" fontWeight="semibold" color="gray.500" letterSpacing="wider" textAlign={i === 5 ? "right" : "left"}>
                  {h}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {leaveData.map((row) => (
              <Tr key={row.name} _hover={{ bg: rowHover }} transition="background 0.15s">
                <Td px={6} py={4}>
                  <Flex alignItems="center" gap={3}>
                    <Flex boxSize={8} rounded="full" bg={row.bgColor} color={row.textColor} alignItems="center" justifyContent="center" fontWeight="bold" fontSize="xs" flexShrink={0}>
                      {row.initials}
                    </Flex>
                    <Text fontWeight="medium" color={textMain} whiteSpace="nowrap">
                      {row.name}
                    </Text>
                  </Flex>
                </Td>
                <Td px={6} py={4} color={textMuted}>{row.type}</Td>
                <Td px={6} py={4} color={textMuted} whiteSpace="nowrap">{row.dates}</Td>
                <Td px={6} py={4} color={textMuted}>{row.days}</Td>
                <Td px={6} py={4}>{StatusBadge(row.status)}</Td>
                <Td px={6} py={4} textAlign="right">
                  <IconButton aria-label="Voir" variant="ghost" size="sm" icon={<Box as="span" className="material-symbols-outlined" fontSize="20px" lineHeight="1">visibility</Box>} color="gray.400" _hover={{ color: "#1E3A5F" }} />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      <Flex px={4} py={4} borderTopWidth="1px" borderColor={borderClr} bg={footerBg} justify="center">
        <Link color="#1E3A5F" fontSize="sm" fontWeight="medium" _hover={{ color: "rgba(30,58,95,0.8)", textDecoration: "none" }} display="flex" alignItems="center" gap={1}>
          Voir toutes les demandes
          <Box as="span" className="material-symbols-outlined" fontSize="18px" lineHeight="1">
            arrow_forward
          </Box>
        </Link>
      </Flex>
    </Box>
  );
}
