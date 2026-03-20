import {
  Box,
  Flex,
  Text,
  Link,
  Divider,
  Tooltip,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROLES } from "../types/auth";

interface NavItemProps {
  icon: string;
  label: string;
  active?: boolean;
  to?: string;
}

function NavItem({ icon, label, active = false, to = "/" }: NavItemProps) {
  return (
    <Link
      as={RouterLink}
      to={to}
      display="flex"
      alignItems="center"
      gap={3}
      px={4}
      py={3}
      rounded="lg"
      textDecoration="none"
      bg={active ? "rgba(255,255,255,0.15)" : "transparent"}
      color={active ? "white" : "rgba(203,213,225,1)"}
      _hover={{
        bg: "rgba(255,255,255,0.05)",
        color: "white",
        textDecoration: "none",
      }}
      transition="all 0.15s"
    >
      <Box as="span" className="material-symbols-outlined" fontSize="20px" lineHeight="1">
        {icon}
      </Box>
      <Text fontSize="sm" fontWeight="medium">
        {label}
      </Text>
    </Link>
  );
}

function getInitials(username: string): string {
  const parts = username.split(/[._ -]/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return username.slice(0, 2).toUpperCase();
}

function roleLabel(roles: string[]): string {
  if (roles.includes(ROLES.ADMIN))   return "Administrateur";
  if (roles.includes(ROLES.RH))      return "Responsable RH";
  if (roles.includes(ROLES.EMPLOYE)) return "Employé";
  return "Utilisateur";
}

interface SidebarProps {
  activePage?: string;
}

export default function Sidebar({ activePage = "dashboard" }: SidebarProps) {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bg = "#1E3A5F";

  const isAdmin = hasRole(ROLES.ADMIN);

  const confirmLogout = () => {
    logout();
    onClose();
    navigate("/login", { replace: true });
  };

  const initials  = user ? getInitials(user.username) : "??";
  const fullLabel = roleLabel(user?.roles ?? []);

  return (
    <Box as="aside" w="64" minW="256px" bg={bg} display="flex" flexDir="column" justifyContent="space-between" h="full" flexShrink={0} zIndex={20} boxShadow="xl" fontFamily="'Inter', sans-serif" >
      <Box p={6} display="flex" flexDir="column" gap={6}>
        <Flex alignItems="center" gap={3}>
          <Flex bg="rgba(255,255,255,0.1)" p={2} rounded="lg" alignItems="center" justifyContent="center" backdropFilter="blur(4px)" >
            <Box as="span" className="material-symbols-outlined" color="white" fontSize="24px" lineHeight="1">
              grid_view
            </Box>
          </Flex>
          <Text color="white" fontSize="lg" fontWeight="bold" letterSpacing="tight">
            HR System
          </Text>
        </Flex>
        <Box as="nav" display="flex" flexDir="column" gap={2} mt={4}>
          <NavItem icon="dashboard"       label="Tableau de bord" to="/"             active={activePage === "dashboard"} />
          <NavItem icon="group"           label="Employés"        to="/employees"     active={activePage === "employees"} />
          <NavItem icon="domain"          label="Départements"    to="/departments"   active={activePage === "departments"} />
          <NavItem icon="event_available" label="Congés"          to="/leaves"        active={activePage === "leaves"} />
          <NavItem icon="person_off"      label="Absences"        to="/absences"      active={activePage === "absences"} />
          <NavItem icon="payments"        label="Paie"            to="/payroll"       active={activePage === "payroll"} />
          {isAdmin && (
            <NavItem icon="manage_accounts" label="Comptes Keycloak" to="/admin/keycloak" active={activePage === "keycloak"} />
          )}
        </Box>
      </Box>
      <Box p={6}>
        <NavItem icon="settings" label="Paramètres" to="/settings" active={activePage === "settings"} />
        <Divider borderColor="rgba(255,255,255,0.1)" mt={6} mb={4} />
        <Flex alignItems="center" justify="space-between" px={4}>
          <Flex alignItems="center" gap={3}>
            <Flex boxSize={8} rounded="full" bg={isAdmin ? "#e25822" : "#0d9488"} alignItems="center" justifyContent="center" color="white" fontWeight="bold" fontSize="xs" flexShrink={0}>
              {initials}
            </Flex>
            <Box overflow="hidden">
              <Text color="white" fontSize="sm" fontWeight="medium" isTruncated maxW="120px">
                {user?.username ?? "..."}
              </Text>
              <Text color="rgba(148,163,184,1)" fontSize="xs">
                {fullLabel}
              </Text>
            </Box>
          </Flex>
          <Tooltip label="Déconnexion" placement="right">
            <IconButton aria-label="Déconnexion" size="sm" variant="ghost" color="rgba(148,163,184,1)" _hover={{ color: "white", bg: "rgba(255,255,255,0.1)" }} onClick={onOpen} icon={
                <Box as="span" className="material-symbols-outlined" fontSize="20px" lineHeight="1">
                  logout
                </Box> }/>
          </Tooltip>
        </Flex>
      </Box>
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm" closeOnOverlayClick={false} closeOnEsc={false}>
        <ModalOverlay bg="rgba(15,23,42,0.45)" backdropFilter="blur(6px)" />
        <ModalContent mx={4} rounded="2xl" bg="white" boxShadow="0 25px 50px -12px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)" fontFamily="'Inter', sans-serif" overflow="hidden" >
          <Box h="4px" bgGradient="linear(to-r, #1E3A5F, #0d9488)" />
          <ModalBody px={7} pt={7} pb={4}>
            <Text textAlign="center" fontWeight="700" fontSize="xl" color="gray.900" letterSpacing="tight" mb={2} >
              Se déconnecter ?
            </Text>
            <Flex justify="center" mb={4}>
              <Flex  alignItems="center" gap={2} bg="gray.50" borderWidth="1px" borderColor="gray.200" rounded="full" px={3} py={1}>
                <Flex boxSize={5} rounded="full" bg={isAdmin ? "#e25822" : "#0d9488"} alignItems="center" justifyContent="center" color="white" fontSize="9px" fontWeight="800" flexShrink={0} >
                  {initials}
                </Flex>
                <Text fontSize="xs" fontWeight="600" color="gray.700">
                  {user?.username}
                </Text>
                <Box w="1px" h="3" bg="gray.300" />
                <Text fontSize="xs" color="gray.500">
                  {fullLabel}
                </Text>
              </Flex>
            </Flex>

            <Text textAlign="center" color="gray.500" fontSize="sm" lineHeight="tall" px={2} >
              Votre session sera fermée. Vous devrez vous
              reconnecter pour accéder à l'application.
            </Text>
          </ModalBody>
        <ModalFooter px={7} pt={3} pb={7}>
            <Flex w="full" gap={3}>
                <Button flex={1} height="44px" bg="gray.100" color="gray.700" fontWeight="600" fontSize="sm" rounded="xl" shadow="sm" _hover={{ bg: "gray.200", color: "gray.800", shadow: "md" }}  _active={{ bg: "gray.300" }} transition="all 0.15s" onClick={onClose}  >
                    Annuler
                </Button>
                <Button flex={1} height="44px" bg="#1E3A5F" color="white" fontWeight="600" fontSize="sm" rounded="xl" shadow="sm" _hover={{ bg: "#16335a", transform: "translateY(-1px)", boxShadow: "0 10px 15px -3px rgba(30,58,95,0.4)" }} _active={{ bg: "#12284a", transform: "translateY(0)" }} transition="all 0.15s" onClick={confirmLogout} gap={2} >
                    Déconnecter
                </Button>
            </Flex>
            </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
