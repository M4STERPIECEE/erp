import { useEffect, useState } from "react";
import {
  Box, Flex, Text, Heading, Table, Thead, Tbody, Tr, Th, Td,
  Input, InputGroup, InputLeftElement, IconButton,
  Menu, MenuButton, MenuList, MenuItem,
  Popover, PopoverTrigger, PopoverContent, PopoverBody,
  Spinner, Button,
} from "@chakra-ui/react";
import { useAllLeaves } from "../../hooks/useAllLeaves";
import { useDepartments } from "../../hooks/useDepartments";
import KpiCard from "./kpi-card";
import TabButton from "./tab-button";
import LeaveRow from "./leave-row";

function fmtShortDate(s: string): string {
  return new Date(s + "T00:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
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
      <Flex flex={1} align="center" justify="center" direction="column" gap={4}>
        <Box as="span" className="material-symbols-outlined" fontSize="64px" color="red.400">error</Box>
        <Text color="gray.700" fontWeight="bold">{error}</Text>
      </Flex>
    );
  }

  return (
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
        <Box px={4} py={3}>
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
                  {([{ value: "", label: "Tous les statuts" }, { value: "EN_ATTENTE", label: "En attente" }, { value: "APPROUVE", label: "Approuvé" }, { value: "REJETE", label: "Refusé" }] as const).map((opt) => (
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
                  <MenuItem rounded="lg" fontSize="sm" color="gray.700" bg={!deptFilter ? "teal.50" : "transparent"} fontWeight={!deptFilter ? "600" : "normal"} _hover={{ bg: "gray.100" }} onClick={() => { setDeptFilter(undefined); setPage(0); }}>
                    Tous les départements
                  </MenuItem>
                  {departements.map((d) => (
                    <MenuItem key={d.id} rounded="lg" fontSize="sm" color="gray.700" bg={deptFilter === d.id ? "teal.50" : "transparent"} fontWeight={deptFilter === d.id ? "600" : "normal"} _hover={{ bg: "gray.100" }} onClick={() => { setDeptFilter(d.id); setPage(0); }}>
                      {d.nom}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
              <Popover placement="bottom-start">
                <PopoverTrigger>
                  <Button size="sm" variant="outline" borderColor={dateFrom || dateTo ? "teal.400" : "gray.200"} bg="white" color={dateFrom || dateTo ? "teal.600" : "gray.500"} fontSize="sm" rounded="md" leftIcon={<Box as="span" className="material-symbols-outlined" fontSize="16px" lineHeight="1">calendar_month</Box>}>
                    {dateFrom && dateTo ? `${fmtShortDate(dateFrom)} – ${fmtShortDate(dateTo)}` : dateFrom ? `Depuis ${fmtShortDate(dateFrom)}` : dateTo ? `Avant ${fmtShortDate(dateTo)}` : "Période"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent w="260px" rounded="xl" shadow="md" borderColor="gray.100" bg="white" _focus={{ outline: "none" }}>
                  <PopoverBody p={4}>
                    <Flex direction="column" gap={3}>
                      <Box>
                        <Text fontSize="xs" fontWeight="semibold" color="gray.900" mb={1} textTransform="uppercase" letterSpacing="wider">Du</Text>
                        <Input type="date" size="sm" rounded="md" borderColor="gray.200" bg="gray.50" fontSize="sm" color="gray.900" value={dateFrom} max={dateTo || undefined} onChange={(e) => { setDateFrom(e.target.value); setPage(0); }} />
                      </Box>
                      <Box>
                        <Text fontSize="xs" fontWeight="semibold" color="gray.900" mb={1} textTransform="uppercase" letterSpacing="wider">Au</Text>
                        <Input type="date" size="sm" rounded="md" borderColor="gray.200" bg="gray.50" fontSize="sm" color="gray.900" value={dateTo} min={dateFrom || undefined} onChange={(e) => { setDateTo(e.target.value); setPage(0); }} />
                      </Box>
                      {(dateFrom || dateTo) && (
                        <Button size="xs" variant="ghost" color="gray.900" fontSize="xs" _hover={{ bg: "gray.50", color: "#1E3A5F" }} onClick={() => { setDateFrom(""); setDateTo(""); setPage(0); }}>
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
                <Input pl={8} w="240px" rounded="md" borderColor="gray.200" color="gray.900" placeholder="Rechercher un employé..." _placeholder={{ color: "gray.500" }} fontSize="sm" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
              </InputGroup>
              <IconButton aria-label="Réinitialiser" size="sm" variant="ghost" color="gray.500" _hover={{ color: "#1E3A5F" }} icon={<Box as="span" className="material-symbols-outlined" fontSize="20px" lineHeight="1">filter_list</Box>}
                onClick={() => { setStatutFilter(""); setDeptFilter(undefined); setSearchInput(""); setSearch(""); setDateFrom(""); setDateTo(""); setPage(0); }}
              />
            </Flex>
          </Flex>
        </Box>
      </Box>
      <Box bg="white" rounded="xl" borderWidth="1px" borderColor="gray.200" shadow="sm">
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
  );
}
