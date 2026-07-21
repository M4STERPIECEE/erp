import {
  Box, Flex, Text, Heading, Button, IconButton, Input, InputGroup, InputLeftElement,
  Menu, MenuButton, MenuList, MenuItem,
  Table, Thead, Tbody, Tr, Th, Td, SimpleGrid, useDisclosure,
  Skeleton, Alert, AlertIcon, Spinner,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
  useToast,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import AddEmployeeModal from "../components/AddEmployeeModal";
import ViewEmployeeModal from "../components/ViewEmployeeModal";
import EditEmployeeModal from "../components/EditEmployeeModal";
import { useEmployees } from "../hooks/useEmployees";
import { deleteEmployee } from "../services/employee.service";
import { STATUS_TYPES } from "../types/employee.types";
import type { ContractType, StatusType, EmployeeResponse } from "../types/employee.types";
import { useDepartments } from "../hooks/useDepartments";

const contratStyles: Record<ContractType, { bg: string; color: string }> = {
  CDI: { bg: "#dbeafe", color: "#1d4ed8" },
  CDD: { bg: "#ffedd5", color: "#c2410c" },
  FREELANCE: { bg: "#f3e8ff", color: "#7e22ce" },
  STAGE: { bg: "#fef9c3", color: "#a16207" },
};

const statutStyles: Record<
  StatusType,
  { bg: string; color: string; borderColor: string; dotColor: string }
> = {
  ACTIF: { bg: "#dcfce7", color: "#15803d", borderColor: "#bbf7d0", dotColor: "#22c55e" },
  INACTIF: { bg: "#f1f5f9", color: "#475569", borderColor: "#e2e8f0", dotColor: "#94a3b8" },
  SUSPENDU: { bg: "#fee2e2", color: "#b91c1c", borderColor: "#fecaca", dotColor: "#ef4444" },
};

function Cell({ value, bold }: { value: string | null | undefined; bold?: boolean }) {
  return (
    <Td px={4} py={4}>
      <Text fontSize="sm" fontWeight={bold ? "medium" : "normal"} color={bold ? "gray.900" : "gray.600"} whiteSpace="nowrap">
        {value ?? "—"}
      </Text>
    </Td>
  );
}

function ContratBadge({ type }: { type: string | null | undefined }) {
  if (!type) return <Text fontSize="sm" color="gray.400">—</Text>;
  const s = contratStyles[type as ContractType] ?? { bg: "gray.100", color: "gray.600" };
  return (
    <Box as="span" display="inline-flex" alignItems="center" px={2.5} py={0.5} borderRadius="full" fontSize="xs" fontWeight="medium" bg={s.bg} color={s.color}>
      {type}
    </Box>
  );
}

function StatutBadge({ statut }: { statut: StatusType }) {
  const s = statutStyles[statut] ?? statutStyles.ACTIF;
  return (
    <Box as="span" display="inline-flex" alignItems="center" gap={1.5} px={2.5} py={1} borderRadius="full" fontSize="xs" fontWeight="medium" bg={s.bg} color={s.color} borderWidth="1px" borderColor={s.borderColor}>
      <Box boxSize={1.5} borderRadius="full" bg={s.dotColor} flexShrink={0} />
      {statut}
    </Box>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <Tr key={i}>
          {Array.from({ length: 11 }).map((_, j) => (
            <Td key={j} px={4} py={4}><Skeleton h="16px" rounded="md" /></Td>
          ))}
        </Tr>
      ))}
    </>
  );
}

function Pagination({ page, totalPages, totalElements, size, employees, onPageChange }: {
  page: number; totalPages: number; totalElements: number; size: number;
  employees: EmployeeResponse[]; onPageChange: (p: number) => void;
}) {
  const from = totalElements === 0 ? 0 : page * size + 1;
  const to = page * size + employees.length;
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 0; i < totalPages; i++) pages.push(i);
  } else {
    pages.push(0);
    if (page > 2) pages.push("...");
    for (let i = Math.max(1, page - 1); i <= Math.min(totalPages - 2, page + 1); i++) pages.push(i);
    if (page < totalPages - 3) pages.push("...");
    pages.push(totalPages - 1);
  }

  const borderClr = "gray.200";

  return (
    <Flex px={6} py={4} borderTopWidth="1px" borderColor={borderClr} bg="rgba(248,250,252,0.5)" justify="space-between" align="center" flexWrap="wrap" gap={3}>
      <Text fontSize="sm" color="gray.500">
        Affichage de{" "}
        <Box as="span" fontWeight="medium" color="gray.900">{from}</Box>{" "}
        à{" "}
        <Box as="span" fontWeight="medium" color="gray.900">{to}</Box>{" "}
        sur{" "}
        <Box as="span" fontWeight="medium" color="gray.900">{totalElements}</Box>{" "}
        employés
      </Text>
      <Flex gap={2}>
        <Button px={3} py={1} h="auto" minW="auto" fontSize="sm" fontWeight="medium" rounded="md"
          variant="outline" borderColor="gray.300" bg="white" color="gray.500" _hover={{ bg: "gray.50" }}
          isDisabled={page === 0} onClick={() => onPageChange(page - 1)}>
          Précédent
        </Button>
        {pages.map((p, i) =>
          p === "..." ? (
            <Text key={`dots-${i}`} px={2} py={1} color="gray.500" fontSize="sm">...</Text>
          ) : (
            <Button key={p} px={3} py={1} h="auto" minW="auto" fontSize="sm" fontWeight="medium" rounded="md"
              variant="outline" borderColor="gray.300"
              bg={p === page ? "#14b8a6" : "white"}
              color={p === page ? "white" : "gray.500"}
              _hover={{ bg: p === page ? "#0d9488" : "gray.50" }}
              onClick={() => onPageChange(p)}>
              {p + 1}
            </Button>
          ),
        )}
        <Button px={3} py={1} h="auto" minW="auto" fontSize="sm" fontWeight="medium" rounded="md"
          variant="outline" borderColor="gray.300" bg="white" color="gray.500" _hover={{ bg: "gray.50" }}
          isDisabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>
          Suivant
        </Button>
      </Flex>
    </Flex>
  );
}

function DeleteDialog({ employee, isOpen, onClose, onConfirm, isDeleting }: {
  employee: EmployeeResponse | null; isOpen: boolean; onClose: () => void; onConfirm: () => void; isDeleting: boolean;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
      <AlertDialogOverlay bg="rgba(15,23,42,0.45)" backdropFilter="blur(6px)">
        <AlertDialogContent rounded="2xl" mx={4} bg="white" fontFamily="'Inter', sans-serif">
          <Box h="4px" bgGradient="linear(to-r, #dc2626, #ef4444)" />
          <AlertDialogHeader fontSize="lg" fontWeight="700" color="gray.900" pt={6}>
            Supprimer l'employé
          </AlertDialogHeader>
          <AlertDialogBody color="gray.600" fontSize="sm">
            Êtes-vous sûr de vouloir supprimer{" "}
            <Text as="span" fontWeight="600" color="gray.900">
              {employee?.prenom} {employee?.nom}
            </Text>{" "}
            ({employee?.matricule}) ? Cette action est irréversible.
          </AlertDialogBody>
          <AlertDialogFooter pb={6}>
            <Flex w="full" gap={3}>
              <Button ref={cancelRef} flex={1} h="44px" bg="gray.100" color="gray.700" fontWeight="600" fontSize="sm" rounded="xl" _hover={{ bg: "gray.200" }} onClick={onClose} isDisabled={isDeleting}>
                Annuler
              </Button>
              <Button flex={1} h="44px" bg="#dc2626" color="white" fontWeight="600" fontSize="sm" rounded="xl" _hover={{ bg: "#b91c1c" }} onClick={onConfirm} isLoading={isDeleting} spinner={<Spinner size="sm" />}>
                Supprimer
              </Button>
            </Flex>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}

export default function EmployeesPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const {
    employees, totalElements, totalPages, page, size,
    isLoading, error,
    search, departement, statut,
    setSearch, setDepartement, setStatut, setPage, refresh,
  } = useEmployees();

  const [deleteTarget, setDeleteTarget] = useState<EmployeeResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewTarget, setViewTarget] = useState<EmployeeResponse | null>(null);
  const [editTarget, setEditTarget] = useState<EmployeeResponse | null>(null);
  const toast = useToast();

  const { departements } = useDepartments();

  const deptName = (id: number | null | undefined): string => {
    if (id == null) return "—";
    return departements.find((d) => d.id === id)?.nom ?? `#${id}`;
  };

  const surface = "white";
  const borderClr = "gray.200";

  const handleDelete = (emp: EmployeeResponse) => {
    setDeleteTarget(emp);
    onDeleteOpen();
  };

  const handleView = (emp: EmployeeResponse) => {
    setViewTarget(emp);
    onViewOpen();
  };

  const handleEdit = (emp: EmployeeResponse) => {
    setEditTarget(emp);
    onEditOpen();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteEmployee(deleteTarget.id);
      toast({
        title: "Employé supprimé",
        description: `${deleteTarget.prenom} ${deleteTarget.nom} a été supprimé.`,
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
      onDeleteClose();
      refresh();
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer cet employé.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Box w="full" display="flex" flexDir="column" gap={6}>
        <Flex direction={{ base: "column", md: "row" }} align={{ md: "center" }} justify="space-between" gap={4}>
          <Box className="text-init">
            <Heading as="h1" fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="gray.900" letterSpacing="tight">
              Gestion des Employés
            </Heading>
            <Text color="gray.500" mt={1} fontSize="sm">
              Gérez les informations et les statuts de votre personnel.
            </Text>
          </Box>
          <Button bg="#14b8a6" color="white" px={5} py={2.5} h="auto" rounded="lg" fontSize="sm" fontWeight="medium" boxShadow="0 1px 3px 0 rgba(20,184,166,0.3)" _hover={{ bg: "#0d9488" }} _active={{ transform: "scale(0.95)" }} transition="all 0.15s" onClick={onOpen} leftIcon={
            <Box as="span" className="material-symbols-outlined" fontSize="20px" lineHeight="1">add</Box>
          }>
            Ajouter un employé
          </Button>
        </Flex>

        <Box borderBottomWidth="1px" borderColor="gray.200" />

        <Box bg={surface} rounded="xl" borderWidth="1px" borderColor={borderClr} shadow="sm" p={4}>
          <SimpleGrid columns={{ base: 1, md: 12 }} gap={4} alignItems="center">
            <Box gridColumn={{ md: "span 4", lg: "span 5" }}>
              <InputGroup>
                <InputLeftElement pointerEvents="none" pl={1}>
                  <Box as="span" className="material-symbols-outlined" fontSize="20px" color="gray.400" lineHeight="1">search</Box>
                </InputLeftElement>
                <Input pl={10} bg="gray.50" borderColor="gray.200" rounded="lg" fontSize="sm" placeholder="Rechercher par nom, matricule..." color="gray.900" _placeholder={{ color: "gray.400" }} _focus={{ borderColor: "#0f4c81", boxShadow: "0 0 0 3px rgba(15,76,129,0.12)" }} value={search} onChange={(e) => setSearch(e.target.value)} />
              </InputGroup>
            </Box>
            <Box gridColumn={{ md: "span 4", lg: "span 3" }}>
              <Menu matchWidth>
                <MenuButton as={Button} w="full" h="40px" bg="gray.50" borderWidth="1px" borderColor="gray.200" rounded="lg"
                  fontSize="sm" fontWeight="normal" color={departement ? "gray.900" : "gray.500"} textAlign="left"
                  _hover={{ bg: "gray.100" }} _active={{ bg: "gray.50" }} _focus={{ borderColor: "#0f4c81", boxShadow: "0 0 0 3px rgba(15,76,129,0.12)" }}
                  rightIcon={<Box as="span" className="material-symbols-outlined" fontSize="20px" color="gray.400" lineHeight="1">keyboard_arrow_down</Box>}>
                  {departement ? (departements.find((d) => d.id === departement)?.nom ?? "Département") : "Tous les départements"}
                </MenuButton>
                <MenuList rounded="xl" shadow="lg" borderColor="gray.200" p={2} bg="white" minW="0">
                  <MenuItem rounded="lg" fontSize="sm" color="gray.700"
                    bg={!departement ? "teal.50" : "transparent"} fontWeight={!departement ? "600" : "normal"}
                    _hover={{ bg: "gray.100" }} onClick={() => setDepartement(undefined)}>
                    Tous les départements
                  </MenuItem>
                  {departements.map((d) => (
                    <MenuItem key={d.id} rounded="lg" fontSize="sm" color="gray.700"
                      bg={departement === d.id ? "teal.50" : "transparent"} fontWeight={departement === d.id ? "600" : "normal"}
                      _hover={{ bg: "gray.100" }} onClick={() => setDepartement(d.id)}>
                      {d.nom}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </Box>
            <Box gridColumn={{ md: "span 4", lg: "span 3" }}>
              <Menu matchWidth>
                <MenuButton as={Button} w="full" h="40px" bg="gray.50" borderWidth="1px" borderColor="gray.200" rounded="lg"
                  fontSize="sm" fontWeight="normal" color={statut ? "gray.900" : "gray.500"} textAlign="left"
                  _hover={{ bg: "gray.100" }} _active={{ bg: "gray.50" }} _focus={{ borderColor: "#0f4c81", boxShadow: "0 0 0 3px rgba(15,76,129,0.12)" }}
                  rightIcon={<Box as="span" className="material-symbols-outlined" fontSize="20px" color="gray.400" lineHeight="1">keyboard_arrow_down</Box>}>
                  {statut || "Tous les statuts"}
                </MenuButton>
                <MenuList rounded="xl" shadow="lg" borderColor="gray.200" p={2} bg="white" minW="0">
                  <MenuItem rounded="lg" fontSize="sm" color="gray.700"
                    bg={!statut ? "teal.50" : "transparent"} fontWeight={!statut ? "600" : "normal"}
                    _hover={{ bg: "gray.100" }} onClick={() => setStatut("")}>
                    Tous les statuts
                  </MenuItem>
                  {STATUS_TYPES.map((s) => (
                    <MenuItem key={s} rounded="lg" fontSize="sm" color="gray.700"
                      bg={statut === s ? "teal.50" : "transparent"} fontWeight={statut === s ? "600" : "normal"}
                      _hover={{ bg: "gray.100" }} onClick={() => setStatut(s)}>
                      {s}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </Box>
            <Flex gridColumn={{ md: "span 12", lg: "span 1" }} justify={{ base: "flex-end", lg: "center" }}>
              <IconButton aria-label="Filtres avancés" icon={<Box as="span" className="material-symbols-outlined" lineHeight="1">filter_list</Box>} variant="outline" borderColor="gray.200" color="gray.600" bg="white" rounded="lg" boxSize="42px" minW="42px" _hover={{ bg: "gray.50" }} />
            </Flex>
          </SimpleGrid>
        </Box>

        {error && (
          <Alert status="error" rounded="xl" variant="left-accent">
            <AlertIcon />
            <Text fontSize="sm">{error}</Text>
          </Alert>
        )}

        <Box bg={surface} rounded="xl" borderWidth="1px" borderColor={borderClr} shadow="sm" overflow="hidden">
          <Box overflowX="auto">
            <Table variant="unstyled" size="md">
              <Thead bg="rgba(248,250,252,0.8)">
                <Tr borderBottomWidth="1px" borderColor={borderClr}>
                  {["Matricule", "Nom", "Prénom", "Email", "Téléphone", "Poste", "Date embauche", "Département", "Contrat", "Statut", "Actions"].map((h, i) => (
                    <Th key={h} px={4} py={4} fontSize="xs" textTransform="uppercase" fontWeight="semibold" color="gray.500" letterSpacing="wider" textAlign={i === 10 ? "right" : "left"} whiteSpace="nowrap">
                      {h}
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {isLoading ? (
                  <SkeletonRows />
                ) : employees.length === 0 ? (
                  <Tr>
                    <Td colSpan={11} textAlign="center" py={12}>
                      <Box display="flex" flexDir="column" alignItems="center" gap={2}>
                        <Box as="span" className="material-symbols-outlined" fontSize="48px" color="gray.300" lineHeight="1">group_off</Box>
                        <Text fontSize="sm" color="gray.500">Aucun employé trouvé.</Text>
                      </Box>
                    </Td>
                  </Tr>
                ) : (
                  employees.map((emp) => (
                    <Tr key={emp.id} borderBottomWidth="1px" borderColor={borderClr} _hover={{ bg: "gray.50" }} transition="background 0.15s">
                      <Cell value={emp.matricule} bold />
                      <Cell value={emp.nom} bold />
                      <Cell value={emp.prenom} />
                      <Cell value={emp.email} />
                      <Cell value={emp.telephone} />
                      <Cell value={emp.poste} />
                      <Cell value={emp.dateEmbauche} />
                      <Cell value={deptName(emp.departementId)} />
                      <Td px={4} py={4}><ContratBadge type={emp.contractType} /></Td>
                      <Td px={4} py={4}><StatutBadge statut={emp.statut} /></Td>
                      <Td px={4} py={4} textAlign="right">
                        <Flex alignItems="center" justifyContent="flex-end" gap={1}>
                          <IconButton aria-label="Voir" variant="ghost" size="sm" rounded="md" color="gray.500" _hover={{ bg: "gray.100", color: "#0f4c81" }}
                            icon={<Box as="span" className="material-symbols-outlined" fontSize="20px" lineHeight="1">visibility</Box>}
                            onClick={() => handleView(emp)} />
                          <IconButton aria-label="Modifier" variant="ghost" size="sm" rounded="md" color="gray.500" _hover={{ bg: "gray.100", color: "#2563eb" }}
                            icon={<Box as="span" className="material-symbols-outlined" fontSize="20px" lineHeight="1">edit</Box>}
                            onClick={() => handleEdit(emp)} />
                          <IconButton aria-label="Supprimer" variant="ghost" size="sm" rounded="md" color="gray.500" _hover={{ bg: "gray.100", color: "#dc2626" }}
                            icon={<Box as="span" className="material-symbols-outlined" fontSize="20px" lineHeight="1">delete</Box>}
                            onClick={() => handleDelete(emp)} />
                        </Flex>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
          {!isLoading && totalElements > 0 && (
            <Pagination page={page} totalPages={totalPages} totalElements={totalElements} size={size} employees={employees} onPageChange={setPage} />
          )}
        </Box>
      </Box>

      <AddEmployeeModal isOpen={isOpen} onClose={onClose} onCreated={refresh} />
      <DeleteDialog employee={deleteTarget} isOpen={isDeleteOpen} onClose={onDeleteClose} onConfirm={confirmDelete} isDeleting={isDeleting} />
      <ViewEmployeeModal employee={viewTarget} isOpen={isViewOpen} onClose={onViewClose} />
      <EditEmployeeModal employee={editTarget} isOpen={isEditOpen} onClose={onEditClose} onUpdated={refresh} />
    </>
  );
}