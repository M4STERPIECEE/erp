import { Box, Flex, Text, Heading } from "@chakra-ui/react";

export interface KpiCardProps {
  label: string;
  value: string | number;
  icon: string;
  iconColor: string;
  trend: { icon: string; text: string; color: string };
}

export default function KpiCard({ label, value, icon, iconColor, trend }: KpiCardProps) {
  const cardBg = "white";
  const borderClr = "gray.200";
  const textMain = "gray.900";
  const textMuted = "gray.500";

  return (
    <Box bg={cardBg} rounded="xl" p={6} shadow="sm" borderWidth="1px" borderColor={borderClr} display="flex" flexDir="column" justifyContent="space-between" h="36" position="relative" overflow="hidden" role="group">
      <Box position="absolute" right={0} top={0} p={4} opacity={0.05} _groupHover={{ opacity: 0.1 }} transition="opacity 0.2s" pointerEvents="none">
        <Box as="span" className="material-symbols-outlined" fontSize="96px" color={iconColor} lineHeight="1">
          {icon}
        </Box>
      </Box>
      <Box position="relative" zIndex={1}>
        <Text color={textMuted} fontSize="sm" fontWeight="medium">{label}</Text>
        <Heading as="h3" fontSize="3xl" fontWeight="bold" color={textMain} mt={2}>
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
