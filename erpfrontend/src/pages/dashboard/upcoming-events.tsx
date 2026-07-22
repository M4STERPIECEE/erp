import { Box, Flex, Text, Heading, Link } from "@chakra-ui/react";

const events = [
  { title: "Réunion d'équipe", date: "Demain, 09:00", icon: "groups", color: "blue.500" },
  { title: "Anniversaire de Sophie", date: "15 Oct", icon: "cake", color: "pink.500" },
  { title: "Fin de période d'essai", date: "22 Oct - Jean D.", icon: "history_edu", color: "orange.500" },
];

export default function UpcomingEvents() {
  const cardBg = "white";
  const borderClr = "gray.200";

  return (
    <Box bg={cardBg} rounded="xl" p={6} shadow="sm" borderWidth="1px" borderColor={borderClr} display="flex" flexDir="column">
      <Heading as="h3" fontSize="lg" fontWeight="bold" color="gray.900" mb={6}>
        Événements à venir
      </Heading>
      <Flex flexDir="column" gap={5} flex={1}>
        {events.map((event, i) => (
          <Flex key={i} align="center" gap={3}>
            <Flex boxSize={10} bg="gray.50" rounded="xl" align="center" justify="center" flexShrink={0} border="1px solid" borderColor="gray.100">
              <Box as="span" className="material-symbols-outlined" fontSize="22px" color={event.color}>{event.icon}</Box>
            </Flex>
            <Box overflow="hidden">
              <Text fontSize="sm" fontWeight="bold" color="gray.900" isTruncated>{event.title}</Text>
              <Text fontSize="xs" color="gray.500" fontWeight="medium">{event.date}</Text>
            </Box>
          </Flex>
        ))}
      </Flex>
      <Link color="#1E3A5F" fontSize="xs" fontWeight="bold" display="block" mt={6} textAlign="center" py={2} bg="gray.50" rounded="lg" _hover={{ bg: "gray.100", textDecoration: "none" }}>
        Consulter le calendrier
      </Link>
    </Box>
  );
}
