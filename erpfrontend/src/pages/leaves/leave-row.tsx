import { Box, Flex, Text, Td, Tr, IconButton } from "@chakra-ui/react";
import type { AdminLeaveResponse } from "../../types/leave.types";
import type { LeaveType, LeaveStatus } from "../../types/employee-space.types";

const TYPE_LABELS: Record<LeaveType, string> = {
  ANNUEL: "Congés Payés",
  MALADIE: "Maladie",
  MATERNITE: "Maternité",
  SANS_SOLDE: "Sans solde",
};

const STATUS_CONFIG: Record<LeaveStatus, { label: string; bg: string; color: string; border: string; dot: string }> = {
  EN_ATTENTE: { label: "En attente", bg: "#fff7ed", color: "#c2410c", border: "#fed7aa", dot: "#f97316" },
  APPROUVE: { label: "Approuvé", bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0", dot: "#22c55e" },
  REJETE: { label: "Refusé", bg: "#fef2f2", color: "#b91c1c", border: "#fecaca", dot: "#ef4444" },
};

const AVATAR_COLORS = ["#e0e7ff", "#dbeafe", "#fce7f3", "#d1fae5", "#fef9c3", "#ede9fe"];
const AVATAR_TEXT = ["#4338ca", "#1d4ed8", "#be185d", "#047857", "#a16207", "#6d28d9"];

function getInitials(nom: string, prenom: string): string {
  return ((prenom?.[0] ?? "") + (nom?.[0] ?? "")).toUpperCase();
}

function fmtDate(s: string): string {
  return new Date(s + "T00:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function LeaveRow({ leave, onApprove, onReject }: { leave: AdminLeaveResponse; onApprove: (id: number) => Promise<boolean>; onReject: (id: number) => Promise<boolean> }) {
  const c = leave;
  const idx = (c.employeId ?? 0) % AVATAR_COLORS.length;
  const initials = getInitials(c.employeNom, c.employePrenom);
  const s = STATUS_CONFIG[c.statut];

  return (
    <Tr _hover={{ bg: "gray.50" }} transition="background 0.15s" role="group">
      <Td px={6} py={4} whiteSpace="nowrap">
        <Flex align="center" gap={3}>
          <Flex boxSize={8} rounded="full" bg={AVATAR_COLORS[idx]} color={AVATAR_TEXT[idx]} align="center" justify="center" fontWeight="bold" fontSize="xs" flexShrink={0}>
            {initials}
          </Flex>
          <Box>
            <Text fontWeight="medium" color="gray.900" fontSize="sm">{c.employePrenom} {c.employeNom}</Text>
            <Text fontSize="xs" color="gray.500">{c.employePoste || "—"}</Text>
          </Box>
        </Flex>
      </Td>
      <Td px={6} py={4} whiteSpace="nowrap" color="gray.900" fontSize="sm">{TYPE_LABELS[c.type] ?? c.type}</Td>
      <Td px={6} py={4} whiteSpace="nowrap" fontSize="sm">
        <Text color="gray.500"><Text as="span" fontWeight="medium" color="gray.700">Du</Text> {fmtDate(c.dateDebut)}</Text>
        <Text color="gray.500"><Text as="span" fontWeight="medium" color="gray.700">Au</Text> {fmtDate(c.dateFin)}</Text>
      </Td>
      <Td px={6} py={4} whiteSpace="nowrap" textAlign="center" fontWeight="medium" color="gray.900" fontSize="sm">{c.nombreJours}</Td>
      <Td px={6} py={4} whiteSpace="nowrap" color="gray.500" fontSize="sm" maxW="150px" overflow="hidden" textOverflow="ellipsis" title={c.motif ?? ""}>{c.motif ? (c.motif.length > 20 ? c.motif.slice(0, 20) + "…" : c.motif) : "—"}</Td>
      <Td px={6} py={4} whiteSpace="nowrap">
        <Flex display="inline-flex" align="center" gap={1.5} px={2.5} py={1} rounded="full" fontSize="xs" fontWeight="medium" bg={s.bg} color={s.color} borderWidth="1px" borderColor={s.border}>
          <Box boxSize="6px" rounded="full" bg={s.dot} />
          {s.label}
        </Flex>
      </Td>
      <Td px={6} py={4} whiteSpace="nowrap" textAlign="right">
        {c.statut === "EN_ATTENTE" ? (
          <Flex justify="flex-end" gap={2} opacity={{ base: 1, sm: 0 }} _groupHover={{ opacity: 1 }} transition="opacity 0.15s">
            <IconButton aria-label="Approuver" size="sm" variant="ghost" icon={<Box as="span" className="material-symbols-outlined" fontSize="20px" lineHeight="1">check</Box>} color="green.600" _hover={{ bg: "green.50" }} onClick={() => onApprove(c.id)} />
            <IconButton aria-label="Refuser" size="sm" variant="ghost" icon={<Box as="span" className="material-symbols-outlined" fontSize="20px" lineHeight="1">close</Box>} color="red.500" _hover={{ bg: "red.50" }} onClick={() => onReject(c.id)} />
          </Flex>
        ) : (
          <IconButton aria-label="Plus" size="sm" variant="ghost" icon={<Box as="span" className="material-symbols-outlined" fontSize="18px" lineHeight="1">more_horiz</Box>} color="gray.400" _hover={{ color: "#1E3A5F" }} />
        )}
      </Td>
    </Tr>
  );
}
