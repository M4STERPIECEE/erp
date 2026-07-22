import { Box, Flex, Text, Heading, Link } from "@chakra-ui/react";

const bars = [
  { label: "Tech", pct: 65, color: "#1E3A5F" },
  { label: "HR", pct: 40, color: "#0d9488" },
  { label: "Sales", pct: 85, color: "#1E3A5F" },
  { label: "MKT", pct: 30, color: "#0d9488" },
  { label: "Ops", pct: 55, color: "#1E3A5F" },
];

export default function BarChart() {
  const cardBg = "white";
  const borderClr = "gray.200";
  const trackBg = "gray.100";

  return (
    <Box bg={cardBg} rounded="xl" p={6} shadow="sm" borderWidth="1px" borderColor={borderClr} gridColumn={{ lg: "span 2" }}>
      <Flex justify="space-between" align="flex-start" mb={6}>
        <Box>
          <Heading as="h3" fontSize="lg" fontWeight="bold" color="gray.900">
            Absences par département
          </Heading>
          <Text color="gray.500" fontSize="sm">Comparaison mensuelle</Text>
        </Box>
        <Link color="#1E3A5F" fontSize="sm" fontWeight="medium" _hover={{ textDecoration: "underline" }}>
          Voir détails
        </Link>
      </Flex>
      <Flex alignItems="flex-end" justify="space-between" gap={4} h="64" px={2}>
        {bars.map((bar) => (
          <Flex key={bar.label} flexDir="column" alignItems="center" gap={2} flex={1} h="full" role="group" cursor="pointer">
            <Box w="full" bg={trackBg} rounded="lg" h="full" display="flex" alignItems="flex-end" overflow="hidden">
              <Box
                w="full"
                bg={bar.color}
                rounded="lg"
                style={{ height: `${bar.pct}%` }}
                transition="height 0.5s ease, opacity 0.2s"
                _groupHover={{ opacity: 0.85 }}
              />
            </Box>
            <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase" letterSpacing="wide">
              {bar.label}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
}
