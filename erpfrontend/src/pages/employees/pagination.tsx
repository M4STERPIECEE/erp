import { Flex, Text, Box, Button } from "@chakra-ui/react";
import type { EmployeeResponse } from "../../types/employee.types";

export default function Pagination({ page, totalPages, totalElements, size, employees, onPageChange }: {
  page: number; totalPages: number; totalElements: number; size: number;
  employees: EmployeeResponse[]; onPageChange: (p: number) => void;
}) {
  const from = totalElements === 0 ? 0 : page * size + 1;
  const to = page * size + employees.length;
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 0; i < totalPages; i++) pages.push(i);
  } else {
    pages.push(0);
    if (page > 2) pages.push("...");
    for (let i = Math.max(1, page - 1); i <= Math.min(totalPages - 2, page + 1); i++) pages.push(i);
    if (page < totalPages - 3) pages.push("...");
    pages.push(totalPages - 1);
  }

  const borderClr = "gray.200";

  return (
    <Flex px={6} py={4} borderTopWidth="1px" borderColor={borderClr} bg="rgba(248,250,252,0.5)" justify="space-between" align="center" flexWrap="wrap" gap={3}>
      <Text fontSize="sm" color="gray.500">
        Affichage de{" "}
        <Box as="span" fontWeight="medium" color="gray.900">{from}</Box>{" "}
        à{" "}
        <Box as="span" fontWeight="medium" color="gray.900">{to}</Box>{" "}
        sur{" "}
        <Box as="span" fontWeight="medium" color="gray.900">{totalElements}</Box>{" "}
        employés
      </Text>
      <Flex gap={2}>
        <Button px={3} py={1} h="auto" minW="auto" fontSize="sm" fontWeight="medium" rounded="md"
          variant="outline" borderColor="gray.300" bg="white" color="gray.500" _hover={{ bg: "gray.50" }}
          isDisabled={page === 0} onClick={() => onPageChange(page - 1)}>
          Précédent
        </Button>
        {pages.map((p, i) =>
          p === "..." ? (
            <Text key={`dots-${i}`} px={2} py={1} color="gray.500" fontSize="sm">...</Text>
          ) : (
            <Button key={p} px={3} py={1} h="auto" minW="auto" fontSize="sm" fontWeight="medium" rounded="md"
              variant="outline" borderColor="gray.300"
              bg={p === page ? "#14b8a6" : "white"}
              color={p === page ? "white" : "gray.500"}
              _hover={{ bg: p === page ? "#0d9488" : "gray.50" }}
              onClick={() => onPageChange(p)}>
              {p + 1}
            </Button>
          ),
        )}
        <Button px={3} py={1} h="auto" minW="auto" fontSize="sm" fontWeight="medium" rounded="md"
          variant="outline" borderColor="gray.300" bg="white" color="gray.500" _hover={{ bg: "gray.50" }}
          isDisabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>
          Suivant
        </Button>
      </Flex>
    </Flex>
  );
}
