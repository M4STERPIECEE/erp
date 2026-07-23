import { Tr, Td, Skeleton } from "@chakra-ui/react";

export default function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <Tr key={i}>
          {Array.from({ length: 11 }).map((_, j) => (
            <Td key={j} px={4} py={4}><Skeleton h="16px" rounded="md" /></Td>
          ))}
        </Tr>
      ))}
    </>
  );
}
