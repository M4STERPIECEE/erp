import { Box, Flex, Text, IconButton } from "@chakra-ui/react";
import type { DepartmentResponse } from "../../types/department.types";

const CARD_THEMES = [
  { gradient: "linear(to-r, #3b82f6, #5c799d)", iconBg: "#eff6ff", iconColor: "#5c799d", icon: "groups" },
  { gradient: "linear(to-r, #a855f7, #6366f1)", iconBg: "#faf5ff", iconColor: "#9333ea", icon: "developer_mode" },
  { gradient: "linear(to-r, #10b981, #14b8a6)", iconBg: "#ecfdf5", iconColor: "#059669", icon: "attach_money" },
  { gradient: "linear(to-r, #f97316, #f59e0b)", iconBg: "#fff7ed", iconColor: "#ea580c", icon: "campaign" },
  { gradient: "linear(to-r, #ec4899, #f43e5e)", iconBg: "#fdf2f8", iconColor: "#db2777", icon: "support_agent" },
  { gradient: "linear(to-r, #06b6d4, #3b82f6)", iconBg: "#ecfeff", iconColor: "#0891b2", icon: "local_shipping" },
  { gradient: "linear(to-r, #8b5cf6, #a78bfa)", iconBg: "#f5f3ff", iconColor: "#7c3aed", icon: "school" },
  { gradient: "linear(to-r, #ef4444, #f97316)", iconBg: "#fef2f2", iconColor: "#dc2626", icon: "gavel" },
];

function getTheme(index: number) {
  return CARD_THEMES[index % CARD_THEMES.length];
}

export default function DepartmentCard({ dept, index, onEdit, onDelete }: {
  dept: DepartmentResponse; index: number;
  onEdit: (d: DepartmentResponse) => void;
  onDelete: (d: DepartmentResponse) => void;
}) {
  const theme = getTheme(index);

  return (
    <Box role="group" position="relative" display="flex" flexDir="column" bg="white" rounded="xl" shadow="sm" borderWidth="1px" borderColor="gray.200" _hover={{ shadow: "md" }} transition="all 0.2s" overflow="hidden">
      <Box h="96px" w="full" position="absolute" top={0} left={0} zIndex={0} bgGradient={theme.gradient} opacity={0.1} />
      <Box p={5} zIndex={10} display="flex" flexDir="column" h="full">
        <Flex justify="space-between" alignItems="flex-start" mb={4}>
          <Flex w={12} h={12} rounded="lg" bg={theme.iconBg} alignItems="center" justifyContent="center">
            <Box as="span" className="material-symbols-outlined" fontSize="30px" color={theme.iconColor} lineHeight="1">
              {theme.icon}
            </Box>
          </Flex>
          <Flex gap={1} opacity={0} _groupHover={{ opacity: 1 }} transition="opacity 0.2s">
            <IconButton aria-label="Modifier" icon={<Box as="span" className="material-symbols-outlined" fontSize="18px" lineHeight="1">edit</Box>} variant="ghost" size="sm" rounded="full" color="gray.500" _hover={{ bg: "gray.100", color: "#5c799d" }} onClick={() => onEdit(dept)} />
            <IconButton aria-label="Supprimer" icon={<Box as="span" className="material-symbols-outlined" fontSize="18px" lineHeight="1">delete</Box>} variant="ghost" size="sm" rounded="full" color="gray.500" _hover={{ bg: "red.50", color: "red.500" }} onClick={() => onDelete(dept)} />
          </Flex>
        </Flex>
        <Text fontSize="lg" fontWeight="bold" color="gray.900" mb={1}>{dept.nom}</Text>
        <Text fontSize="sm" color="gray.500" mb={6} noOfLines={2}>{dept.description ?? "Aucune description."}</Text>
        <Box mt="auto" pt={4} borderTopWidth="1px" borderColor="gray.100">
          <Flex justify="space-between" mb={2}>
            <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" color="gray.400">Manager</Text>
            <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" color="gray.400">Employés</Text>
          </Flex>
          <Flex justify="space-between" alignItems="center">
            <Flex alignItems="center" gap={2}>
              <Flex boxSize={6} rounded="full" bg="gray.200" alignItems="center" justifyContent="center" fontSize="9px" fontWeight="bold" color="gray.600">
                {dept.responsableNom ? dept.responsableNom.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "—"}
              </Flex>
              <Text fontSize="sm" fontWeight="medium" color="gray.700">{dept.responsableNom ?? "Non assigné"}</Text>
            </Flex>
            <Box display="inline-flex" alignItems="center" justifyContent="center" px={2.5} py={0.5} rounded="full" fontSize="xs" fontWeight="medium" bg="gray.100" color="gray.800">
              {dept.nombreEmployes}
            </Box>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}
