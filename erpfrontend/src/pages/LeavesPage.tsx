import { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Spinner,
  Button,
} from "@chakra-ui/react";
import Sidebar from "../components/Sidebar";
import { useAllLeaves } from "../hooks/useAllLeaves";
import { useDepartments } from "../hooks/useDepartments";
import type { AdminLeaveResponse } from "../types/leave.types";
import type { LeaveStatus, LeaveType } from "../types/employee-space.types";

const TYPE_LABELS: Record<LeaveType, string> = {
  ANNUEL: "Congés Payés",
  MALADIE: "Maladie",
  MATERNITE: "Maternité",
  SANS_SOLDE: "Sans solde",
};

const STATUS_CONFIG: Record<LeaveStatus, { label: string; bg: string; color: string; border: string; dot: string }> = {
  EN_ATTENTE: { label: "En attente", bg: "#fff7ed", color: "#c2410c", border: "#fed7aa", dot: "#f97316" },
  APPROUVE:   { label: "Approuvé",   bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0", dot: "#22c55e" },
  REJETE:     { label: "Refusé",     bg: "#fef2f2", color: "#b91c1c", border: "#fecaca", dot: "#ef4444" },
};

const AVATAR_COLORS = ["#e0e7ff", "#dbeafe", "#fce7f3", "#d1fae5", "#fef9c3", "#ede9fe"];
const AVATAR_TEXT   = ["#4338ca", "#1d4ed8", "#be185d", "#047857", "#a16207", "#6d28d9"];

function getInitials(nom: string, prenom: string): string {
  return ((prenom?.[0] ?? "") + (nom?.[0] ?? "")).toUpperCase();
}

function formatDateRange(debut: string, fin: string): string {
  const opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" };
  const d = new Date(debut).toLocaleDateString("fr-FR", opts);
  const f = new Date(fin).toLocaleDateString("fr-FR", opts);
  return d === f ? d : `${d} – ${f}`;
}

function fmtShortDate(s: string): string {
  return new Date(s + "T00:00:00").toLocaleDateString("fr-FR");
}

const PAGE_SIZE = 8;

export default function LeavesPage() {
  const [tab, setTab] = useState<"all" | "pending" | "calendar">("all");
  const [page, setPage] = useState(0);
  const [statutFilter, setStatutFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState<number | undefined>();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const effectiveStatut = tab === "pending" ? "EN_ATTENTE" : statutFilter || undefined;
  const { leaves, stats, isLoading, error, approve, reject } = useAllLeaves(effectiveStatut, search || undefined, deptFilter, dateFrom || undefined, dateTo || undefined);
  const { departements } = useDepartments();

  const totalPages = Math.max(1, Math.ceil(leaves.length / PAGE_SIZE));
  const paginated = leaves.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (error) {
    return (
      <Flex h="100vh" fontFamily="'Inter', sans-serif">
        <Sidebar activePage="leaves" />
        <Flex flex={1} align="center" justify="center" direction="column" gap={4}>
          <Box as="span" className="material-symbols-outlined" fontSize="64px" color="red.400">error</Box>
          <Text color="gray.700" fontWeight="bold">{error}</Text>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex h="100vh" overflow="hidden" fontFamily="'Inter', sans-serif">
      <Sidebar activePage="leaves" />

      <Box flex={1} overflowY="auto" bg="#f6f7f7" px={{ base: 6, lg: 10 }} py={8}>
        <Box w="full" display="flex" flexDir="column" gap={6}>
          <Box>
            <Heading as="h1" fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="gray.900" letterSpacing="tight">Aperçu des demandes</Heading>
            <Text color="gray.500" mt={1} fontSize="sm">Gérez et suivez les congés de vos équipes en temps réel.</Text>
          </Box>
          <Box borderBottomWidth="1px" borderColor="gray.200" />
          {stats && (
            <Flex gap={6} flexWrap="wrap">
              <KpiCard label="En attente" value={stats.pending} icon="hourglass_top" iconBg="#fff7ed" iconColor="#ea580c" />
              <KpiCard label="Approuvés" value={stats.approved} icon="check_circle" iconBg="#dcfce7" iconColor="#16a34a" />
              <KpiCard label="En congés aujourd'hui" value={stats.onLeaveToday} icon="flight_takeoff" iconBg="#dbeafe" iconColor="#2563eb" />
              <KpiCard label="Planifiés (Mois)" value={stats.plannedThisMonth} icon="calendar_month" iconBg="#ede9fe" iconColor="#7c3aed" />
            </Flex>
          )}
          <Box bg="white" rounded="xl" borderWidth="1px" borderColor="gray.200" shadow="sm">
            <Flex px={6} borderBottomWidth="1px" borderColor="gray.200" align="center">
              <TabButton label="Toutes les demandes" active={tab === "all"} onClick={() => { setTab("all"); setPage(0); }} />
              <TabButton label="En attente" active={tab === "pending"} onClick={() => { setTab("pending"); setPage(0); }} />
              <TabButton label="Calendrier d'équipe" active={tab === "calendar"} onClick={() => { setTab("calendar"); setPage(0); }} />
            </Flex>
            <Box px={4} py={3} borderBottomWidth="1px" borderColor="gray.200">
              <Flex align="center" gap={3} flexWrap="wrap">
                <Flex align="center" gap={2} flex={1} flexWrap="wrap">
                  <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase" letterSpacing="wider" whiteSpace="nowrap">Filtrer par :</Text>
                  <Menu>
                    <MenuButton as={Button} size="sm" rounded="md" bg="gray.100" border="none" color="gray.700" fontWeight="medium" fontSize="sm" minW="150px"
                      textAlign="left" _hover={{ bg: "gray.200" }} _active={{ bg: "gray.100" }} isDisabled={tab === "pending"}
                      rightIcon={<Box as="span" className="material-symbols-outlined" fontSize="16px" color="gray.500" lineHeight="1">keyboard_arrow_down</Box>}>
                      {statutFilter === "" ? "Tous les statuts" : statutFilter === "EN_ATTENTE" ? "En attente" : statutFilter === "APPROUVE" ? "Approuvé" : "Refusé"}
                    </MenuButton>
                    <MenuList rounded="xl" shadow="lg" borderColor="gray.200" p={2} bg="white" minW="0">
                      {([{value: "", label: "Tous les statuts"}, {value: "EN_ATTENTE", label: "En attente"}, {value: "APPROUVE", label: "Approuvé"}, {value: "REJETE", label: "Refusé"}] as const).map((opt) => (
                        <MenuItem key={opt.value} rounded="lg" fontSize="sm" color="gray.700"
                          bg={statutFilter === opt.value ? "teal.50" : "transparent"}
                          fontWeight={statutFilter === opt.value ? "600" : "normal"}
                          _hover={{ bg: "gray.100" }}
                          onClick={() => { setStatutFilter(opt.value); setPage(0); }}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                  <Menu>
                    <MenuButton as={Button} size="sm" rounded="md" bg="white" borderWidth="1px" borderColor="gray.200" color="gray.600" fontWeight="medium" fontSize="sm" minW="150px"
                      textAlign="left" _hover={{ bg: "gray.50" }} _active={{ bg: "white" }}
                      rightIcon={<Box as="span" className="material-symbols-outlined" fontSize="16px" color="gray.500" lineHeight="1">keyboard_arrow_down</Box>}>
                      {deptFilter ? (departements.find((d) => d.id === deptFilter)?.nom ?? "Département") : "Département"}
                    </MenuButton>
                    <MenuList rounded="xl" shadow="lg" borderColor="gray.200" p={2} bg="white" minW="0">
                      <MenuItem rounded="lg" fontSize="sm" color="gray.700"
                        bg={!deptFilter ? "teal.50" : "transparent"} fontWeight={!deptFilter ? "600" : "normal"}
                        _hover={{ bg: "gray.100" }} onClick={() => { setDeptFilter(undefined); setPage(0); }}>
                        Tous les départements
                      </MenuItem>
                      {departements.map((d) => (
                        <MenuItem key={d.id} rounded="lg" fontSize="sm" color="gray.700"
                          bg={deptFilter === d.id ? "teal.50" : "transparent"} fontWeight={deptFilter === d.id ? "600" : "normal"}
                          _hover={{ bg: "gray.100" }} onClick={() => { setDeptFilter(d.id); setPage(0); }}>
                          {d.nom}
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                  <Popover placement="bottom-start">
                    <PopoverTrigger>
                      <Button size="sm" variant="outline"
                        borderColor={dateFrom || dateTo ? "teal.400" : "gray.200"}
                        bg="white"
                        color={dateFrom || dateTo ? "teal.600" : "gray.500"}
                        fontSize="sm" rounded="md"
                        leftIcon={<Box as="span" className="material-symbols-outlined" fontSize="16px" lineHeight="1">calendar_month</Box>}>
                        {dateFrom && dateTo ? (
                          <Flex direction="column" align="flex-start" lineHeight="1.1">
                            <Text fontSize="xs" color="gray.600">Du {fmtShortDate(dateFrom)}</Text>
                            <Text fontSize="xs" color="gray.600">Au {fmtShortDate(dateTo)}</Text>
                          </Flex>
                        ) : dateFrom ? (
                          `Du ${fmtShortDate(dateFrom)}`
                        ) : dateTo ? (
                          `Au ${fmtShortDate(dateTo)}`
                        ) : (
                          "Période"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent w="260px" rounded="xl" shadow="md" borderColor="gray.100" bg="white" _focus={{ outline: "none" }}>
                      <PopoverBody p={4}>
                        <Flex direction="column" gap={3}>
                          <Box>
                            <Text fontSize="xs" fontWeight="semibold" color="gray.900" mb={1} textTransform="uppercase" letterSpacing="wider">Du</Text>
                            <Input type="date" size="sm" rounded="md" borderColor="gray.200" bg="gray.50" fontSize="sm" color="gray.900"
                              value={dateFrom} max={dateTo || undefined}
                              onChange={(e) => { setDateFrom(e.target.value); setPage(0); }} />
                          </Box>
                          <Box>
                            <Text fontSize="xs" fontWeight="semibold" color="gray.900" mb={1} textTransform="uppercase" letterSpacing="wider">Au</Text>
                            <Input type="date" size="sm" rounded="md" borderColor="gray.200" bg="gray.50" fontSize="sm" color="gray.900"
                              value={dateTo} min={dateFrom || undefined}
                              onChange={(e) => { setDateTo(e.target.value); setPage(0); }} />
                          </Box>
                          {(dateFrom || dateTo) && (
                            <Button size="xs" variant="ghost" color="gray.900" fontSize="xs" _hover={{ bg: "gray.50", color: "#1E3A5F" }}
                              onClick={() => { setDateFrom(""); setDateTo(""); setPage(0); }}>
                              Effacer les dates
                            </Button>
                          )}
                        </Flex>
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                </Flex>
                <Flex align="center" gap={2}>
                  <InputGroup size="sm">
                    <InputLeftElement>
                      <Box as="span" className="material-symbols-outlined" fontSize="18px" color="gray.400" lineHeight="1">search</Box>
                    </InputLeftElement>
                    <Input pl={8} w="240px" rounded="md" borderColor="gray.200" color="gray.900" placeholder="Rechercher un employé..."
                      _placeholder={{ color: "gray.500" }}
                      fontSize="sm" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
                  </InputGroup>
                  <IconButton aria-label="Réinitialiser" size="sm" variant="ghost" color="gray.500" _hover={{ color: "#1E3A5F" }}
                    icon={<Box as="span" className="material-symbols-outlined" fontSize="20px" lineHeight="1">filter_list</Box>}
                    onClick={() => { setStatutFilter(""); setDeptFilter(undefined); setSearchInput(""); setSearch(""); setDateFrom(""); setDateTo(""); setPage(0); }}
                  />
                </Flex>
              </Flex>
            </Box>
            <Box overflowX="auto">
              <Table variant="unstyled" size="md">
                <Thead>
                  <Tr bg="gray.50">
                    {["Employé", "Type", "Dates", "Jours", "Motif", "Statut", "Actions"].map((h, i) => (
                      <Th key={h} px={6} py={4} fontSize="xs" textTransform="uppercase" fontWeight="semibold" color="gray.500" letterSpacing="wider" textAlign={i === 3 ? "center" : i === 6 ? "right" : "left"}>
                        {h}
                      </Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {isLoading ? (
                    <Tr>
                      <Td colSpan={7} textAlign="center" py={16}>
                        <Flex direction="column" align="center" gap={3}>
                          <Spinner size="lg" color="#1E3A5F" thickness="3px" />
                          <Text color="gray.400" fontSize="sm">Chargement des congés…</Text>
                        </Flex>
                      </Td>
                    </Tr>
                  ) : paginated.length === 0 ? (
                    <Tr>
                      <Td colSpan={7} textAlign="center" py={12}>
                        <Flex direction="column" align="center" gap={3}>
                          <Box as="span" className="material-symbols-outlined" fontSize="48px" color="gray.300">event_available</Box>
                          <Text color="gray.400" fontSize="sm">Aucune demande de congé</Text>
                        </Flex>
                      </Td>
                    </Tr>
                  ) : (
                    paginated.map((c) => (
                      <LeaveRow key={c.id} leave={c} onApprove={approve} onReject={reject} />
                    ))
                  )}
                </Tbody>
              </Table>
            </Box>
            <Flex px={6} py={4} borderTopWidth="1px" borderColor="gray.200" align="center" justify="space-between">
              <Text fontSize="sm" color="gray.500">
                Affichage de <Text as="span" fontWeight="medium" color="gray.900">{leaves.length === 0 ? 0 : page * PAGE_SIZE + 1}</Text> à{" "}
                <Text as="span" fontWeight="medium" color="gray.900">{Math.min((page + 1) * PAGE_SIZE, leaves.length)}</Text> sur{" "}
                <Text as="span" fontWeight="medium" color="gray.900">{leaves.length}</Text> résultats
              </Text>
              <Flex gap={1}>
                <Button size="sm" variant="outline" borderColor="gray.200" color="gray.500" fontSize="sm" isDisabled={page === 0} onClick={() => setPage((p) => p - 1)}>Précédent</Button>
                <Button size="sm" variant="outline" borderColor="gray.200" color="gray.500" fontSize="sm" isDisabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Suivant</Button>
              </Flex>
            </Flex>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}
function KpiCard({ label, value, icon, iconBg, iconColor }: { label: string; value: number; icon: string; iconBg: string; iconColor: string }) {
  return (
    <Box flex="1" minW="200px" bg="white" p={5} rounded="xl" borderWidth="1px" borderColor="gray.200" shadow="sm" display="flex" alignItems="flex-start" justifyContent="space-between">
      <Box>
        <Text color="gray.500" fontSize="sm" fontWeight="medium" mb={1}>{label}</Text>
        <Heading as="h4" fontSize="2xl" fontWeight="bold" color="gray.900">{value}</Heading>
      </Box>
      <Flex p={2} bg={iconBg} rounded="lg" align="center" justify="center">
        <Box as="span" className="material-symbols-outlined" color={iconColor} fontSize="22px" lineHeight="1">{icon}</Box>
      </Flex>
    </Box>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <Button variant="unstyled" py={4} px={2} mr={6} rounded="none" borderBottomWidth="2px" borderColor={active ? "#1E3A5F" : "transparent"} color={active ? "#1E3A5F" : "gray.500"} fontWeight={active ? "semibold" : "medium"} fontSize="sm" _hover={{ color: active ? "#1E3A5F" : "gray.700" }} transition="colors 0.15s" onClick={onClick}>
      {label}
    </Button>
  );
}

function LeaveRow({ leave, onApprove, onReject }: { leave: AdminLeaveResponse; onApprove: (id: number) => Promise<boolean>; onReject: (id: number) => Promise<boolean> }) {
  const c = leave;
  const idx = (c.employeId ?? 0) % AVATAR_COLORS.length;
  const initials = getInitials(c.employeNom, c.employePrenom);
  const s = STATUS_CONFIG[c.statut];

  return (
    <Tr _hover={{ bg: "gray.50" }} transition="background 0.15s" role="group">
      <Td px={6} py={4} whiteSpace="nowrap">
        <Flex align="center" gap={3}>
          <Flex boxSize={8} rounded="full" bg={AVATAR_COLORS[idx]} color={AVATAR_TEXT[idx]} align="center" justify="center" fontWeight="bold" fontSize="xs" flexShrink={0}>
            {initials}
          </Flex>
          <Box>
            <Text fontWeight="medium" color="gray.900" fontSize="sm">{c.employePrenom} {c.employeNom}</Text>
            <Text fontSize="xs" color="gray.500">{c.employePoste || "—"}</Text>
          </Box>
        </Flex>
      </Td>
      <Td px={6} py={4} whiteSpace="nowrap" color="gray.900" fontSize="sm">{TYPE_LABELS[c.type] ?? c.type}</Td>
      <Td px={6} py={4} whiteSpace="nowrap" color="gray.500" fontSize="sm">{formatDateRange(c.dateDebut, c.dateFin)}</Td>
      <Td px={6} py={4} whiteSpace="nowrap" textAlign="center" fontWeight="medium" color="gray.900" fontSize="sm">{c.nombreJours}</Td>
      <Td px={6} py={4} whiteSpace="nowrap" color="gray.500" fontSize="sm" maxW="150px" overflow="hidden" textOverflow="ellipsis" title={c.motif ?? ""}>{c.motif ? (c.motif.length > 20 ? c.motif.slice(0, 20) + "…" : c.motif) : "—"}</Td>
      <Td px={6} py={4} whiteSpace="nowrap">
        <Flex display="inline-flex" align="center" gap={1.5} px={2.5} py={1} rounded="full" fontSize="xs" fontWeight="medium" bg={s.bg} color={s.color} borderWidth="1px" borderColor={s.border}>
          <Box boxSize="6px" rounded="full" bg={s.dot} />
          {s.label}
        </Flex>
      </Td>
      <Td px={6} py={4} whiteSpace="nowrap" textAlign="right">
        {c.statut === "EN_ATTENTE" ? (
          <Flex justify="flex-end" gap={2} opacity={{ base: 1, sm: 0 }} _groupHover={{ opacity: 1 }} transition="opacity 0.15s">
            <IconButton aria-label="Approuver" size="sm" variant="ghost" icon={<Box as="span" className="material-symbols-outlined" fontSize="20px" lineHeight="1">check</Box>} color="green.600" _hover={{ bg: "green.50" }} onClick={() => onApprove(c.id)} />
            <IconButton aria-label="Refuser" size="sm" variant="ghost" icon={<Box as="span" className="material-symbols-outlined" fontSize="20px" lineHeight="1">close</Box>} color="red.500" _hover={{ bg: "red.50" }} onClick={() => onReject(c.id)} />
          </Flex>
        ) : (
          <IconButton aria-label="Plus" size="sm" variant="ghost" icon={<Box as="span" className="material-symbols-outlined" fontSize="18px" lineHeight="1">more_horiz</Box>} color="gray.400" _hover={{ color: "#1E3A5F" }} />
        )}
      </Td>
    </Tr>
  );
}
