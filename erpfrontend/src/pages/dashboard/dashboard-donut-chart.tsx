import { Box, Flex, Text, Heading, SimpleGrid } from "@chakra-ui/react";

const CONTRACT_COLORS: Record<string, string> = {
  CDI: "#1E3A5F",
  CDD: "#0d9488",
  STAGE: "#fbbf24",
  FREELANCE: "#ef4444",
};

interface DonutChartProps {
  distribution: Record<string, number>;
  total: number;
}

export default function DonutChart({ distribution, total }: DonutChartProps) {
  const cardBg = "white";
  const borderClr = "gray.200";
  const innerBg = "white";

  const entries = Object.entries(distribution);
  let cumulative = 0;
  const segments = entries.map(([type, count]) => {
    const pct = total > 0 ? (count / total) * 100 : 0;
    const seg = { type, count, pct, start: cumulative };
    cumulative += pct;
    return seg;
  });

  const gradient = segments.length > 0
    ? segments.map((s) => {
        const color = CONTRACT_COLORS[s.type] ?? "#94a3b8";
        return `${color} ${s.start.toFixed(1)}% ${(s.start + s.pct).toFixed(1)}%`;
      }).join(", ")
    : "#e2e8f0 0% 100%";

  return (
    <Box bg={cardBg} rounded="xl" p={6} shadow="sm" borderWidth="1px" borderColor={borderClr} display="flex" flexDir="column">
      <Heading as="h3" fontSize="lg" fontWeight="bold" color="gray.900" mb={6}>
        Types de contrats
      </Heading>
      <Flex flex={1} alignItems="center" justifyContent="center">
        <Box w="192px" h="192px" borderRadius="full" position="relative" display="flex" alignItems="center" justifyContent="center" sx={{ background: `conic-gradient(${gradient})` }}>
          <Box w="128px" h="128px" borderRadius="full" bg={innerBg} display="flex" flexDir="column" alignItems="center" justifyContent="center" zIndex={1} boxShadow="inner">
            <Heading as="span" fontSize="3xl" fontWeight="bold" color="gray.900">
              {total}
            </Heading>
            <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase">
              Total
            </Text>
          </Box>
        </Box>
      </Flex>
      <SimpleGrid columns={2} spacing={4} mt={6}>
        {segments.map(({ type, pct }) => (
          <Flex key={type} alignItems="center" gap={2}>
            <Box boxSize={3} borderRadius="full" bg={CONTRACT_COLORS[type] ?? "#94a3b8"} flexShrink={0} />
            <Box>
              <Text fontSize="xs" fontWeight="semibold" color="gray.900">{type}</Text>
              <Text fontSize="xs" color="gray.500">{total > 0 ? `${pct.toFixed(0)}%` : "0%"}</Text>
            </Box>
          </Flex>
        ))}
      </SimpleGrid>
    </Box>
  );
}
