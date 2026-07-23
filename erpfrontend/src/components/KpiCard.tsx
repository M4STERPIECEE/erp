import { Box, Flex, Text, Heading } from "@chakra-ui/react";

export interface KpiCardProps {
  label: string;
  value: string | number;
  icon: string;
  iconColor: string;
  iconBg?: string;
  trend?: { icon: string; text: string; color: string };
}

export default function KpiCard({ label, value, icon, iconColor, iconBg, trend }: KpiCardProps) {
  if (trend) {
    return (
      <Box bg="white" rounded="xl" p={6} shadow="sm" borderWidth="1px" borderColor="gray.200" display="flex" flexDir="column" justifyContent="space-between" h="36" position="relative" overflow="hidden" role="group">
        <Box position="absolute" right={0} top={0} p={4} opacity={0.05} _groupHover={{ opacity: 0.1 }} transition="opacity 0.2s" pointerEvents="none">
          <Box as="span" className="material-symbols-outlined" fontSize="96px" color={iconColor} lineHeight="1">
            {icon}
          </Box>
        </Box>
        <Box position="relative" zIndex={1}>
          <Text color="gray.500" fontSize="sm" fontWeight="medium">{label}</Text>
          <Heading as="h3" fontSize="3xl" fontWeight="bold" color="gray.900" mt={2}>
            {value}
          </Heading>
        </Box>
        <Flex alignItems="center" gap={1} color={trend.color} fontSize="sm" fontWeight="medium" position="relative" zIndex={1}>
          <Box as="span" className="material-symbols-outlined" fontSize="16px" lineHeight="1">{trend.icon}</Box>
          <Text>{trend.text}</Text>
        </Flex>
      </Box>
    );
  }

  return (
    <Box flex="1" minW="200px" bg="white" p={5} rounded="xl" borderWidth="1px" borderColor="gray.200" shadow="sm" display="flex" alignItems="flex-start" justifyContent="space-between">
      <Box>
        <Text color="gray.500" fontSize="sm" fontWeight="medium" mb={1}>{label}</Text>
        <Heading as="h4" fontSize="2xl" fontWeight="bold" color="gray.900">{value}</Heading>
      </Box>
      <Flex p={2} bg={iconBg ?? "gray.100"} rounded="lg" align="center" justify="center">
        <Box as="span" className="material-symbols-outlined" color={iconColor} fontSize="22px" lineHeight="1">{icon}</Box>
      </Flex>
    </Box>
  );
}
