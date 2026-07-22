import { useState } from "react";
import {
  Box, Flex, Text, Heading, Button, IconButton, Input, InputGroup, InputLeftElement,
  Menu, MenuButton, MenuList, MenuItem,
  Table, Thead, Tbody, Tr, Th, Td, SimpleGrid, useDisclosure,
  Alert, AlertIcon,
  useToast,
} from "@chakra-ui/react";
import AddEmployeeModal from "../../components/AddEmployeeModal";
import ViewEmployeeModal from "../../components/ViewEmployeeModal";
import EditEmployeeModal from "../../components/EditEmployeeModal";
import { useEmployees } from "../../hooks/useEmployees";
import { deleteEmployee } from "../../services/employee.service";
import { STATUS_TYPES } from "../../types/employee.types";
import type { EmployeeResponse } from "../../types/employee.types";
import { useDepartments } from "../../hooks/useDepartments";
import Cell from "./cell";
import ContratBadge from "./contrats";
import StatutBadge from "./statuts";
import SkeletonRows from "./skeleton-rows";
import Pagination from "../../components/Pagination";
import ConfirmDeleteDialog from "../../components/ConfirmDeleteDialog";

export default function EmployeesPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

  const { employees, totalElements, totalPages, page, size, isLoading, error, search, departement, statut, setSearch, setDepartement, setStatut, setPage, refresh } = useEmployees();

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

  const handleDelete = (emp: EmployeeResponse) => { setDeleteTarget(emp); onDeleteOpen(); };
  const handleView = (emp: EmployeeResponse) => { setViewTarget(emp); onViewOpen(); };
  const handleEdit = (emp: EmployeeResponse) => { setEditTarget(emp); onEditOpen(); };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteEmployee(deleteTarget.id);
      toast({ title: "Employé supprimé", description: `${deleteTarget.prenom} ${deleteTarget.nom} a été supprimé.`, status: "success", duration: 4000, isClosable: true, position: "top-right" });
      onDeleteClose();
      refresh();
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer cet employé.", status: "error", duration: 5000, isClosable: true, position: "top-right" });
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
                <MenuButton as={Button} w="full" h="40px" bg="gray.50" borderWidth="1px" borderColor="gray.200" rounded="lg" fontSize="sm" fontWeight="normal" color={departement ? "gray.900" : "gray.500"} textAlign="left" _hover={{ bg: "gray.100" }} _active={{ bg: "gray.50" }} _focus={{ borderColor: "#0f4c81", boxShadow: "0 0 0 3px rgba(15,76,129,0.12)" }} rightIcon={<Box as="span" className="material-symbols-outlined" fontSize="20px" color="gray.400" lineHeight="1">keyboard_arrow_down</Box>}>
                  {departement ? (departements.find((d) => d.id === departement)?.nom ?? "Département") : "Tous les départements"}
                </MenuButton>
                <MenuList rounded="xl" shadow="lg" borderColor="gray.200" p={2} bg="white" minW="0">
                  <MenuItem rounded="lg" fontSize="sm" color="gray.700" bg={!departement ? "teal.50" : "transparent"} fontWeight={!departement ? "600" : "normal"} _hover={{ bg: "gray.100" }} onClick={() => setDepartement(undefined)}>
                    Tous les départements
                  </MenuItem>
                  {departements.map((d) => (
                    <MenuItem key={d.id} rounded="lg" fontSize="sm" color="gray.700" bg={departement === d.id ? "teal.50" : "transparent"} fontWeight={departement === d.id ? "600" : "normal"} _hover={{ bg: "gray.100" }} onClick={() => setDepartement(d.id)}>
                      {d.nom}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </Box>
            <Box gridColumn={{ md: "span 4", lg: "span 3" }}>
              <Menu matchWidth>
                <MenuButton as={Button} w="full" h="40px" bg="gray.50" borderWidth="1px" borderColor="gray.200" rounded="lg" fontSize="sm" fontWeight="normal" color={statut ? "gray.900" : "gray.500"} textAlign="left" _hover={{ bg: "gray.100" }} _active={{ bg: "gray.50" }} _focus={{ borderColor: "#0f4c81", boxShadow: "0 0 0 3px rgba(15,76,129,0.12)" }} rightIcon={<Box as="span" className="material-symbols-outlined" fontSize="20px" color="gray.400" lineHeight="1">keyboard_arrow_down</Box>}>
                  {statut || "Tous les statuts"}
                </MenuButton>
                <MenuList rounded="xl" shadow="lg" borderColor="gray.200" p={2} bg="white" minW="0">
                  <MenuItem rounded="lg" fontSize="sm" color="gray.700" bg={!statut ? "teal.50" : "transparent"} fontWeight={!statut ? "600" : "normal"} _hover={{ bg: "gray.100" }} onClick={() => setStatut("")}>
                    Tous les statuts
                  </MenuItem>
                  {STATUS_TYPES.map((s) => (
                    <MenuItem key={s} rounded="lg" fontSize="sm" color="gray.700" bg={statut === s ? "teal.50" : "transparent"} fontWeight={statut === s ? "600" : "normal"} _hover={{ bg: "gray.100" }} onClick={() => setStatut(s)}>
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
                          <IconButton aria-label="Voir" variant="ghost" size="sm" rounded="md" color="gray.500" _hover={{ bg: "gray.100", color: "#0f4c81" }} icon={<Box as="span" className="material-symbols-outlined" fontSize="20px" lineHeight="1">visibility</Box>} onClick={() => handleView(emp)} />
                          <IconButton aria-label="Modifier" variant="ghost" size="sm" rounded="md" color="gray.500" _hover={{ bg: "gray.100", color: "#2563eb" }} icon={<Box as="span" className="material-symbols-outlined" fontSize="20px" lineHeight="1">edit</Box>} onClick={() => handleEdit(emp)} />
                          <IconButton aria-label="Supprimer" variant="ghost" size="sm" rounded="md" color="gray.500" _hover={{ bg: "gray.100", color: "#dc2626" }} icon={<Box as="span" className="material-symbols-outlined" fontSize="20px" lineHeight="1">delete</Box>} onClick={() => handleDelete(emp)} />
                        </Flex>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
          {!isLoading && (
            <Pagination page={page} totalPages={totalPages} totalElements={totalElements} pageSize={size} currentElements={employees.length} onPageChange={setPage} label="employés" />
          )}
        </Box>
      </Box>
      <AddEmployeeModal isOpen={isOpen} onClose={onClose} onCreated={refresh} />
      <ConfirmDeleteDialog title="Supprimer l'employé" isOpen={isDeleteOpen} onClose={onDeleteClose} onConfirm={confirmDelete} isDeleting={isDeleting}>
        <Text as="span" fontWeight="600" color="gray.900">
          {deleteTarget?.prenom} {deleteTarget?.nom}
        </Text>{" "}
        ({deleteTarget?.matricule}) ? Cette action est irréversible.
      </ConfirmDeleteDialog>
      <ViewEmployeeModal employee={viewTarget} isOpen={isViewOpen} onClose={onViewClose} />
      <EditEmployeeModal employee={editTarget} isOpen={isEditOpen} onClose={onEditClose} onUpdated={refresh} />
    </>
  );
}
