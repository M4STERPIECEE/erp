import {
  Box,
  Flex,
  Text,
  Heading,
  SimpleGrid,
  Spinner,
  Badge,
} from "@chakra-ui/react";
import { useMyProfile } from "../../hooks/useMyProfile";
import { useMyLeaves } from "../../hooks/useMyLeaves";
import { useMyAbsences } from "../../hooks/useMyAbsences";
import { useMyPayslips } from "../../hooks/useMyPayslips";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: string;
  iconColor: string;
  sub?: string;
}

function KpiCard({ label, value, icon, iconColor, sub }: KpiCardProps) {
  return (
    <Box bg="white" rounded="xl" p={6} shadow="sm" borderWidth="1px" borderColor="gray.200" display="flex" flexDir="column" justifyContent="space-between" h="36" position="relative" overflow="hidden" role="group">
      <Box position="absolute" right={0} top={0} p={4} opacity={0.05} _groupHover={{ opacity: 0.1 }} transition="opacity 0.2s" pointerEvents="none">
        <Box as="span" className="material-symbols-outlined" fontSize="96px" color={iconColor} lineHeight="1">{icon}</Box>
      </Box>
      <Box position="relative" zIndex={1}>
        <Text color="gray.500" fontSize="sm" fontWeight="medium">{label}</Text>
        <Heading as="h3" fontSize="3xl" fontWeight="bold" color="gray.900" mt={2}>{value}</Heading>
      </Box>
      {sub && (
        <Text fontSize="sm" fontWeight="medium" color="gray.500" position="relative" zIndex={1}>{sub}</Text>
      )}
    </Box>
  );
}

function formatAriary(amount: number | null): string {
  if (amount === null) return "—";
  return amount.toLocaleString("fr-FR") + " Ar";
}

export default function EmployeeDashboardPage() {
  const { profil, isLoading: profilLoading } = useMyProfile();
  const { stats, conges, isLoading: congesLoading } = useMyLeaves();
  const { absences, isLoading: absencesLoading } = useMyAbsences();
  const { fiches, isLoading: fichesLoading } = useMyPayslips();

  const isLoading = profilLoading || congesLoading || absencesLoading || fichesLoading;

  if (isLoading) {
    return (
      <Flex h="full" align="center" justify="center" direction="column" gap={4}>
        <Spinner size="xl" color="#1E3A5F" thickness="3px" />
        <Text color="gray.500" fontSize="sm">Chargement…</Text>
      </Flex>
    );
  }

  const derniereFiche = fiches.length > 0 ? fiches[0] : null;
  const congesEnAttente = conges.filter((c) => c.statut === "EN_ATTENTE").length;

  return (
    <Box as="main" p={{ base: 4, lg: 8 }} maxW="1600px" mx="auto" w="full" display="flex" flexDir="column" gap={8}>
      <Box pb={4} borderBottomWidth="1px" borderColor="gray.200">
        <Heading as="h2" fontSize="3xl" fontWeight="bold" color="gray.900" letterSpacing="tight">
          Tableau de bord
        </Heading>
        <Text color="gray.500" mt={1}>
          Bonjour, {profil?.prenom} {profil?.nom} — Bienvenue dans votre espace personnel
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <KpiCard
          label="Congés restants"
          value={stats?.joursRestants ?? 0}
          icon="event_available"
          iconColor="#0d9488"
          sub={`${stats?.joursUtilises ?? 0} jours utilisés`}
        />
        <KpiCard
          label="En attente"
          value={congesEnAttente}
          icon="pending_actions"
          iconColor="#f97316"
          sub="Demandes de congés"
        />
        <KpiCard
          label="Absences ce mois"
          value={absences.length}
          icon="person_off"
          iconColor="#ef4444"
          sub={`${absences.filter((a) => a.justifiee).length} justifiée(s)`}
        />
        <KpiCard
          label="Dernier salaire net"
          value={derniereFiche ? formatAriary(derniereFiche.salaireNet) : "—"}
          icon="payments"
          iconColor="#1E3A5F"
          sub={derniereFiche ? `${String(derniereFiche.mois).padStart(2, "0")}/${derniereFiche.annee}` : ""}
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <Box bg="white" rounded="xl" p={6} shadow="sm" borderWidth="1px" borderColor="gray.200">
          <Heading as="h3" fontSize="lg" fontWeight="bold" color="gray.900" mb={4}>
            Mes derniers congés
          </Heading>
          {conges.length === 0 ? (
            <Text color="gray.400" fontSize="sm">Aucun congé enregistré</Text>
          ) : (
            <Flex flexDir="column" gap={3}>
              {conges.slice(0, 5).map((c) => (
                <Flex key={c.id} align="center" justify="space-between" p={3} bg="gray.50" rounded="lg">
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color="gray.900">
                      {c.type.replace("_", " ")} — {c.joursOuvrables} jour(s)
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {new Date(c.dateDebut).toLocaleDateString("fr-FR")} → {new Date(c.dateFin).toLocaleDateString("fr-FR")}
                    </Text>
                  </Box>
                  <Badge
                    px={2.5} py={0.5} borderRadius="full" fontSize="xs" fontWeight="medium"
                    colorScheme={c.statut === "APPROUVE" ? "green" : c.statut === "EN_ATTENTE" ? "yellow" : "red"}
                    variant="subtle"
                  >
                    {c.statut.replace("_", " ")}
                  </Badge>
                </Flex>
              ))}
            </Flex>
          )}
        </Box>

        <Box bg="white" rounded="xl" p={6} shadow="sm" borderWidth="1px" borderColor="gray.200">
          <Heading as="h3" fontSize="lg" fontWeight="bold" color="gray.900" mb={4}>
            Informations rapides
          </Heading>
          <Flex flexDir="column" gap={3}>
            {[
              { label: "Poste", value: profil?.poste ?? "—", icon: "work" },
              { label: "Département", value: profil?.departement ?? "—", icon: "domain" },
              { label: "Contrat", value: profil?.contractType ?? "—", icon: "description" },
              { label: "Matricule", value: profil?.matricule ?? "—", icon: "badge" },
              { label: "Date d'embauche", value: profil?.dateEmbauche ? new Date(profil.dateEmbauche).toLocaleDateString("fr-FR") : "—", icon: "calendar_today" },
            ].map((item) => (
              <Flex key={item.label} align="center" gap={3} p={3} bg="gray.50" rounded="lg">
                <Flex boxSize={9} bg="white" rounded="lg" align="center" justify="center" flexShrink={0} borderWidth="1px" borderColor="gray.100">
                  <Box as="span" className="material-symbols-outlined" fontSize="18px" color="#1E3A5F">{item.icon}</Box>
                </Flex>
                <Box>
                  <Text fontSize="xs" color="gray.500" fontWeight="medium">{item.label}</Text>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.900">{item.value}</Text>
                </Box>
              </Flex>
            ))}
          </Flex>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
