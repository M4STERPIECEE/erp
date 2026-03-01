import { useCallback, useEffect, useRef, useState } from "react";
import { getEmployes } from "../services/employe.service";
import type {
  EmployeeResponse,
  GetEmployesParams,
  PagedEmployeeResponse,
} from "../types/employe.types";

interface UseEmployesState {
  employees: EmployeeResponse[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  isLoading: boolean;
  error: string | null;
}

interface UseEmployesReturn extends UseEmployesState {
  search: string;
  departement: number | undefined;
  statut: string;
  setSearch: (v: string) => void;
  setDepartement: (v: number | undefined) => void;
  setStatut: (v: string) => void;
  setPage: (p: number) => void;
  refresh: () => void;
}

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 400;

export function useEmployes(): UseEmployesReturn {
  const [state, setState] = useState<UseEmployesState>({
    employees: [],
    totalElements: 0,
    totalPages: 0,
    page: 0,
    size: PAGE_SIZE,
    isLoading: true,
    error: null,
  });

  const [search, setSearch] = useState("");
  const [departement, setDepartement] = useState<number | undefined>(undefined);
  const [statut, setStatut] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  // Reset page when filters change
  useEffect(() => {
    setState((s) => ({ ...s, page: 0 }));
  }, [debouncedSearch, departement, statut]);

  const fetchData = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));

    const params: GetEmployesParams = {
      page: state.page,
      size: PAGE_SIZE,
      search: debouncedSearch || undefined,
      departement: departement || undefined,
      statut: statut || undefined,
    };

    try {
      const data: PagedEmployeeResponse = await getEmployes(params);
      setState((s) => ({
        ...s,
        employees: data.content,
        totalElements: data.totalElements,
        totalPages: data.totalPages,
        page: data.number,
        size: data.size,
        isLoading: false,
      }));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur lors du chargement";
      setState((s) => ({ ...s, isLoading: false, error: message }));
    }
  }, [state.page, debouncedSearch, departement, statut]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setPage = useCallback(
    (p: number) => setState((s) => ({ ...s, page: p })),
    [],
  );

  return {
    ...state,
    search,
    departement,
    statut,
    setSearch,
    setDepartement,
    setStatut,
    setPage,
    refresh: fetchData,
  };
}
