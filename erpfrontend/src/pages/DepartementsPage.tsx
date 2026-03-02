import {
  Box, Flex, Text, Heading, Button, IconButton, SimpleGrid, Skeleton,
  Alert, AlertIcon, Spinner, useDisclosure, useToast,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  FormControl, FormLabel, Input, Textarea, Select,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Sidebar from "../components/Sidebar";
import { useDepartements } from "../hooks/useDepartements";
import { createDepartement, updateDepartement, deleteDepartement } from "../services/departement.service";
import { getEmployes } from "../services/employe.service";
import type { EmployeeResponse } from "../types/employe.types";
import type { DepartementResponse, CreateDepartementRequest } from "../types/departement.types";

const CARD_THEMES = [
  { gradient: "linear(to-r, #3b82f6, #5c799d)", iconBg: "#eff6ff", iconColor: "#5c799d", icon: "groups" },
  { gradient: "linear(to-r, #a855f7, #6366f1)", iconBg: "#faf5ff", iconColor: "#9333ea", icon: "developer_mode" },
  { gradient: "linear(to-r, #10b981, #14b8a6)", iconBg: "#ecfdf5", iconColor: "#059669", icon: "attach_money" },
  { gradient: "linear(to-r, #f97316, #f59e0b)", iconBg: "#fff7ed", iconColor: "#ea580c", icon: "campaign" },
  { gradient: "linear(to-r, #ec4899, #f43e5e)", iconBg: "#fdf2f8", iconColor: "#db2777", icon: "support_agent" },
  { gradient: "linear(to-r, #06b6d4, #3b82f6)", iconBg: "#ecfeff", iconColor: "#0891b2", icon: "local_shipping" },
  { gradient: "linear(to-r, #8b5cf6, #a78bfa)", iconBg: "#f5f3ff", iconColor: "#7c3aed", icon: "school" },
  { gradient: "linear(to-r, #ef4444, #f97316)", iconBg: "#fef2f2", iconColor: "#dc2626", icon: "gavel" },
];

function getTheme(index: number) {
  return CARD_THEMES[index % CARD_THEMES.length];
}

function DepartmentCard({
  dept, index, onEdit, onDelete,
}: {
  dept: DepartementResponse; index: number;
  onEdit: (d: DepartementResponse) => void;
  onDelete: (d: DepartementResponse) => void;
}) {
  const theme = getTheme(index);

  return (
    <Box
      role="group"
      position="relative"
      display="flex" flexDir="column"
      bg="white" rounded="xl"
      shadow="sm" borderWidth="1px" borderColor="gray.200"
      _hover={{ shadow: "md" }}
      transition="all 0.2s"
      overflow="hidden"
    >
      <Box
        h="96px" w="full"
        position="absolute" top={0} left={0} zIndex={0}
        bgGradient={theme.gradient}
        opacity={0.1}
      />
      <Box p={5} zIndex={10} display="flex" flexDir="column" h="full">
        <Flex justify="space-between" alignItems="flex-start" mb={4}>
          <Flex
            w={12} h={12} rounded="lg"
            bg={theme.iconBg}
            alignItems="center" justifyContent="center"
          >
            <Box as="span" className="material-symbols-outlined" fontSize="30px" color={theme.iconColor} lineHeight="1">
              {theme.icon}
            </Box>
          </Flex>

          <Flex gap={1} opacity={0} _groupHover={{ opacity: 1 }} transition="opacity 0.2s">
            <IconButton
              aria-label="Modifier"
              icon={<Box as="span" className="material-symbols-outlined" fontSize="18px" lineHeight="1">edit</Box>}
              variant="ghost" size="sm" rounded="full"
              color="gray.500"
              _hover={{ bg: "gray.100", color: "#5c799d" }}
              onClick={() => onEdit(dept)}
            />
            <IconButton
              aria-label="Supprimer"
              icon={<Box as="span" className="material-symbols-outlined" fontSize="18px" lineHeight="1">delete</Box>}
              variant="ghost" size="sm" rounded="full"
              color="gray.500"
              _hover={{ bg: "red.50", color: "red.500" }}
              onClick={() => onDelete(dept)}
            />
          </Flex>
        </Flex>
        <Text fontSize="lg" fontWeight="bold" color="gray.900" mb={1}>
          {dept.nom}
        </Text>
        <Text fontSize="sm" color="gray.500" mb={6} noOfLines={2}>
          {dept.description ?? "Aucune description."}
        </Text>
        <Box mt="auto" pt={4} borderTopWidth="1px" borderColor="gray.100">
          <Flex justify="space-between" mb={2}>
            <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" color="gray.400">
              Manager
            </Text>
            <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" color="gray.400">
              Employés
            </Text>
          </Flex>
          <Flex justify="space-between" alignItems="center">
            <Flex alignItems="center" gap={2}>
              <Flex
                boxSize={6} rounded="full"
                bg="gray.200"
                alignItems="center" justifyContent="center"
                fontSize="9px" fontWeight="bold" color="gray.600"
              >
                {dept.responsableNom ? dept.responsableNom.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "—"}
              </Flex>
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                {dept.responsableNom ?? "Non assigné"}
              </Text>
            </Flex>
            <Box
              display="inline-flex" alignItems="center" justifyContent="center"
              px={2.5} py={0.5} rounded="full"
              fontSize="xs" fontWeight="medium"
              bg="gray.100" color="gray.800"
            >
              {dept.nombreEmployes}
            </Box>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}
function AddNewCard({ onClick }: { onClick: () => void }) {
  return (
    <Box role="group" as="button" display="flex" flexDir="column" alignItems="center" justifyContent="center" bg="gray.50" rounded="xl" borderWidth="2px" borderStyle="dashed" borderColor="gray.300" _hover={{ borderColor: "#14b8a6", bg: "rgba(20,184,166,0.04)" }} transition="all 0.2s" minH="260px" cursor="pointer" onClick={onClick}>
      <Flex w={16} h={16} rounded="full" bg="gray.100" _groupHover={{ bg: "rgba(20,184,166,0.15)", color: "teal.600" }} alignItems="center" justifyContent="center" color="gray.400" transition="all 0.2s" mb={4}>
        <Box as="span" className="material-symbols-outlined" fontSize="36px" lineHeight="1"
          color="gray.400" _groupHover={{ color: "#0d9488" }}>
          add
        </Box>
      </Flex>
      <Text fontSize="lg" fontWeight="medium" color="gray.600" _groupHover={{ color: "#0f766e" }}>
        Nouveau département
      </Text>
    </Box>
  );
}
function SkeletonCards() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <Box key={i} bg="white" rounded="xl" borderWidth="1px" borderColor="gray.200" p={5}>
          <Flex justify="space-between" mb={4}>
            <Skeleton boxSize={12} rounded="lg" />
            <Flex gap={1}>
              <Skeleton boxSize={8} rounded="full" />
              <Skeleton boxSize={8} rounded="full" />
            </Flex>
          </Flex>
          <Skeleton h="20px" w="60%" rounded="md" mb={2} />
          <Skeleton h="14px" w="90%" rounded="md" mb={1} />
          <Skeleton h="14px" w="70%" rounded="md" mb={6} />
          <Box pt={4} borderTopWidth="1px" borderColor="gray.100">
            <Flex justify="space-between">
              <Skeleton h="14px" w="40%" rounded="md" />
              <Skeleton h="20px" w="30px" rounded="full" />
            </Flex>
          </Box>
        </Box>
      ))}
    </>
  );
}

function DepartementFormModal({
  isOpen, onClose, onSaved, editTarget,
}: {
  isOpen: boolean; onClose: () => void; onSaved: () => void;
  editTarget: DepartementResponse | null;
}) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<CreateDepartementRequest>({
    defaultValues: editTarget
      ? { nom: editTarget.nom, description: editTarget.description ?? "", responsableId: editTarget.responsableId ?? undefined }
      : { nom: "", description: "", responsableId: undefined },
  });
  const toast = useToast();
  const [employes, setEmployes] = useState<EmployeeResponse[]>([]);

  useEffect(() => {
    getEmployes({ size: 500 }).then(
      (res) => setEmployes(res.content),
      () => { /* ignore */ },
    );
  }, []);

  const onSubmit = async (values: CreateDepartementRequest) => {
    const payload: CreateDepartementRequest = {
      ...values,
      responsableId: values.responsableId ? Number(values.responsableId) : null,
    };
    try {
      if (editTarget) {
        await updateDepartement(editTarget.id, payload);
        toast({ title: "Département modifié", status: "success", duration: 3000, isClosable: true, position: "top-right" });
      } else {
        await createDepartement(payload);
        toast({ title: "Département créé", status: "success", duration: 3000, isClosable: true, position: "top-right" });
      }
      reset();
      onClose();
      onSaved();
    } catch {
      toast({ title: "Erreur", description: "Impossible de sauvegarder le département.", status: "error", duration: 5000, isClosable: true, position: "top-right" });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md" closeOnOverlayClick={false}>
      <ModalOverlay bg="rgba(15,23,42,0.45)" backdropFilter="blur(6px)" />
      <ModalContent rounded="2xl" mx={4} bg="white" fontFamily="'Inter', sans-serif" overflow="hidden">
        <Box h="4px" bgGradient="linear(to-r, #14b8a6, #0d9488)" />
        <ModalHeader fontSize="lg" fontWeight="700" color="gray.900" pt={6}>
          {editTarget ? "Modifier le département" : "Nouveau département"}
        </ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody display="flex" flexDir="column" gap={4}>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">Nom</FormLabel>
              <Input {...register("nom", { required: true })} placeholder="Ex: Ressources Humaines" bg="gray.50" color="gray.900" borderColor="gray.200" rounded="lg" fontSize="sm" _focus={{ borderColor: "#14b8a6", boxShadow: "0 0 0 3px rgba(20,184,166,0.12)" }} />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">Description</FormLabel>
              <Textarea {...register("description")} placeholder="Description du département..." bg="gray.50" color="gray.900" borderColor="gray.200" rounded="lg" fontSize="sm" rows={3} _focus={{ borderColor: "#14b8a6", boxShadow: "0 0 0 3px rgba(20,184,166,0.12)" }} />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">Responsable</FormLabel>
              <Select {...register("responsableId")} placeholder="Aucun responsable" bg="gray.50" color="gray.900" borderColor="gray.200" rounded="lg" fontSize="sm"
                _hover={{ borderColor: "gray.300" }}
                _focus={{ borderColor: "#14b8a6", boxShadow: "0 0 0 3px rgba(20,184,166,0.12)" }}
                sx={{ "& option": { bg: "#f9fafb", color: "#1a202c" } }}>
                {employes.map((e) => (
                  <option key={e.id} value={e.id} style={{ backgroundColor: "#f9fafb", color: "#1a202c" }}>
                    {e.prenom} {e.nom} — {e.poste}
                  </option>
                ))}
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter pb={6}>
            <Flex w="full" gap={3}>
              <Button flex={1} h="44px" bg="gray.100" color="gray.700" fontWeight="600" fontSize="sm" rounded="xl" _hover={{ bg: "gray.200" }} onClick={onClose} isDisabled={isSubmitting}>
                Annuler
              </Button>
              <Button flex={1} h="44px" bg="#14b8a6" color="white" fontWeight="600" fontSize="sm" rounded="xl" _hover={{ bg: "#0d9488" }} type="submit" isLoading={isSubmitting} spinner={<Spinner size="sm" />}>
                {editTarget ? "Enregistrer" : "Créer"}
              </Button>
            </Flex>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

function DeleteDepartementDialog({
  dept, isOpen, onClose, onConfirm, isDeleting,
}: {
  dept: DepartementResponse | null; isOpen: boolean; onClose: () => void;
  onConfirm: () => void; isDeleting: boolean;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
      <AlertDialogOverlay bg="rgba(15,23,42,0.45)" backdropFilter="blur(6px)">
        <AlertDialogContent rounded="2xl" mx={4} bg="white" fontFamily="'Inter', sans-serif">
          <Box h="4px" bgGradient="linear(to-r, #dc2626, #ef4444)" />
          <AlertDialogHeader fontSize="lg" fontWeight="700" color="gray.900" pt={6}>
            Supprimer le département
          </AlertDialogHeader>
          <AlertDialogBody color="gray.600" fontSize="sm">
            Êtes-vous sûr de vouloir supprimer{" "}
            <Text as="span" fontWeight="600" color="gray.900">
              {dept?.nom}
            </Text>
            {" "}? Cette action est irréversible.
            {(dept?.nombreEmployes ?? 0) > 0 && (
              <Text mt={2} color="orange.600" fontSize="xs">
                ⚠ Ce département contient {dept?.nombreEmployes} employé(s). Ils seront dissociés.
              </Text>
            )}
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

export default function DepartementsPage() {
  const { departements, isLoading, error, refresh } = useDepartements();
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const [editTarget, setEditTarget] = useState<DepartementResponse | null>(null);

  const openCreate = () => { setEditTarget(null); onFormOpen(); };
  const openEdit = (d: DepartementResponse) => { setEditTarget(d); onFormOpen(); };
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [deleteTarget, setDeleteTarget] = useState<DepartementResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  const handleDelete = (d: DepartementResponse) => { setDeleteTarget(d); onDeleteOpen(); };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteDepartement(deleteTarget.id);
      toast({ title: "Département supprimé", description: `${deleteTarget.nom} a été supprimé.`, status: "success", duration: 4000, isClosable: true, position: "top-right" });
      onDeleteClose();
      refresh();
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer ce département.", status: "error", duration: 5000, isClosable: true, position: "top-right" });
    } finally {
      setIsDeleting(false);
    }
  };

  const bgPage = "#f8fafc";

  return (
    <Flex h="100vh" w="full" overflow="hidden" fontFamily="'Inter', sans-serif">
      <Sidebar activePage="departements" />
      <Box as="main" flex={1} h="full" overflowY="auto" bg={bgPage} p={{ base: 4, lg: 8 }} sx={{ "&::-webkit-scrollbar": { width: "8px", height: "8px" }, "&::-webkit-scrollbar-track": { background: "transparent" }, "&::-webkit-scrollbar-thumb": { background: "#cbd5e1", borderRadius: "4px" }, "&::-webkit-scrollbar-thumb:hover": { background: "#94a3b8" }, }}>
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
                  <DepartmentCard key={dept.id} dept={dept} index={index} onEdit={openEdit} onDelete={handleDelete}/>
                ))}
                <AddNewCard onClick={openCreate} />
              </>
            )}
          </SimpleGrid>
        </Box>
      </Box>
      {isFormOpen && (
        <DepartementFormModal
          isOpen={isFormOpen} onClose={() => { onFormClose(); setEditTarget(null); }} onSaved={refresh} editTarget={editTarget}
        />
      )}
      <DeleteDepartementDialog dept={deleteTarget} isOpen={isDeleteOpen} onClose={onDeleteClose} onConfirm={confirmDelete} isDeleting={isDeleting}/>
    </Flex>
  );
}
