import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { useAuth } from "../hooks/useAuth";
import type { AppRole } from "../types/auth";

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

  return <Outlet />;
}
