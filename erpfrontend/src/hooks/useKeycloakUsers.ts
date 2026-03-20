import { useCallback, useEffect, useRef, useState } from "react";
import { getKeycloakUsers } from "../services/keycloak.service";
import type { KeycloakUser } from "../types/keycloak.types";

interface UseKeycloakUsersReturn {
  users: KeycloakUser[];
  isLoading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  totalElements: number;
  size: number;
  setPage: (p: number) => void;
  setSearch: (s: string) => void;
  search: string;
  refresh: () => void;
}

export function useKeycloakUsers(): UseKeycloakUsersReturn {
  const [users, setUsers] = useState<KeycloakUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [size] = useState(10);
  const [search, setSearchValue] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchIdRef = useRef(0);

  const loadingRef = useRef(false);

  const setSearch = useCallback((s: string) => {
    setSearchValue(s);
    setPage(0);
  }, []);

  useEffect(() => {
    const id = ++fetchIdRef.current;
    const controller = new AbortController();
    loadingRef.current = true;
    setIsLoading(true);  // eslint-disable-line react-hooks/set-state-in-effect -- intentional: sync loading before async fetch

    getKeycloakUsers({ page, size, search: search || undefined }).then(
      (data) => {
        if (controller.signal.aborted || id !== fetchIdRef.current) return;
        setUsers(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
        setIsLoading(false);
        setError(null);
      },
      (err: unknown) => {
        if (controller.signal.aborted || id !== fetchIdRef.current) return;
        const message = err instanceof Error ? err.message : "Erreur lors du chargement";
        setError(message);
        setIsLoading(false);
      },
    );
    return () => controller.abort();
  }, [page, size, search, refreshKey]);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  return { users, isLoading, error, page, totalPages, totalElements, size, setPage, setSearch, search, refresh };
}
