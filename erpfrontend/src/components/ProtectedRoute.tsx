import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { useAuth } from "../hooks/useAuth";
import PageTransition from "./PageTransition";
import Sidebar from "./Sidebar";
import type { AppRole } from "../types/auth";

const scrollStyles = {
  "&::-webkit-scrollbar": { width: "8px", height: "8px" },
  "&::-webkit-scrollbar-track": { background: "transparent" },
  "&::-webkit-scrollbar-thumb": { background: "#cbd5e1", borderRadius: "4px" },
  "&::-webkit-scrollbar-thumb:hover": { background: "#94a3b8" },
};

function activePageFromPath(pathname: string): string {
  const match = pathname.match(/^\/([^/]+)/);
  const base = match?.[1] ?? "";
  if (base === "" || base === "dashboard") return "dashboard";
  if (["employees", "departments", "leaves", "absences", "payroll", "settings"].includes(base)) return base;
  return "dashboard";
}

interface ProtectedRouteProps {
  allowedRoles?: AppRole[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Flex h="100vh" align="center" justify="center" direction="column" gap={4} bg="#f6f7f8">
        <Spinner size="xl" color="#1E3A5F" thickness="3px" />
        <Text color="gray.500" fontSize="sm">Chargement de la session…</Text>
      </Flex>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !hasRole(...allowedRoles)) {
    return (
      <Flex h="100vh" align="center" justify="center" direction="column" gap={4} bg="#f6f7f8">
        <Box as="span" className="material-symbols-outlined" fontSize="64px" color="#1E3A5F">
          lock
        </Box>
        <Text fontSize="xl" fontWeight="bold" color="#1E3A5F">Accès refusé</Text>
        <Text color="gray.500" fontSize="sm">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </Text>
      </Flex>
    );
  }

  return (
    <Flex h="100vh" w="full" overflow="hidden">
      <Sidebar activePage={activePageFromPath(location.pathname)} />
      <Box as="main" flex={1} h="full" overflowY="auto" bg="#f8fafc" p={{ base: 4, lg: 8 }} sx={scrollStyles}>
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </Box>
    </Flex>
  );
}
