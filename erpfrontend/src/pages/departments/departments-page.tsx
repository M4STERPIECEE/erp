import { useState } from "react";
import {
  Box, Flex, Text, Heading, Button, SimpleGrid,
  Alert, AlertIcon, useDisclosure, useToast,
} from "@chakra-ui/react";
import { useDepartments } from "../../hooks/useDepartments";
import { deleteDepartment } from "../../services/department.service";
import type { DepartmentResponse } from "../../types/department.types";
import DepartmentCard from "./department-card";
import AddNewCard from "./add-new-card";
import SkeletonCards from "./skeleton-cards";
import DepartementFormModal from "./department-form-modal";
import ConfirmDeleteDialog from "../../components/ConfirmDeleteDialog";

export default function DepartmentsPage() {
  const { departements, isLoading, error, refresh } = useDepartments();
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const [editTarget, setEditTarget] = useState<DepartmentResponse | null>(null);

  const openCreate = () => { setEditTarget(null); onFormOpen(); };
  const openEdit = (d: DepartmentResponse) => { setEditTarget(d); onFormOpen(); };
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [deleteTarget, setDeleteTarget] = useState<DepartmentResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  const handleDelete = (d: DepartmentResponse) => { setDeleteTarget(d); onDeleteOpen(); };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteDepartment(deleteTarget.id);
      toast({ title: "Département supprimé", description: `${deleteTarget.nom} a été supprimé.`, status: "success", duration: 4000, isClosable: true, position: "top-right" });
      onDeleteClose();
      refresh();
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer ce département.", status: "error", duration: 5000, isClosable: true, position: "top-right" });
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
              Gestion des Départements
            </Heading>
            <Text color="gray.500" mt={1} fontSize="sm">
              Organisez et gérez les départements de votre entreprise.
            </Text>
          </Box>
          <Button bg="#14b8a6" color="white" px={5} py={2.5} h="auto" rounded="lg" fontSize="sm" fontWeight="medium" boxShadow="0 1px 3px 0 rgba(20,184,166,0.3)" _hover={{ bg: "#0d9488" }} _active={{ transform: "scale(0.95)" }} transition="all 0.15s" onClick={openCreate} leftIcon={
            <Box as="span" className="material-symbols-outlined" fontSize="20px" lineHeight="1">add</Box>
          }>
            Ajouter département
          </Button>
        </Flex>
        <Box borderBottomWidth="1px" borderColor="gray.200" />
        <Flex direction={{ base: "column", sm: "row" }} justify="space-between" alignItems={{ sm: "center" }} gap={4}>
          <Text color="gray.500" fontSize="sm" fontWeight="medium">
            <Text as="span" fontWeight="bold" color="gray.900">{departements.length}</Text>{" "}
            Départements actifs
          </Text>
        </Flex>
        {error && (
          <Alert status="error" rounded="xl" variant="left-accent">
            <AlertIcon />
            <Text fontSize="sm">{error}</Text>
          </Alert>
        )}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap={6}>
          {isLoading ? (
            <SkeletonCards />
          ) : (
            <>
              {departements.map((dept, index) => (
                <DepartmentCard key={dept.id} dept={dept} index={index} onEdit={openEdit} onDelete={handleDelete} />
              ))}
              <AddNewCard onClick={openCreate} />
            </>
          )}
        </SimpleGrid>
      </Box>
      {isFormOpen && (
        <DepartementFormModal
          isOpen={isFormOpen} onClose={() => { onFormClose(); setEditTarget(null); }} onSaved={refresh} editTarget={editTarget}
        />
      )}
      <ConfirmDeleteDialog title="Supprimer le département" isOpen={isDeleteOpen} onClose={onDeleteClose} onConfirm={confirmDelete} isDeleting={isDeleting}>
        <Text as="span" fontWeight="600" color="gray.900">
          {deleteTarget?.nom}
        </Text>{" "}
        ? Cette action est irréversible.
      </ConfirmDeleteDialog>
    </>
  );
}
