import {
  Box,
  Flex,
  Text,
  Heading,
  Button,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Link,
  SimpleGrid,
  Tag,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { ROLES } from "../types/auth";
import { getEmployeeStats, type EmployeeStats } from "../services/employee.service";
import { getAdminLeaveStats } from "../services/leave.service";
interface KpiCardProps {
  label: string;
  value: string | number;
  icon: string;
  iconColor: string;
  trend: { icon: string; text: string; color: string };
}

function KpiCard({ label, value, icon, iconColor, trend }: KpiCardProps) {
  const cardBg    = "white";
  const borderClr = "gray.200";
  const textMain  = "gray.900";
  const textMuted = "gray.500";

  return (
    <Box bg={cardBg} rounded="xl" p={6} shadow="sm" borderWidth="1px" borderColor={borderClr} display="flex" flexDir="column" justifyContent="space-between" h="36" position="relative" overflow="hidden" role="group" >
     <Box position="absolute" right={0} top={0} p={4} opacity={0.05} _groupHover={{ opacity: 0.1 }} transition="opacity 0.2s" pointerEvents="none" >
        <Box as="span" className="material-symbols-outlined" fontSize="96px" color={iconColor} lineHeight="1">
          {icon}
        </Box>
      </Box>
      <Box position="relative" zIndex={1}>
        <Text color={textMuted} fontSize="sm" fontWeight="medium">{label}</Text>
        <Heading as="h3" fontSize="3xl" fontWeight="bold" color={textMain} mt={2}>
          {value}
        </Heading>
      </Box>
      <Flex alignItems="center" gap={1} color={trend.color} fontSize="sm" fontWeight="medium" position="relative" zIndex={1}>
        <Box as="span" className="material-symbols-outlined" fontSize="16px" lineHeight="1">{trend.icon}</Box>
        <Text>{trend.text}</Text>
      </Flex>
    </Box>
  );
}
const bars = [
  { label: "Tech",  pct: 65, color: "#1E3A5F" },
  { label: "HR",    pct: 40, color: "#0d9488" },
  { label: "Sales", pct: 85, color: "#1E3A5F" },
  { label: "MKT",   pct: 30, color: "#0d9488" },
  { label: "Ops",   pct: 55, color: "#1E3A5F" },
];

function BarChart() {
  const cardBg    = "white";
  const borderClr = "gray.200";
  const trackBg   = "gray.100";

  return (
    <Box bg={cardBg} rounded="xl" p={6} shadow="sm" borderWidth="1px" borderColor={borderClr} gridColumn={{ lg: "span 2" }}>
      <Flex justify="space-between" align="flex-start" mb={6}>
        <Box>
          <Heading as="h3" fontSize="lg" fontWeight="bold" color="gray.900">
            Absences par département
          </Heading>
          <Text color="gray.500" fontSize="sm">Comparaison mensuelle</Text>
        </Box>
        <Link color="#1E3A5F" fontSize="sm" fontWeight="medium" _hover={{ textDecoration: "underline" }}>
          Voir détails
        </Link>
      </Flex>
      <Flex alignItems="flex-end" justify="space-between" gap={4} h="64" px={2}>
        {bars.map((bar) => (
          <Flex key={bar.label} flexDir="column" alignItems="center" gap={2} flex={1} h="full" role="group" cursor="pointer">
            <Box w="full" bg={trackBg} rounded="lg" h="full" display="flex" alignItems="flex-end" overflow="hidden">
              <Box
                w="full"
                bg={bar.color}
                rounded="lg"
                style={{ height: `${bar.pct}%` }}
                transition="height 0.5s ease, opacity 0.2s"
                _groupHover={{ opacity: 0.85 }}
              />
            </Box>
            <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase" letterSpacing="wide">
              {bar.label}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
}
const CONTRACT_COLORS: Record<string, string> = {
  CDI:      "#1E3A5F",
  CDD:      "#0d9488",
  STAGE:    "#fbbf24",
  FREELANCE:"#ef4444",
};

interface DonutChartProps {
  distribution: Record<string, number>;
  total: number;
}

function DonutChart({ distribution, total }: DonutChartProps) {
  const cardBg    = "white";
  const borderClr = "gray.200";
  const innerBg   = "white";

  const entries = Object.entries(distribution);
  let cumulative = 0;
  const segments = entries.map(([type, count]) => {
    const pct = total > 0 ? (count / total) * 100 : 0;
    const seg = { type, count, pct, start: cumulative };
    cumulative += pct;
    return seg;
  });

  const gradient = segments.length > 0
    ? segments.map((s) => {
        const color = CONTRACT_COLORS[s.type] ?? "#94a3b8";
        return `${color} ${s.start.toFixed(1)}% ${(s.start + s.pct).toFixed(1)}%`;
      }).join(", ")
    : "#e2e8f0 0% 100%";

  return (
    <Box bg={cardBg} rounded="xl" p={6} shadow="sm" borderWidth="1px" borderColor={borderClr} display="flex" flexDir="column" >
      <Heading as="h3" fontSize="lg" fontWeight="bold" color="gray.900" mb={6}>
        Types de contrats
      </Heading>
      <Flex flex={1} alignItems="center" justifyContent="center">
        <Box w="192px" h="192px" borderRadius="full" position="relative" display="flex" alignItems="center" justifyContent="center" sx={{ background: `conic-gradient(${gradient})` }}>
          <Box w="128px" h="128px" borderRadius="full" bg={innerBg} display="flex" flexDir="column" alignItems="center" justifyContent="center" zIndex={1} boxShadow="inner" >
            <Heading as="span" fontSize="3xl" fontWeight="bold" color="gray.900">
              {total}
            </Heading>
            <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase">
              Total
            </Text>
          </Box>
        </Box>
      </Flex>
      <SimpleGrid columns={2} spacing={4} mt={6}>
        {segments.map(({ type, pct }) => (
          <Flex key={type} alignItems="center" gap={2}>
            <Box boxSize={3} borderRadius="full" bg={CONTRACT_COLORS[type] ?? "#94a3b8"} flexShrink={0} />
            <Box>
              <Text fontSize="xs" fontWeight="semibold" color="gray.900">{type}</Text>
              <Text fontSize="xs" color="gray.500">{total > 0 ? `${pct.toFixed(0)}%` : "0%"}</Text>
            </Box>
          </Flex>
        ))}
      </SimpleGrid>
    </Box>
  );
}

function UpcomingEvents() {
  const cardBg    = "white";
  const borderClr = "gray.200";
  const events = [
    { title: "Réunion d'équipe", date: "Demain, 09:00", icon: "groups", color: "blue.500" },
    { title: "Anniversaire de Sophie", date: "15 Oct", icon: "cake", color: "pink.500" },
    { title: "Fin de période d'essai", date: "22 Oct - Jean D.", icon: "history_edu", color: "orange.500" },
  ];

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
      <Link color="#1E3A5F" fontSize="xs" fontWeight="bold" display="block" mt={6} textAlign="center" py={2} bg="gray.50" rounded="lg" _hover={{ bg: "gray.100", textDecoration: 'none' }}>
        Consulter le calendrier
      </Link>
    </Box>
  );
}

const leaveData = [
  { initials: "SM", bgColor: "rgba(30,58,95,0.1)",  textColor: "#1E3A5F",  name: "Sophie Martin", type: "Congés payés", dates: "12 Oct - 15 Oct", days: "4 jours",  status: "EN ATTENTE" },
  { initials: "TL", bgColor: "rgba(13,148,136,0.1)",textColor: "#0d9488",  name: "Thomas Leroy",  type: "RTT", dates: "20 Oct - 20 Oct", days: "1 jour",   status: "APPROUVÉ"   },
  { initials: "LB", bgColor: "#f3e8ff", textColor: "#9333ea",  name: "Lucas Bernard", type: "Maladie",  dates: "05 Oct - 07 Oct", days: "3 jours",  status: "APPROUVÉ"   },
  { initials: "CD", bgColor: "#dbeafe", textColor: "#2563eb",  name: "Claire Dubois", type: "Sans solde",   dates: "15 Nov - 30 Nov", days: "15 jours", status: "EN ATTENTE" },
];

function statusBadge(status: string) {
  const isPending = status === "EN ATTENTE";
  return (
    <Badge px={2.5} py={0.5} borderRadius="full" fontSize="xs" fontWeight="medium" textTransform="uppercase" colorScheme={isPending ? "yellow" : "green"} variant="subtle"> {status} </Badge>
  );
}

function LeaveTable() {
  const cardBg    = "white";
  const borderClr = "gray.200";
  const headBg    = "gray.50";
  const textMain  = "gray.900";
  const textMuted = "gray.600";
  const rowHover  = "gray.50";
  const footerBg  = "gray.50";

  return (
    <Box bg={cardBg} rounded="xl" shadow="sm" borderWidth="1px" borderColor={borderClr} overflow="hidden">
      <Flex px={6} py={4} borderBottomWidth="1px" borderColor={borderClr} justify="space-between" align="center">
        <Heading as="h3" fontSize="lg" fontWeight="bold" color={textMain}>
          Dernières demandes de congés
        </Heading>
        <IconButton aria-label="Plus d'options" variant="ghost" icon={<Box as="span" className="material-symbols-outlined" fontSize="20px" lineHeight="1">more_horiz</Box>} color="gray.500" _hover={{ color: "#1E3A5F" }} size="sm"/>
      </Flex>
      <Box overflowX="auto">
        <Table variant="unstyled" size="md">
          <Thead bg={headBg}>
            <Tr>
              {["Employé","Type","Dates","Durée","Statut","Actions"].map((h, i) => (
                <Th key={h} px={6} py={4} fontSize="xs" textTransform="uppercase" fontWeight="semibold" color="gray.500" letterSpacing="wider" textAlign={i === 5 ? "right" : "left"} >
                  {h}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {leaveData.map((row) => (
              <Tr key={row.name} _hover={{ bg: rowHover }} transition="background 0.15s">
                <Td px={6} py={4}>
                  <Flex alignItems="center" gap={3}>
                    <Flex boxSize={8} rounded="full" bg={row.bgColor} color={row.textColor} alignItems="center" justifyContent="center" fontWeight="bold" fontSize="xs" flexShrink={0} >
                      {row.initials}
                    </Flex>
                    <Text fontWeight="medium" color={textMain} whiteSpace="nowrap">
                      {row.name}
                    </Text>
                  </Flex>
                </Td>
                <Td px={6} py={4} color={textMuted}>{row.type}</Td>
                <Td px={6} py={4} color={textMuted} whiteSpace="nowrap">{row.dates}</Td>
                <Td px={6} py={4} color={textMuted}>{row.days}</Td>
                <Td px={6} py={4}>{statusBadge(row.status)}</Td>
                <Td px={6} py={4} textAlign="right">
                  <IconButton aria-label="Voir" variant="ghost" size="sm" icon={<Box as="span" className="material-symbols-outlined" fontSize="20px" lineHeight="1">visibility</Box>} color="gray.400" _hover={{ color: "#1E3A5F" }} />
                </Td>
              </Tr>
            ))} 
          </Tbody>
        </Table>
      </Box>
      <Flex px={4} py={4} borderTopWidth="1px" borderColor={borderClr} bg={footerBg}  justify="center" >
        <Link color="#1E3A5F" fontSize="sm" fontWeight="medium" _hover={{ color: "rgba(30,58,95,0.8)", textDecoration: "none" }} display="flex" alignItems="center" gap={1}>
          Voir toutes les demandes
          <Box as="span" className="material-symbols-outlined" fontSize="18px" lineHeight="1">
            arrow_forward
          </Box>
        </Link>
      </Flex>
    </Box>
  );
}

export default function DashboardPage() {
  const borderClr = "gray.200";
  const textMain  = "gray.900";
  const textMuted = "gray.500";

  const { user, hasRole } = useAuth();
  const isAdmin = hasRole(ROLES.ADMIN);
  const isRh    = hasRole(ROLES.RH);

  const [employeeStats, setEmployeeStats] = useState<EmployeeStats | null>(null);
  const [pendingLeaves, setPendingLeaves] = useState<number | null>(null);

  useEffect(() => {
    getEmployeeStats().then(setEmployeeStats).catch(() => {});
    getAdminLeaveStats().then((s) => setPendingLeaves(s.pending)).catch(() => {});
  }, []);

  const totalEmployees = employeeStats?.totalEmployees ?? "—";
  const contractDistribution = employeeStats?.contractDistribution ?? {};
  const contractTotal = Object.values(contractDistribution).reduce((a, b) => a + b, 0);

  const kpiCards: KpiCardProps[] = [
    {
      label: "Total Employés",
      value: totalEmployees,
      icon: "groups",
      iconColor: "#1E3A5F",
      trend: { icon: "trending_up", text: "+3% ce mois", color: "var(--chakra-colors-green-600)" },
    },
    {
      label: "Congés en attente",
      value: pendingLeaves ?? "—",
      icon: "pending_actions",
      iconColor: "#f97316",
      trend: { icon: "warning", text: "Action requise", color: "var(--chakra-colors-orange-600)" },
    },
    {
      label: "Absences ce mois",
      value: 12,
      icon: "person_remove",
      iconColor: "#ef4444",
      trend: { icon: "remove", text: "Stable", color: "var(--chakra-colors-gray-500)" },
    },
    {
      label: "Fiches de paie",
      value: totalEmployees,
      icon: "receipt_long",
      iconColor: "#0d9488",
      trend: { icon: "check_circle", text: "Envoyées à 100%", color: "var(--chakra-colors-green-600)" },
    },
  ];

  return (
    <Box maxW="1600px" mx="auto" w="full" display="flex" flexDir="column" gap={8}>
          <Flex as="header" justify="space-between" align="flex-end" pb={4} borderBottomWidth="1px" borderColor={borderClr}>
            <Box>
              <Flex alignItems="center" gap={3} mb={1}>
                <Heading as="h2" fontSize="3xl" fontWeight="bold" color={textMain} letterSpacing="tight">
                  Tableau de bord
                </Heading>
                {isAdmin && (
                  <Tag size="sm" bg="#e25822" color="white" fontWeight="bold" px={2} rounded="md">
                    ADMIN
                  </Tag>
                )}
                {!isAdmin && isRh && (
                  <Tag size="sm" bg="#0d9488" color="white" fontWeight="bold" px={2} rounded="md">
                    RH
                  </Tag>
                )}
              </Flex>
              <Text color={textMuted} mt={1}>
                Bonjour, {user?.username} — Aperçu général de votre entreprise
              </Text>
            </Box>
            <Flex gap={4}>
              <IconButton aria-label="Notifications" icon={<Box as="span" className="material-symbols-outlined" lineHeight="1">notifications</Box>} variant="outline" borderRadius="full" bg="white" borderColor={borderClr} color="gray.600" _hover={{ bg: "gray.50" }} boxShadow="sm" />
              {isAdmin && (
                <Button bg="#7c3aed" color="white" px={5} py={2.5} rounded="lg" fontSize="sm" fontWeight="medium" leftIcon={<Box as="span" className="material-symbols-outlined" fontSize="18px" lineHeight="1">verified</Box>} _hover={{ bg: "rgba(124,58,237,0.9)" }} boxShadow="sm" transition="background 0.15s">
                  Valider les fiches de paie
                </Button>
              )}
            </Flex>
          </Flex>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            {kpiCards.map((card) => (
              <KpiCard key={card.label} {...card} />
            ))}
          </SimpleGrid>
          <SimpleGrid columns={{ base: 1, lg: 4 }} spacing={6}>
            <BarChart />
            <DonutChart distribution={contractDistribution} total={contractTotal} />
            <UpcomingEvents />
          </SimpleGrid>
          <LeaveTable />
        </Box>
  );
}
