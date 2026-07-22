import { useState, useEffect } from "react";
import {
  Box, Flex, Text, Heading, Button, IconButton, SimpleGrid, Tag,
} from "@chakra-ui/react";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../types/auth";
import { getEmployeeStats, type EmployeeStats } from "../../services/employee.service";
import { getAdminLeaveStats } from "../../services/leave.service";
import KpiCard from "../../components/KpiCard";
import type { KpiCardProps } from "../../components/KpiCard";
import BarChart from "./bar-chart";
import DonutChart from "./donut-chart";
import UpcomingEvents from "./upcoming-events";
import LeaveTable from "./leave-table";

export default function DashboardPage() {
  const borderClr = "gray.200";
  const textMain = "gray.900";
  const textMuted = "gray.500";

  const { user, hasRole } = useAuth();
  const isAdmin = hasRole(ROLES.ADMIN);
  const isRh = hasRole(ROLES.RH);

  const [employeeStats, setEmployeeStats] = useState<EmployeeStats | null>(null);
  const [pendingLeaves, setPendingLeaves] = useState<number | null>(null);

  useEffect(() => {
    getEmployeeStats().then(setEmployeeStats).catch(() => { });
    getAdminLeaveStats().then((s) => setPendingLeaves(s.pending)).catch(() => { });
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
              <Tag size="sm" bg="#e25822" color="white" fontWeight="bold" px={2} rounded="md">ADMIN</Tag>
            )}
            {!isAdmin && isRh && (
              <Tag size="sm" bg="#0d9488" color="white" fontWeight="bold" px={2} rounded="md">RH</Tag>
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
