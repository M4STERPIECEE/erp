import { Box, Flex, Text, Heading } from "@chakra-ui/react";

export default function KpiCard({ label, value, icon, iconBg, iconColor }: { label: string; value: number; icon: string; iconBg: string; iconColor: string }) {
  return (
    <Box flex="1" minW="200px" bg="white" p={5} rounded="xl" borderWidth="1px" borderColor="gray.200" shadow="sm" display="flex" alignItems="flex-start" justifyContent="space-between">
      <Box>
        <Text color="gray.500" fontSize="sm" fontWeight="medium" mb={1}>{label}</Text>
        <Heading as="h4" fontSize="2xl" fontWeight="bold" color="gray.900">{value}</Heading>
      </Box>
      <Flex p={2} bg={iconBg} rounded="lg" align="center" justify="center">
        <Box as="span" className="material-symbols-outlined" color={iconColor} fontSize="22px" lineHeight="1">{icon}</Box>
      </Flex>
    </Box>
  );
}
