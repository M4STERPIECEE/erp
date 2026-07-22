import { Box } from "@chakra-ui/react";
import type { StatusType } from "../../types/employee.types";

const statutStyles: Record<StatusType, { bg: string; color: string; borderColor: string; dotColor: string }> = {
  ACTIF: { bg: "#dcfce7", color: "#15803d", borderColor: "#bbf7d0", dotColor: "#22c55e" },
  INACTIF: { bg: "#f1f5f9", color: "#475569", borderColor: "#e2e8f0", dotColor: "#94a3b8" },
  SUSPENDU: { bg: "#fee2e2", color: "#b91c1c", borderColor: "#fecaca", dotColor: "#ef4444" },
};

export default function StatutBadge({ statut }: { statut: StatusType }) {
  const s = statutStyles[statut] ?? statutStyles.ACTIF;
  return (
    <Box as="span" display="inline-flex" alignItems="center" gap={1.5} px={2.5} py={1} borderRadius="full" fontSize="xs" fontWeight="medium" bg={s.bg} color={s.color} borderWidth="1px" borderColor={s.borderColor}>
      <Box boxSize={1.5} borderRadius="full" bg={s.dotColor} flexShrink={0} />
      {statut}
    </Box>
  );
}
