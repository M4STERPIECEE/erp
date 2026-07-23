import { Box, Flex, Text } from "@chakra-ui/react";

export default function AddNewCard({ onClick }: { onClick: () => void }) {
  return (
    <Box role="group" as="button" display="flex" flexDir="column" alignItems="center" justifyContent="center" bg="gray.50" rounded="xl" borderWidth="2px" borderStyle="dashed" borderColor="gray.300" _hover={{ borderColor: "#14b8a6", bg: "rgba(20,184,166,0.04)" }} transition="all 0.2s" minH="260px" cursor="pointer" onClick={onClick}>
      <Flex w={16} h={16} rounded="full" bg="gray.100" _groupHover={{ bg: "rgba(20,184,166,0.15)", color: "teal.600" }} alignItems="center" justifyContent="center" color="gray.400" transition="all 0.2s" mb={4}>
        <Box as="span" className="material-symbols-outlined" fontSize="36px" lineHeight="1" color="gray.400" _groupHover={{ color: "#0d9488" }}>
          add
        </Box>
      </Flex>
      <Text fontSize="lg" fontWeight="medium" color="gray.600" _groupHover={{ color: "#0f766e" }}>
        Nouveau département
      </Text>
    </Box>
  );
}
