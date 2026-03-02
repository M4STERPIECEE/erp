import {
  Box, Flex, Text, Heading, Button, IconButton, Input, InputGroup, InputLeftElement,
  Table, Thead, Tbody, Tr, Th, Td,
  Skeleton, Alert, AlertIcon, Spinner, useDisclosure, useToast,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  FormControl, FormLabel, Checkbox, CheckboxGroup, Stack,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
  Tooltip,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Sidebar from "../components/Sidebar";
import { useKeycloakUsers } from "../hooks/useKeycloakUsers";
import {
  createKeycloakUser, deleteKeycloakUser,
  assignRoles, toggleUserStatus, resetPassword,
} from "../services/keycloak.service";
import type { KeycloakUser, CreateKeycloakUserRequest } from "../types/keycloak.types";
import { KC_MANAGED_ROLES } from "../types/keycloak.types";

const roleBadgeStyle: Record<string, { bg: string; color: string }> = {
  admin:   { bg: "#fef2f2", color: "#dc2626" },
  rh:      { bg: "#eff6ff", color: "#2563eb" },
  employe: { bg: "#ecfdf5", color: "#059669" },
};

function RoleBadge({ role }: { role: string }) {
  const s = roleBadgeStyle[role] ?? { bg: "gray.100", color: "gray.600" };
  return (
    <Box
      as="span" display="inline-flex" alignItems="center"
      px={2} py={0.5} rounded="full"
      fontSize="xs" fontWeight="medium"
      bg={s.bg} color={s.color}
    >
      {role}
    </Box>
  );
}

function StatusDot({ enabled }: { enabled: boolean }) {
  return (
    <Flex alignItems="center" gap={1.5}>
      <Box boxSize={2} rounded="full" bg={enabled ? "#22c55e" : "#ef4444"} />
      <Text fontSize="sm" color={enabled ? "green.700" : "red.600"} fontWeight="medium">
        {enabled ? "Actif" : "Désactivé"}
      </Text>
    </Flex>
  );
}

function formatDate(ts: number | null): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <Tr key={i}>
          {Array.from({ length: 6 }).map((_, j) => (
            <Td key={j} px={4} py={4}><Skeleton h="16px" rounded="md" /></Td>
          ))}
        </Tr>
      ))}
    </>
  );
}

function Pagination({ page, totalPages, totalElements, size, count, onPageChange }: {
  page: number; totalPages: number; totalElements: number; size: number;
  count: number; onPageChange: (p: number) => void;
}) {
  const from = totalElements === 0 ? 0 : page * size + 1;
  const to   = page * size + count;
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

  return (
    <Flex px={6} py={4} borderTopWidth="1px" borderColor="gray.100" bg="rgba(248,250,252,0.5)" justify="space-between" align="center" flexWrap="wrap" gap={3}>
      <Text fontSize="sm" color="gray.500">
        Affichage de{" "}
        <Box as="span" fontWeight="medium" color="gray.900">{from}</Box>{" "}
        à{" "}
        <Box as="span" fontWeight="medium" color="gray.900">{to}</Box>{" "}
        sur{" "}
        <Box as="span" fontWeight="medium" color="gray.900">{totalElements}</Box>{" "}
        comptes
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

interface CreateFormValues {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

function CreateUserModal({
  isOpen, onClose, onSaved,
}: {
  isOpen: boolean; onClose: () => void; onSaved: () => void;
}) {
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<CreateFormValues>({
    defaultValues: { username: "", email: "", firstName: "", lastName: "", password: "" },
  });
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["employe"]);
  const toast = useToast();

  const onSubmit = async (values: CreateFormValues) => {
    const payload: CreateKeycloakUserRequest = {
      ...values, roles: selectedRoles, enabled: true,
    };
    try {
      await createKeycloakUser(payload);
      toast({ title: "Compte créé", status: "success", duration: 3000, isClosable: true, position: "top-right" });
      reset(); setSelectedRoles(["employe"]); onClose(); onSaved();
    } catch {
      toast({ title: "Erreur", description: "Impossible de créer le compte.", status: "error", duration: 5000, isClosable: true, position: "top-right" });
    }
  };

  const inputStyle = {
    bg: "gray.50", color: "gray.900", borderColor: "gray.200", rounded: "lg", fontSize: "sm",
    _focus: { borderColor: "#14b8a6", boxShadow: "0 0 0 3px rgba(20,184,166,0.12)" },
  } as const;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg" closeOnOverlayClick={false}>
      <ModalOverlay bg="rgba(15,23,42,0.45)" backdropFilter="blur(6px)" />
      <ModalContent rounded="2xl" mx={4} bg="white" fontFamily="'Inter', sans-serif" overflow="hidden">
        <Box h="4px" bgGradient="linear(to-r, #1E3A5F, #0d9488)" />
        <ModalHeader fontSize="lg" fontWeight="700" color="gray.900" pt={6}>
          Nouveau compte Keycloak
        </ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody display="flex" flexDir="column" gap={4}>
            <Flex gap={4}>
              <FormControl isRequired isInvalid={!!errors.firstName} flex={1}>
                <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">Prénom</FormLabel>
                <Input {...inputStyle} {...register("firstName", { required: true })} placeholder="Jean" />
              </FormControl>
              <FormControl isRequired isInvalid={!!errors.lastName} flex={1}>
                <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">Nom</FormLabel>
                <Input {...inputStyle} {...register("lastName", { required: true })} placeholder="Dupont" />
              </FormControl>
            </Flex>
            <FormControl isRequired isInvalid={!!errors.username}>
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">Nom d'utilisateur</FormLabel>
              <Input {...inputStyle} {...register("username", { required: true })} placeholder="jean.dupont" />
            </FormControl>
            <FormControl isRequired isInvalid={!!errors.email}>
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">Email</FormLabel>
              <Input {...inputStyle} {...register("email", { required: true })} placeholder="jean.dupont@entreprise.com" type="email" />
            </FormControl>
            <FormControl isRequired isInvalid={!!errors.password}>
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">Mot de passe</FormLabel>
              <Input {...inputStyle} {...register("password", { required: true, minLength: 6 })} placeholder="Min 6 caractères" type="password" />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">Rôles</FormLabel>
              <CheckboxGroup value={selectedRoles} onChange={(vals) => setSelectedRoles(vals as string[])}>
                <Stack direction="row" gap={4}>
                  {KC_MANAGED_ROLES.map((r) => (
                    <Checkbox key={r} value={r} colorScheme="teal" size="sm">
                      <Text fontSize="sm" color="gray.700">{r}</Text>
                    </Checkbox>
                  ))}
                </Stack>
              </CheckboxGroup>
            </FormControl>
          </ModalBody>
          <ModalFooter pb={6}>
            <Flex w="full" gap={3}>
              <Button flex={1} h="44px" bg="gray.100" color="gray.700" fontWeight="600" fontSize="sm" rounded="xl" _hover={{ bg: "gray.200" }} onClick={onClose} isDisabled={isSubmitting}>
                Annuler
              </Button>
              <Button flex={1} h="44px" bg="#1E3A5F" color="white" fontWeight="600" fontSize="sm" rounded="xl" _hover={{ bg: "#16335a" }} type="submit" isLoading={isSubmitting} spinner={<Spinner size="sm" />}>
                Créer le compte
              </Button>
            </Flex>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

function EditRolesModal({
  user, isOpen, onClose, onSaved,
}: {
  user: KeycloakUser | null; isOpen: boolean; onClose: () => void; onSaved: () => void;
}) {
  const [selected, setSelected] = useState<string[]>(user?.roles ?? []);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await assignRoles(user.id, { roles: selected });
      toast({ title: "Rôles mis à jour", status: "success", duration: 3000, isClosable: true, position: "top-right" });
      onClose(); onSaved();
    } catch {
      toast({ title: "Erreur", description: "Impossible de modifier les rôles.", status: "error", duration: 5000, isClosable: true, position: "top-right" });
    } finally {
      setSaving(false);
    }
  };
  if (user && JSON.stringify(user.roles.sort()) !== JSON.stringify(selected.sort()) && !saving) {
    setSelected(user.roles);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm" closeOnOverlayClick={false}>
      <ModalOverlay bg="rgba(15,23,42,0.45)" backdropFilter="blur(6px)" />
      <ModalContent rounded="2xl" mx={4} bg="white" fontFamily="'Inter', sans-serif" overflow="hidden">
        <Box h="4px" bgGradient="linear(to-r, #a855f7, #6366f1)" />
        <ModalHeader fontSize="lg" fontWeight="700" color="gray.900" pt={6}>
          Rôles de {user?.username}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <CheckboxGroup value={selected} onChange={(vals) => setSelected(vals as string[])}>
            <Stack gap={3}>
              {KC_MANAGED_ROLES.map((r) => (
                <Checkbox key={r} value={r} colorScheme="teal" size="md">
                  <Flex alignItems="center" gap={2}>
                    <RoleBadge role={r} />
                  </Flex>
                </Checkbox>
              ))}
            </Stack>
          </CheckboxGroup>
        </ModalBody>
        <ModalFooter pb={6}>
          <Flex w="full" gap={3}>
            <Button flex={1} h="44px" bg="gray.100" color="gray.700" fontWeight="600" fontSize="sm" rounded="xl" _hover={{ bg: "gray.200" }} onClick={onClose} isDisabled={saving}>
              Annuler
            </Button>
            <Button flex={1} h="44px" bg="#7c3aed" color="white" fontWeight="600" fontSize="sm" rounded="xl" _hover={{ bg: "#6d28d9" }} onClick={handleSave} isLoading={saving} spinner={<Spinner size="sm" />}>
              Enregistrer
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function DeleteUserDialog({
  user, isOpen, onClose, onConfirm, isDeleting,
}: {
  user: KeycloakUser | null; isOpen: boolean; onClose: () => void;
  onConfirm: () => void; isDeleting: boolean;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
      <AlertDialogOverlay bg="rgba(15,23,42,0.45)" backdropFilter="blur(6px)">
        <AlertDialogContent rounded="2xl" mx={4} bg="white" fontFamily="'Inter', sans-serif">
          <Box h="4px" bgGradient="linear(to-r, #dc2626, #ef4444)" />
          <AlertDialogHeader fontSize="lg" fontWeight="700" color="gray.900" pt={6}>
            Supprimer le compte
          </AlertDialogHeader>
          <AlertDialogBody color="gray.600" fontSize="sm">
            Êtes-vous sûr de vouloir supprimer le compte{" "}
            <Text as="span" fontWeight="600" color="gray.900">{user?.username}</Text>
            {" "}? Cette action est irréversible.
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

export default function KeycloakPage() {
  const { users, isLoading, error, page, totalPages, totalElements, size, setPage, setSearch, refresh } = useKeycloakUsers();
  const [searchInput, setSearchInput] = useState("");
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toast = useToast();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isRolesOpen, onOpen: onRolesOpen, onClose: onRolesClose } = useDisclosure();
  const [rolesTarget, setRolesTarget] = useState<KeycloakUser | null>(null);
  const openRoles = (u: KeycloakUser) => { setRolesTarget(u); onRolesOpen(); };
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [deleteTarget, setDeleteTarget] = useState<KeycloakUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const handleDelete = (u: KeycloakUser) => { setDeleteTarget(u); onDeleteOpen(); };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteKeycloakUser(deleteTarget.id);
      toast({ title: "Compte supprimé", status: "success", duration: 3000, isClosable: true, position: "top-right" });
      onDeleteClose(); refresh();
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer le compte.", status: "error", duration: 5000, isClosable: true, position: "top-right" });
    } finally { setIsDeleting(false); }
  };
  const handleToggle = async (u: KeycloakUser) => {
    try {
      const { enabled } = await toggleUserStatus(u.id);
      toast({
        title: enabled ? "Compte activé" : "Compte désactivé",
        status: enabled ? "success" : "warning",
        duration: 3000, isClosable: true, position: "top-right",
      });
      refresh();
    } catch {
      toast({ title: "Erreur", status: "error", duration: 3000, isClosable: true, position: "top-right" });
    }
  };
  const handleReset = async (u: KeycloakUser) => {
    try {
      await resetPassword(u.id);
      toast({
        title: "Mot de passe réinitialisé",
        description: `Temporaire : Changeme1!`,
        status: "info", duration: 6000, isClosable: true, position: "top-right",
      });
    } catch {
      toast({ title: "Erreur", status: "error", duration: 3000, isClosable: true, position: "top-right" });
    }
  };
  const handleSearchInput = (value: string) => {
    setSearchInput(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setSearch(value), 400);
  };

  const bgPage = "#f8fafc";
  const surface = "white";
  const borderClr = "gray.200";

  return (
    <Flex h="100vh" w="full" overflow="hidden" fontFamily="'Inter', sans-serif">
      <Sidebar activePage="keycloak" />
      <Box as="main" flex={1} h="full" overflowY="auto" bg={bgPage} p={{ base: 4, lg: 8 }}
        sx={{
          "&::-webkit-scrollbar": { width: "8px", height: "8px" },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": { background: "#cbd5e1", borderRadius: "4px" },
          "&::-webkit-scrollbar-thumb:hover": { background: "#94a3b8" },
        }}
      >
        <Box w="full" display="flex" flexDir="column" gap={6}>
          <Flex direction={{ base: "column", md: "row" }} align={{ md: "center" }} justify="space-between" gap={4}>
            <Box className="text-init">
              <Heading as="h1" fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="gray.900" letterSpacing="tight">
                Comptes Keycloak
              </Heading>
              <Text color="gray.500" mt={1} fontSize="sm">
                Gérez les comptes d'authentification, les rôles et les accès.
              </Text>
            </Box>
            <Button bg="#1E3A5F" color="white" px={5} py={2.5} h="auto" rounded="lg" fontSize="sm" fontWeight="medium" boxShadow="0 1px 3px 0 rgba(30,58,95,0.3)" _hover={{ bg: "#16335a" }} _active={{ transform: "scale(0.95)" }} transition="all 0.15s" onClick={onCreateOpen} leftIcon={<Box as="span" className="material-symbols-outlined" fontSize="20px" lineHeight="1">person_add</Box>} >
              Créer un compte
            </Button>
          </Flex>
          <Box borderBottomWidth="1px" borderColor="gray.200" />
          <Flex direction={{ base: "column", sm: "row" }} justify="space-between" alignItems={{ sm: "center" }} gap={4}>
            <Flex gap={4} alignItems="center">
              <Text color="gray.500" fontSize="sm" fontWeight="medium">
                <Text as="span" fontWeight="bold" color="gray.900">{totalElements}</Text>{" "}comptes
              </Text>
            </Flex>
            <InputGroup maxW="320px">
              <InputLeftElement pointerEvents="none" pl={1}>
                <Box as="span" className="material-symbols-outlined" fontSize="20px" color="gray.400" lineHeight="1">search</Box>
              </InputLeftElement>
              <Input pl={10} bg="gray.50" borderColor={borderClr} rounded="lg" fontSize="sm" color="gray.900" placeholder="Rechercher par nom, email…" _placeholder={{ color: "gray.400" }} _focus={{ borderColor: "#1E3A5F", boxShadow: "0 0 0 3px rgba(30,58,95,0.12)" }} value={searchInput} onChange={(e) => handleSearchInput(e.target.value)}/>
            </InputGroup>
          </Flex>
          {error && (
            <Alert status="error" rounded="xl" variant="left-accent">
              <AlertIcon />
              <Text fontSize="sm">{error}</Text>
            </Alert>
          )}
          
          {/* === TABLEAU CORRIGÉ : lignes de séparation très claires (gray.100) === */}
          <Box 
            bg={surface} 
            rounded="xl" 
            borderWidth="1px" 
            borderColor={borderClr} 
            shadow="sm" 
            overflowX="auto"
            sx={{
              // Lignes entre les données → ultra claires (plus du tout noires/moches)
              "tbody tr td": {
                borderBottom: "1px solid",
                borderColor: "gray.100",
              },
              "tbody tr:last-child td": {
                borderBottom: "none",
              },
              // En-tête légèrement plus marqué
              "thead tr th": {
                borderBottom: "2px solid",
                borderColor: "gray.200",
              },
            }}
          >
            <Table variant="simple" size="sm">
              <Thead>
                <Tr bg="gray.50">
                  {["Utilisateur", "Email", "Rôles", "Statut", "Créé le"].map((h) => (
                    <Th key={h} px={4} py={3} fontSize="xs" textTransform="uppercase" letterSpacing="wider" color="gray.500" fontWeight="semibold">{h}</Th>
                  ))}
                  <Th px={4} py={3} fontSize="xs" textTransform="uppercase" letterSpacing="wider" color="gray.500" fontWeight="semibold" textAlign="right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {isLoading ? <SkeletonRows /> : users.length === 0 ? (
                  <Tr><Td colSpan={6} textAlign="center" py={12}><Text color="gray.400" fontSize="sm">Aucun compte trouvé.</Text></Td></Tr>
                ) : users.map((u) => (
                  <Tr key={u.id} _hover={{ bg: "gray.50" }} transition="background 0.1s">
                    <Td px={4} py={4}>
                      <Flex alignItems="center" gap={3}>
                        <Flex boxSize={8} rounded="full" bg="#1E3A5F" align="center" justify="center" color="white" fontWeight="bold" fontSize="xs" flexShrink={0}>
                          {(u.firstName?.[0] ?? u.username[0]).toUpperCase()}{(u.lastName?.[0] ?? u.username[1] ?? "").toUpperCase()}
                        </Flex>
                        <Box>
                          <Text fontSize="sm" fontWeight="medium" color="gray.900" whiteSpace="nowrap">
                            {u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.username}
                          </Text>
                          <Text fontSize="xs" color="gray.500">{u.username}</Text>
                        </Box>
                      </Flex>
                    </Td>
                    <Td px={4} py={4}><Text fontSize="sm" color="gray.600">{u.email ?? "—"}</Text></Td>
                    <Td px={4} py={4}>
                      <Flex gap={1} flexWrap="wrap">
                        {u.roles.length > 0 ? u.roles.map((r) => <RoleBadge key={r} role={r} />) : <Text fontSize="xs" color="gray.400">Aucun</Text>}
                      </Flex>
                    </Td>
                    <Td px={4} py={4}><StatusDot enabled={u.enabled} /></Td>
                    <Td px={4} py={4}><Text fontSize="sm" color="gray.600" whiteSpace="nowrap">{formatDate(u.createdTimestamp)}</Text></Td>
                    <Td px={4} py={4} textAlign="right">
                      <Flex gap={1} justifyContent="flex-end">
                        {([
                          { label: "Modifier les rôles", icon: "shield_person", hover: { bg: "purple.50", color: "#7c3aed" }, onClick: () => openRoles(u) },
                          { label: u.enabled ? "Désactiver" : "Activer", icon: u.enabled ? "person_off" : "person", hover: { bg: u.enabled ? "orange.50" : "green.50", color: u.enabled ? "orange.500" : "green.500" }, onClick: () => handleToggle(u) },
                          { label: "Réinitialiser MDP", icon: "lock_reset", hover: { bg: "blue.50", color: "#2563eb" }, onClick: () => handleReset(u) },
                          { label: "Supprimer", icon: "delete", hover: { bg: "red.50", color: "red.500" }, onClick: () => handleDelete(u) },
                        ] as const).map((a) => (
                          <Tooltip key={a.icon} label={a.label} placement="top">
                            <IconButton aria-label={a.label} size="sm" variant="ghost" rounded="full" color="gray.500" _hover={a.hover} onClick={a.onClick}
                              icon={<Box as="span" className="material-symbols-outlined" fontSize="18px" lineHeight="1">{a.icon}</Box>} />
                          </Tooltip>
                        ))}
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            {!isLoading && users.length > 0 && (
              <Pagination page={page} totalPages={totalPages} totalElements={totalElements} size={size} count={users.length} onPageChange={setPage} />
            )}
          </Box>
        </Box>
      </Box>

      {isCreateOpen && (
        <CreateUserModal isOpen={isCreateOpen} onClose={onCreateClose} onSaved={refresh} />
      )}
      {isRolesOpen && (
        <EditRolesModal user={rolesTarget} isOpen={isRolesOpen} onClose={() => { onRolesClose(); setRolesTarget(null); }} onSaved={refresh} />
      )}
      <DeleteUserDialog user={deleteTarget} isOpen={isDeleteOpen} onClose={onDeleteClose} onConfirm={confirmDelete} isDeleting={isDeleting} />
    </Flex>
  );
}