import { Td, Text } from "@chakra-ui/react";

export default function Cell({ value, bold }: { value: string | null | undefined; bold?: boolean }) {
  return (
    <Td px={4} py={4}>
      <Text fontSize="sm" fontWeight={bold ? "medium" : "normal"} color={bold ? "gray.900" : "gray.600"} whiteSpace="nowrap">
        {value ?? "—"}
      </Text>
    </Td>
  );
}
