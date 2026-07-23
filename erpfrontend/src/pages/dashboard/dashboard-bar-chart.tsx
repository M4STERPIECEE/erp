import { useState, useEffect } from "react";
import { Box, Flex, Text, Heading, Link, HStack } from "@chakra-ui/react";

const bars = [
  { label: "Tech", pct: 65, color: "linear-gradient(180deg, #8B5CF6 0%, #6366F1 100%)", accent: "#8B5CF6" },
  { label: "HR", pct: 40, color: "linear-gradient(180deg, #14B8A6 0%, #0D9488 100%)", accent: "#14B8A6" },
  { label: "Sales", pct: 85, color: "linear-gradient(180deg, #3B82F6 0%, #2563EB 100%)", accent: "#3B82F6" },
  { label: "MKT", pct: 30, color: "linear-gradient(180deg, #EC4899 0%, #DB2777 100%)", accent: "#EC4899" },
  { label: "Ops", pct: 55, color: "linear-gradient(180deg, #F59E0B 0%, #D97706 100%)", accent: "#F59E0B" },
];

export default function BarChart() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box bg="white" rounded="3xl" p={5} borderWidth="1px" borderColor="gray.100" shadow="xl" position="relative" overflow="hidden" gridColumn={{ lg: "span 2" }}>
      <Box position="absolute" top="-20px" right="-20px" w="120px" h="120px" bg="purple.100" rounded="full" opacity={0.3} filter="blur(40px)" />

      <Flex justify="space-between" align="center" mb={6} position="relative" zIndex={1}>
        <Box>
          <HStack spacing={2} mb={1}>
            <Box w="3" h="3" bg="purple.500" rounded="full" />
            <Text fontSize="sm" fontWeight="semibold" color="purple.600">
              Analytics RH
            </Text>
          </HStack>
          <Heading as="h3" fontSize="xl" fontWeight="bold" color="gray.800">
            Absences par département
          </Heading>
          <Text color="gray.500" fontSize="sm" mt={1}>
            Comparaison mensuelle des absences
          </Text>
        </Box>

        <Link color="purple.600" fontSize="sm" fontWeight="semibold" _hover={{ textDecoration: "none", color: "purple.700" }}>
          Voir détails
        </Link>
      </Flex>

      <Box position="relative" h="220px">
        <Flex position="absolute" top={0} left={0} w="full" h="full" flexDir="column" justify="space-between" pointerEvents="none">
          {[100, 75, 50, 25, 0].map((val) => (
            <Flex key={val} align="center" w="full">
              <Text fontSize="xs" fontWeight="semibold" color="gray.400" w="10" textAlign="left">
                {val}%
              </Text>
              <Box flex={1} borderBottom="1px solid" borderColor="gray.100" />
            </Flex>
          ))}
        </Flex>

        <Flex position="relative" zIndex={1} h="full" ml="12" mr="4" align="flex-end" justify="space-between" gap={4}>
          {bars.map((bar, index) => (
            <Flex key={bar.label} flexDir="column" align="center" flex={1} h="full" justify="flex-end" role="group" cursor="pointer" position="relative">
              <Box mb={3} px={3} py={1.5} bg="white" borderWidth="1px" borderColor="gray.200" rounded="xl" shadow="md" opacity={0} transform="translateY(10px)" transition="all 0.3s ease" _groupHover={{ opacity: 1, transform: "translateY(0)" }}>
                <Text fontSize="sm" fontWeight="bold" color="gray.800">
                  {bar.pct}%
                </Text>
              </Box>

              <Box w="14" h="180px" bg="gray.100" rounded="2xl" position="relative" overflow="hidden" borderWidth="1px" borderColor="gray.200">
                <Box position="absolute" bottom={0} left={0} w="full" background={bar.color} rounded="2xl" h="0%" style={{ height: isMounted ? `${bar.pct}%` : "0%" }} transition={`height 1.4s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1}s`} _groupHover={{ filter: "brightness(1.08)", transform: "scaleX(1.02)" }}>
                  <Box position="absolute" top={0} left="15%" w="30%" h="100%" bg="whiteAlpha.300" transform="skewX(-20deg)" />
                  <Box position="absolute" top="8px" left="50%" transform="translateX(-50%)" w="2" h="2" bg="white" rounded="full" shadow="sm" />
                </Box>
              </Box>

              <Flex align="center" mt={4} gap={2}>
                <Box w="2" h="2" bg={bar.accent} rounded="full" />
                <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                  {bar.label}
                </Text>
              </Flex>
            </Flex>
          ))}
        </Flex>
      </Box>
    </Box>
  );
}