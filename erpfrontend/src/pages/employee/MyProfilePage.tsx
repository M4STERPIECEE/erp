import {
  Box,
  Flex,
  Text,
  Heading,
  SimpleGrid,
  Spinner,
  Divider,
  Badge,
} from "@chakra-ui/react";
import { useMyProfile } from "../../hooks/useMyProfile";

function InfoRow({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <Flex align="center" gap={3} p={4} bg="gray.50" rounded="lg">
      <Flex boxSize={10} bg="white" rounded="lg" align="center" justify="center" flexShrink={0} borderWidth="1px" borderColor="gray.100">
        <Box as="span" className="material-symbols-outlined" fontSize="20px" color="#1E3A5F">{icon}</Box>
      </Flex>
      <Box>
        <Text fontSize="xs" color="gray.500" fontWeight="medium">{label}</Text>
        <Text fontSize="sm" fontWeight="semibold" color="gray.900">{value}</Text>
      </Box>
    </Flex>
  );
}

function formatAriary(amount: number | null): string {
  if (amount === null) return "—";
  return amount.toLocaleString("fr-FR") + " Ar";
}

export default function MyProfilePage() {
  const { profil, isLoading, error } = useMyProfile();

  if (isLoading) {
    return (
      <Flex h="full" align="center" justify="center" direction="column" gap={4}>
        <Spinner size="xl" color="#1E3A5F" thickness="3px" />
        <Text color="gray.500" fontSize="sm">Chargement du profil…</Text>
      </Flex>
    );
  }

  if (error || !profil) {
    return (
      <Flex h="full" align="center" justify="center" direction="column" gap={4}>
        <Box as="span" className="material-symbols-outlined" fontSize="64px" color="red.400">error</Box>
        <Text color="gray.700" fontWeight="bold">{error ?? "Profil introuvable"}</Text>
      </Flex>
    );
  }

  return (
    <Box as="main" p={{ base: 4, lg: 8 }} maxW="1600px" mx="auto" w="full" display="flex" flexDir="column" gap={8}>
      <Box pb={4} borderBottomWidth="1px" borderColor="gray.200">
        <Heading as="h2" fontSize="3xl" fontWeight="bold" color="gray.900" letterSpacing="tight">
          Mon Profil
        </Heading>
        <Text color="gray.500" mt={1}>
          Vos informations personnelles et professionnelles
        </Text>
      </Box>

      <Flex gap={6} direction={{ base: "column", lg: "row" }}>
        <Box bg="white" rounded="xl" shadow="sm" borderWidth="1px" borderColor="gray.200" p={8} flex={1} display="flex" flexDir="column" alignItems="center" gap={4} maxW={{ lg: "320px" }}>
          <Flex boxSize={20} rounded="full" bg="#1E3A5F" alignItems="center" justifyContent="center" color="white" fontWeight="bold" fontSize="2xl">
            {profil.prenom[0]}{profil.nom[0]}
          </Flex>
          <Box textAlign="center">
            <Text fontWeight="bold" fontSize="xl" color="gray.900">
              {profil.prenom} {profil.nom}
            </Text>
            <Text color="gray.500" fontSize="sm">{profil.poste}</Text>
            <Badge mt={2} px={3} py={1} rounded="full" fontSize="xs" colorScheme={profil.statut === "ACTIF" ? "green" : "red"} variant="subtle">
              {profil.statut}
            </Badge>
          </Box>
          <Divider my={2} />
          <Box w="full">
            <Flex justify="between" gap={2} direction="column">
              <Flex align="center" gap={2}>
                <Box as="span" className="material-symbols-outlined" fontSize="16px" color="gray.400">mail</Box>
                <Text fontSize="sm" color="gray.700">{profil.email}</Text>
              </Flex>
              {profil.telephone && (
                <Flex align="center" gap={2}>
                  <Box as="span" className="material-symbols-outlined" fontSize="16px" color="gray.400">phone</Box>
                  <Text fontSize="sm" color="gray.700">{profil.telephone}</Text>
                </Flex>
              )}
              <Flex align="center" gap={2}>
                <Box as="span" className="material-symbols-outlined" fontSize="16px" color="gray.400">badge</Box>
                <Text fontSize="sm" color="gray.700">{profil.matricule}</Text>
              </Flex>
            </Flex>
          </Box>
        </Box>

        <Box flex={1} display="flex" flexDir="column" gap={6}>
          <Box bg="white" rounded="xl" shadow="sm" borderWidth="1px" borderColor="gray.200" p={6}>
            <Heading as="h3" fontSize="lg" fontWeight="bold" color="gray.900" mb={4}>
              Informations personnelles
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <InfoRow label="Nom" value={profil.nom} icon="person" />
              <InfoRow label="Prénom" value={profil.prenom} icon="person" />
              <InfoRow label="Email" value={profil.email} icon="mail" />
              <InfoRow label="Téléphone" value={profil.telephone ?? "—"} icon="phone" />
              <InfoRow label="Date de naissance" value={profil.dateNaissance ? new Date(profil.dateNaissance).toLocaleDateString("fr-FR") : "—"} icon="cake" />
              <InfoRow label="Matricule" value={profil.matricule} icon="badge" />
            </SimpleGrid>
          </Box>

          <Box bg="white" rounded="xl" shadow="sm" borderWidth="1px" borderColor="gray.200" p={6}>
            <Heading as="h3" fontSize="lg" fontWeight="bold" color="gray.900" mb={4}>
              Informations professionnelles
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <InfoRow label="Poste" value={profil.poste} icon="work" />
              <InfoRow label="Département" value={profil.departement ?? "—"} icon="domain" />
              <InfoRow label="Date d'embauche" value={new Date(profil.dateEmbauche).toLocaleDateString("fr-FR")} icon="calendar_today" />
              <InfoRow label="Statut" value={profil.statut} icon="toggle_on" />
            </SimpleGrid>
          </Box>

          <Box bg="white" rounded="xl" shadow="sm" borderWidth="1px" borderColor="gray.200" p={6}>
            <Heading as="h3" fontSize="lg" fontWeight="bold" color="gray.900" mb={4}>
              Contrat
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <InfoRow label="Type de contrat" value={profil.contractType ?? "—"} icon="description" />
              <InfoRow label="Salaire de base" value={formatAriary(profil.salaireBase)} icon="payments" />
              <InfoRow label="Date début contrat" value={profil.dateDebutContrat ? new Date(profil.dateDebutContrat).toLocaleDateString("fr-FR") : "—"} icon="event" />
              <InfoRow label="Date fin contrat" value={profil.dateFinContrat ? new Date(profil.dateFinContrat).toLocaleDateString("fr-FR") : "—"} icon="event_busy" />
            </SimpleGrid>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}
