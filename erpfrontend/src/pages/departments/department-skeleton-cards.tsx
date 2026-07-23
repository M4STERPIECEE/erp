import { Box, Flex, Skeleton } from "@chakra-ui/react";

export default function SkeletonCards() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <Box key={i} bg="white" rounded="xl" borderWidth="1px" borderColor="gray.200" p={5}>
          <Flex justify="space-between" mb={4}>
            <Skeleton boxSize={12} rounded="lg" />
            <Flex gap={1}>
              <Skeleton boxSize={8} rounded="full" />
              <Skeleton boxSize={8} rounded="full" />
            </Flex>
          </Flex>
          <Skeleton h="20px" w="60%" rounded="md" mb={2} />
          <Skeleton h="14px" w="90%" rounded="md" mb={1} />
          <Skeleton h="14px" w="70%" rounded="md" mb={6} />
          <Box pt={4} borderTopWidth="1px" borderColor="gray.100">
            <Flex justify="space-between">
              <Skeleton h="14px" w="40%" rounded="md" />
              <Skeleton h="20px" w="30px" rounded="full" />
            </Flex>
          </Box>
        </Box>
      ))}
    </>
  );
}
