import { Box, Text } from "@chakra-ui/react";
import type { ContractType } from "../../types/employee.types";

export const contratStyles: Record<ContractType, { bg: string; color: string }> = {
  CDI: { bg: "#dbeafe", color: "#1d4ed8" },
  CDD: { bg: "#ffedd5", color: "#c2410c" },
  FREELANCE: { bg: "#f3e8ff", color: "#7e22ce" },
  STAGE: { bg: "#fef9c3", color: "#a16207" },
};

export default function ContratBadge({ type }: { type: string | null | undefined }) {
  if (!type) return <Text fontSize="sm" color="gray.400">—</Text>;
  const s = contratStyles[type as ContractType] ?? { bg: "gray.100", color: "gray.600" };
  return (
    <Box as="span" display="inline-flex" alignItems="center" px={2.5} py={0.5} borderRadius="full" fontSize="xs" fontWeight="medium" bg={s.bg} color={s.color}>
      {type}
    </Box>
  );
}
