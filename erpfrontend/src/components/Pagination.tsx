import { Flex, Text, Button } from "@chakra-ui/react";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  currentElements: number;
  onPageChange: (p: number) => void;
  label?: string;
  simple?: boolean;
}

export default function Pagination({ page, totalPages, totalElements, pageSize, currentElements, onPageChange, label = "éléments", simple = false }: PaginationProps) {
  const from = totalElements === 0 ? 0 : page * pageSize + 1;
  const to = page * pageSize + currentElements;

  const pages: (number | "...")[] = [];
  if (!simple && totalPages > 1) {
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      if (page > 2) pages.push("...");
      for (let i = Math.max(1, page - 1); i <= Math.min(totalPages - 2, page + 1); i++) pages.push(i);
      if (page < totalPages - 3) pages.push("...");
      pages.push(totalPages - 1);
    }
  }

  return (
    <Flex px={6} py={4} borderTopWidth="1px" borderColor="gray.200" align="center" justify="space-between" flexWrap="wrap" gap={3}>
      <Text fontSize="sm" color="gray.500">
        Affichage de{" "}
        <Text as="span" fontWeight="medium" color="gray.900">{from}</Text>{" "}
        à{" "}
        <Text as="span" fontWeight="medium" color="gray.900">{to}</Text>{" "}
        sur{" "}
        <Text as="span" fontWeight="medium" color="gray.900">{totalElements}</Text>{" "}
        {label}
      </Text>
      <Flex gap={1}>
        <Button size="sm" variant="outline" borderColor="gray.200" color="gray.500" fontSize="sm"
          isDisabled={page === 0} onClick={() => onPageChange(page - 1)}>
          Précédent
        </Button>
        {pages.map((p, i) =>
          p === "..." ? (
            <Text key={`dots-${i}`} px={2} py={1} color="gray.500" fontSize="sm" alignSelf="center">...</Text>
          ) : (
            <Button key={p} size="sm" variant="outline" borderColor="gray.200"
              bg={p === page ? "#14b8a6" : "white"}
              color={p === page ? "white" : "gray.500"}
              _hover={{ bg: p === page ? "#0d9488" : "gray.50" }}
              onClick={() => onPageChange(p)}>
              {p + 1}
            </Button>
          ),
        )}
        <Button size="sm" variant="outline" borderColor="gray.200" color="gray.500" fontSize="sm"
          isDisabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>
          Suivant
        </Button>
      </Flex>
    </Flex>
  );
}
