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
import { Link as RouterLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface NavItemProps {
  icon: string;
  label: string;
  active?: boolean;
  to?: string;
}

function NavItem({ icon, label, active = false, to = "/my-space" }: NavItemProps) {
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

interface EmployeeLayoutProps {
  activePage?: string;
}

export default function EmployeeLayout({ activePage = "dashboard" }: EmployeeLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bg = "#1E3A5F";

  const confirmLogout = () => {
    logout();
    onClose();
    navigate("/login", { replace: true });
  };

  const initials = user ? getInitials(user.username) : "??";

  return (
    <Flex h="100vh" overflow="hidden" bg="#f6f7f8" fontFamily="'Inter', sans-serif">
      <Box as="aside" w="64" minW="256px" bg={bg} display="flex" flexDir="column" justifyContent="space-between" h="full" flexShrink={0} zIndex={20} boxShadow="xl">
        <Box p={6} display="flex" flexDir="column" gap={6}>
          <Flex alignItems="center" gap={3}>
            <Flex bg="rgba(255,255,255,0.1)" p={2} rounded="lg" alignItems="center" justifyContent="center" backdropFilter="blur(4px)">
              <Box as="span" className="material-symbols-outlined" color="white" fontSize="24px" lineHeight="1">
                person
              </Box>
            </Flex>
            <Text color="white" fontSize="lg" fontWeight="bold" letterSpacing="tight">
              Mon Espace
            </Text>
          </Flex>
          <Box as="nav" display="flex" flexDir="column" gap={2} mt={4}>
            <NavItem icon="dashboard" label="Tableau de bord" to="/my-space" active={activePage === "dashboard"} />
            <NavItem icon="badge" label="Mon Profil" to="/my-space/profile" active={activePage === "profile"} />
            <NavItem icon="event_available" label="Mes Congés" to="/my-space/leaves" active={activePage === "leaves"} />
            <NavItem icon="person_off" label="Mes Absences" to="/my-space/absences" active={activePage === "absences"} />
            <NavItem icon="payments" label="Mes Fiches de Paie" to="/my-space/payslips" active={activePage === "payslips"} />
          </Box>
        </Box>
        <Box p={6}>
          <Divider borderColor="rgba(255,255,255,0.1)" mb={4} />
          <Flex alignItems="center" justify="space-between" px={4}>
            <Flex alignItems="center" gap={3}>
              <Flex boxSize={8} rounded="full" bg="#0d9488" alignItems="center" justifyContent="center" color="white" fontWeight="bold" fontSize="xs" flexShrink={0}>
                {initials}
              </Flex>
              <Box overflow="hidden">
                <Text color="white" fontSize="sm" fontWeight="medium" isTruncated maxW="120px">
                  {user?.username ?? "..."}
                </Text>
                <Text color="rgba(148,163,184,1)" fontSize="xs">
                  Employé
                </Text>
              </Box>
            </Flex>
            <Tooltip label="Déconnexion" placement="right">
              <IconButton aria-label="Déconnexion" size="sm" variant="ghost" color="rgba(148,163,184,1)" _hover={{ color: "white", bg: "rgba(255,255,255,0.1)" }} onClick={onOpen} icon={
                <Box as="span" className="material-symbols-outlined" fontSize="20px" lineHeight="1">
                  logout
                </Box>} />
            </Tooltip>
          </Flex>
        </Box>
      </Box>
      <Box flex={1} overflowY="auto">
        <Outlet />
      </Box>
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm" closeOnOverlayClick={false} closeOnEsc={false}>
        <ModalOverlay bg="rgba(15,23,42,0.45)" backdropFilter="blur(6px)" />
        <ModalContent mx={4} rounded="2xl" bg="white" boxShadow="0 25px 50px -12px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)" fontFamily="'Inter', sans-serif" overflow="hidden">
          <Box h="4px" bgGradient="linear(to-r, #1E3A5F, #0d9488)" />
          <ModalBody px={7} pt={7} pb={4}>
            <Text textAlign="center" fontWeight="700" fontSize="xl" color="gray.900" letterSpacing="tight" mb={2}>
              Se déconnecter ?
            </Text>
            <Flex justify="center" mb={4}>
              <Flex alignItems="center" gap={2} bg="gray.50" borderWidth="1px" borderColor="gray.200" rounded="full" px={3} py={1}>
                <Flex boxSize={5} rounded="full" bg="#0d9488" alignItems="center" justifyContent="center" color="white" fontSize="9px" fontWeight="800" flexShrink={0}>
                  {initials}
                </Flex>
                <Text fontSize="xs" fontWeight="600" color="gray.700">
                  {user?.username}
                </Text>
              </Flex>
            </Flex>
            <Text textAlign="center" color="gray.500" fontSize="sm" lineHeight="tall" px={2}>
              Votre session sera fermée. Vous devrez vous reconnecter pour accéder à l'application.
            </Text>
          </ModalBody>
          <ModalFooter px={7} pt={3} pb={7}>
            <Flex w="full" gap={3}>
              <Button flex={1} height="44px" bg="gray.100" color="gray.700" fontWeight="600" fontSize="sm" rounded="xl" shadow="sm" _hover={{ bg: "gray.200", color: "gray.800", shadow: "md" }} _active={{ bg: "gray.300" }} transition="all 0.15s" onClick={onClose}>
                Annuler
              </Button>
              <Button flex={1} height="44px" bg="#1E3A5F" color="white" fontWeight="600" fontSize="sm" rounded="xl" shadow="sm" _hover={{ bg: "#16335a", transform: "translateY(-1px)", boxShadow: "0 10px 15px -3px rgba(30,58,95,0.4)" }} _active={{ bg: "#12284a", transform: "translateY(0)" }} transition="all 0.15s" onClick={confirmLogout} gap={2}>
                Déconnecter
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
