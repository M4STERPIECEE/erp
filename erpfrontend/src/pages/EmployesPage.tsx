import { useState } from "react";
import {
  Box, Flex, Text, Heading, Button, IconButton, Input, InputGroup, InputLeftElement,
  Select, Table, Thead, Tbody, Tr, Th, Td, SimpleGrid, useDisclosure,
} from "@chakra-ui/react";
import Sidebar from "../components/Sidebar";
import AddEmployeeModal from "../components/AddEmployeeModal";

type ContratType = "CDI" | "CDD" | "STAGE" | "FREELANCE";
type StatutType = "ACTIF" | "INACTIF" | "SUSPENDU";

interface Employee {
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  poste: string;
  date_embauche: string;
  departement: string;
  contrat: ContratType;
  statut: StatutType;
}

const employees: Employee[] = [
  {
    matricule: "EMP-001",
    nom: "Martin",
    prenom: "Sophie",
    email: "sophie.m@xyz.com",
    telephone: "+33 6 12 34 56 78",
    poste: "Développeuse Senior",
    date_embauche: "2021-03-15",
    departement: "Informatique",
    contrat: "CDI",
    statut: "ACTIF",
  },
  {
    matricule: "EMP-002",
    nom: "Dubois",
    prenom: "Jean",
    email: "jean.d@xyz.com",
    telephone: "+33 6 23 45 67 89",
    poste: "Responsable RH",
    date_embauche: "2019-07-01",
    departement: "Ressources Humaines",
    contrat: "CDI",
    statut: "ACTIF",
  },
  {
    matricule: "EMP-003",
    nom: "Leroi",
    prenom: "Marie",
    email: "marie.l@xyz.com",
    telephone: "+33 7 34 56 78 90",
    poste: "Designer UI/UX",
    date_embauche: "2023-01-10",
    departement: "Marketing",
    contrat: "FREELANCE",
    statut: "INACTIF",
  },
  {
    matricule: "EMP-004",
    nom: "Petit",
    prenom: "Thomas",
    email: "thomas.p@xyz.com",
    telephone: "+33 6 45 67 89 01",
    poste: "Analyste Financier",
    date_embauche: "2022-09-05",
    departement: "Finance",
    contrat: "CDD",
    statut: "SUSPENDU",
  },
  {
    matricule: "EMP-005",
    nom: "Cohen",
    prenom: "Sarah",
    email: "sarah.c@xyz.com",
    telephone: "+33 6 56 78 90 12",
    poste: "Consultante IT",
    date_embauche: "2020-11-20",
    departement: "Informatique",
    contrat: "CDI",
    statut: "ACTIF",
  },
];


const contratStyles: Record<ContratType, { bg: string; color: string }> = {
  CDI:      { bg: "#dbeafe", color: "#1d4ed8" },
  CDD:      { bg: "#ffedd5", color: "#c2410c" },
  FREELANCE:{ bg: "#f3e8ff", color: "#7e22ce" },
  STAGE:    { bg: "#fef9c3", color: "#a16207" },
};

const statutStyles: Record<
  StatutType,
  { bg: string; color: string; borderColor: string; dotColor: string }
> = {
  ACTIF:    { bg: "#dcfce7", color: "#15803d", borderColor: "#bbf7d0", dotColor: "#22c55e" },
  INACTIF:  { bg: "#f1f5f9", color: "#475569", borderColor: "#e2e8f0", dotColor: "#94a3b8" },
  SUSPENDU: { bg: "#fee2e2", color: "#b91c1c", borderColor: "#fecaca", dotColor: "#ef4444" },
};

function Cell({ value, bold }: { value: string; bold?: boolean }) {
  return (
    <Td px={4} py={4}>
      <Text fontSize="sm" fontWeight={bold ? "medium" : "normal"} color={bold ? "gray.900" : "gray.600"} whiteSpace="nowrap">
        {value}
      </Text>
    </Td>
  );
}

const actionButtons = [
  { label: "Voir",      icon: "visibility", hoverColor: "#0f4c81" },
  { label: "Modifier",  icon: "edit",       hoverColor: "#2563eb" },
  { label: "Supprimer", icon: "delete",     hoverColor: "#dc2626" },
];

function ContratBadge({ type }: { type: ContratType }) {
  const s = contratStyles[type];
  return (
    <Box as="span" display="inline-flex" alignItems="center" px={2.5} py={0.5} borderRadius="full" fontSize="xs" fontWeight="medium" bg={s.bg} color={s.color}>
      {type}
    </Box>
  );
}

function StatutBadge({ statut }: { statut: StatutType }) {
  const s = statutStyles[statut];
  return (
    <Box as="span" display="inline-flex" alignItems="center" gap={1.5} px={2.5} py={1} borderRadius="full" fontSize="xs" fontWeight="medium" bg={s.bg} color={s.color} borderWidth="1px" borderColor={s.borderColor}>
      <Box boxSize={1.5} borderRadius="full" bg={s.dotColor} flexShrink={0} />
      {statut}
    </Box>
  );
}

export default function EmployesPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bgPage    = "#f8fafc";
  const surface   = "white";
  const borderClr = "gray.200";

  const [search, setSearch]   = useState("");
  const [dept, setDept]       = useState("");
  const [statut, setStatut]   = useState("");

  const filtered = employees.filter((e) => {
    const fullName = `${e.prenom} ${e.nom}`.toLowerCase();
    const matchSearch =
      search === "" ||
      fullName.includes(search.toLowerCase()) ||
      e.matricule.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase());
    const matchDept   = dept   === "" || e.departement === dept;
    const matchStatut = statut === "" || e.statut === statut;
    return matchSearch && matchDept && matchStatut;
  });

  return (
    <Flex h="100vh" w="full" overflow="hidden" fontFamily="'Inter', sans-serif">
      <Sidebar activePage="employes" />
      <Box as="main" flex={1} h="full" overflowY="auto" bg={bgPage} p={{ base: 4, lg: 8 }} sx={{ "&::-webkit-scrollbar":       { width: "8px", height: "8px" }, "&::-webkit-scrollbar-track": { background: "transparent" }, "&::-webkit-scrollbar-thumb": { background: "#cbd5e1", borderRadius: "4px" }, "&::-webkit-scrollbar-thumb:hover": { background: "#94a3b8" },  }}>
        <Box w="full" display="flex" flexDir="column" gap={6}>
          <Flex direction={{ base: "column", md: "row" }} align={{ md: "center" }} justify="space-between" gap={4}>
            <Box>
              <Heading as="h1" fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="gray.900" letterSpacing="tight" >
                Gestion des Employés
              </Heading>
              <Text color="gray.500" mt={1} fontSize="sm">
                Gérez les informations et les statuts de votre personnel.
              </Text>
            </Box>
            <Button bg="#14b8a6" color="white" px={5} py={2.5} h="auto" rounded="lg" fontSize="sm" fontWeight="medium" boxShadow="0 1px 3px 0 rgba(20,184,166,0.3)" _hover={{ bg: "#0d9488" }} _active={{ transform: "scale(0.95)" }} transition="all 0.15s" onClick={onOpen} leftIcon={
                <Box as="span" className="material-symbols-outlined" fontSize="20px" lineHeight="1">
                  add
                </Box>  }>
              Ajouter un employé
            </Button>
          </Flex>
          <Box bg={surface} rounded="xl" borderWidth="1px" borderColor={borderClr} shadow="sm" p={4}>
            <SimpleGrid columns={{ base: 1, md: 12 }} gap={4} alignItems="center">
              <Box gridColumn={{ md: "span 4", lg: "span 5" }}>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" pl={1}>
                    <Box as="span" className="material-symbols-outlined" fontSize="20px" color="gray.400" lineHeight="1" >
                      search
                    </Box>
                  </InputLeftElement>
                  <Input pl={10} bg="gray.50" borderColor="gray.200" rounded="lg" fontSize="sm" placeholder="Rechercher par nom, matricule..." color="gray.900" _placeholder={{ color: "gray.400" }} _focus={{ borderColor: "#0f4c81", boxShadow: "0 0 0 3px rgba(15,76,129,0.12)" }} value={search} onChange={(e) => setSearch(e.target.value)} />
                </InputGroup>
              </Box>
              <Box gridColumn={{ md: "span 4", lg: "span 3" }} position="relative">
                <Select bg="gray.50" borderColor="gray.200" rounded="lg" fontSize="sm" color="gray.900" pr={10} iconSize="0" _focus={{ borderColor: "#0f4c81", boxShadow: "0 0 0 3px rgba(15,76,129,0.12)" }} value={dept} onChange={(e) => setDept(e.target.value)}>
                  <option value="">Tous les départements</option>
                  <option value="Informatique">Informatique</option>
                  <option value="Ressources Humaines">Ressources Humaines</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                </Select>
                <Box as="span" className="material-symbols-outlined" position="absolute" right={3} top="50%" transform="translateY(-50%)" fontSize="20px" color="gray.400" lineHeight="1" pointerEvents="none">
                  keyboard_arrow_down
                </Box>
              </Box>
              <Box gridColumn={{ md: "span 4", lg: "span 3" }} position="relative">
                <Select bg="gray.50" borderColor="gray.200" rounded="lg" fontSize="sm" color="gray.900" pr={10} iconSize="0" _focus={{ borderColor: "#0f4c81", boxShadow: "0 0 0 3px rgba(15,76,129,0.12)" }} value={statut} onChange={(e) => setStatut(e.target.value)}>
                  <option value="">Tous les statuts</option>
                  <option value="ACTIF">Actif</option>
                  <option value="INACTIF">Inactif</option>
                  <option value="SUSPENDU">Suspendu</option>
                </Select>
                <Box as="span" className="material-symbols-outlined" position="absolute" right={3} top="50%" transform="translateY(-50%)" fontSize="20px" color="gray.400" lineHeight="1" pointerEvents="none">
                  keyboard_arrow_down
                </Box>
              </Box>
              <Flex gridColumn={{ md: "span 12", lg: "span 1" }}  justify={{ base: "flex-end", lg: "center" }} >
                <IconButton
                  aria-label="Filtres avancés"
                  icon={
                    <Box as="span" className="material-symbols-outlined" lineHeight="1">
                      filter_list
                    </Box>
                  }
                  variant="outline"
                  borderColor="gray.200"
                  color="gray.600"
                  bg="white"
                  rounded="lg" boxSize="42px" minW="42px" _hover={{ bg: "gray.50" }}/>
              </Flex>
            </SimpleGrid>
          </Box>
          <Box bg={surface} rounded="xl" borderWidth="1px" borderColor={borderClr} shadow="sm" overflow="hidden">
            <Box overflowX="auto">
              <Table variant="unstyled" size="md">
                <Thead bg="rgba(248,250,252,0.8)">
                  <Tr borderBottomWidth="1px" borderColor={borderClr}>
                    {[
                      "Matricule",
                      "Nom",
                      "Prénom",
                      "Email",
                      "Téléphone",
                      "Poste",
                      "Date embauche",
                      "Département",
                      "Contrat",
                      "Statut",
                      "Actions",
                    ].map((h, i) => (
                      <Th key={h} px={4} py={4} fontSize="xs" textTransform="uppercase" fontWeight="semibold" color="gray.500" letterSpacing="wider" textAlign={i === 10 ? "right" : "left"} whiteSpace="nowrap">
                        {h}
                      </Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {filtered.map((emp) => (
                    <Tr key={emp.matricule} borderBottomWidth="1px" borderColor={borderClr} _hover={{ bg: "gray.50" }} transition="background 0.15s">
                      <Cell value={emp.matricule} bold />
                      <Cell value={emp.nom} bold />
                      <Cell value={emp.prenom} />
                      <Cell value={emp.email} />
                      <Cell value={emp.telephone} />
                      <Cell value={emp.poste} />
                      <Cell value={emp.date_embauche} />
                      <Cell value={emp.departement} />
                      <Td px={4} py={4}><ContratBadge type={emp.contrat} /></Td>
                      <Td px={4} py={4}><StatutBadge statut={emp.statut} /></Td>
                      <Td px={4} py={4} textAlign="right">
                        <Flex alignItems="center" justifyContent="flex-end" gap={1}>
                          {actionButtons.map(({ label, icon, hoverColor }) => (
                            <IconButton key={label} aria-label={label} variant="ghost" size="sm" rounded="md" color="gray.500" _hover={{ bg: "gray.100", color: hoverColor }}
                              icon={<Box as="span" className="material-symbols-outlined" fontSize="20px" lineHeight="1">{icon}</Box>}
                            />
                          ))}
                        </Flex>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
            <Flex px={6} py={4} borderTopWidth="1px" borderColor={borderClr} bg="rgba(248,250,252,0.5)" justify="space-between" align="center" flexWrap="wrap" gap={3} >
              <Text fontSize="sm" color="gray.500">
                Affichage de{" "}
                <Box as="span" fontWeight="medium" color="gray.900">
                  1
                </Box>{" "}
                à{" "}
                <Box as="span" fontWeight="medium" color="gray.900">
                  {filtered.length}
                </Box>{" "}
                sur{" "}
                <Box as="span" fontWeight="medium" color="gray.900">
                  {employees.length}
                </Box>{" "}
                employés
              </Text>
              <Flex gap={2}>
                {["Précédent", "1", "2", "3", "Suivant"].map((label, i) => (
                  <Box key={i}>
                    {label === "..." ? (
                      <Text px={2} py={1} color="gray.500" fontSize="sm">
                        ...
                      </Text>
                    ) : (
                      <Button px={3} py={1} h="auto" minW="auto" fontSize="sm" fontWeight="medium" rounded="md" variant="outline" borderColor="gray.300" bg="white" color={label === "1" ? "gray.900" : "gray.500"} _hover={{ bg: "gray.50" }}  isDisabled={label === "Précédent"}>
                        {label}
                      </Button>
                    )}
                  </Box>
                ))}
              </Flex>
            </Flex>
          </Box>

        </Box>
      </Box>
      <AddEmployeeModal isOpen={isOpen} onClose={onClose} />
    </Flex>
  );
}
