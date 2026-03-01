import { useCallback, useEffect, useRef, useState } from "react";
import { getEmployes } from "../services/employe.service";
import type {
  EmployeeResponse,
  GetEmployesParams,
} from "../types/employe.types";

interface UseEmployesReturn {
  employees: EmployeeResponse[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  isLoading: boolean;
  error: string | null;
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
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPageNum] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearchRaw] = useState("");
  const [departement, setDepartementRaw] = useState<number | undefined>(undefined);
  const [statut, setStatutRaw] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPageNum(0);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);
  const setSearch = useCallback((v: string) => setSearchRaw(v), []);
  const setDepartement = useCallback((v: number | undefined) => {
    setDepartementRaw(v);
    setPageNum(0);
  }, []);
  const setStatut = useCallback((v: string) => {
    setStatutRaw(v);
    setPageNum(0);
  }, []);
  const setPage = useCallback((p: number) => setPageNum(p), []);

  const fetchIdRef = useRef(0);
  useEffect(() => {
    const id = ++fetchIdRef.current;
    const controller = new AbortController();

    setIsLoading(true);
    setError(null);

    const params: GetEmployesParams = {
      page,
      size: PAGE_SIZE,
      search: debouncedSearch || undefined,
      departement: departement || undefined,
      statut: statut || undefined,
    };

    getEmployes(params).then(
      (data) => {
        if (controller.signal.aborted || id !== fetchIdRef.current) return;
        setEmployees(data.content);
        setTotalElements(data.totalElements);
        setTotalPages(data.totalPages);
        setPageNum(data.number);
        setIsLoading(false);
      },
      (err: unknown) => {
        if (controller.signal.aborted || id !== fetchIdRef.current) return;
        const message =
          err instanceof Error ? err.message : "Erreur lors du chargement";
        setError(message);
        setIsLoading(false);
      },
    );

    return () => controller.abort();
  }, [page, debouncedSearch, departement, statut]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (refreshKey === 0) return;
    const id = ++fetchIdRef.current;

    setIsLoading(true);
    setError(null);

    const params: GetEmployesParams = {
      page,
      size: PAGE_SIZE,
      search: debouncedSearch || undefined,
      departement: departement || undefined,
      statut: statut || undefined,
    };

    getEmployes(params).then(
      (data) => {
        if (id !== fetchIdRef.current) return;
        setEmployees(data.content);
        setTotalElements(data.totalElements);
        setTotalPages(data.totalPages);
        setPageNum(data.number);
        setIsLoading(false);
      },
      (err: unknown) => {
        if (id !== fetchIdRef.current) return;
        const message =
          err instanceof Error ? err.message : "Erreur lors du chargement";
        setError(message);
        setIsLoading(false);
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  return {
    employees,
    totalElements,
    totalPages,
    page,
    size: PAGE_SIZE,
    isLoading,
    error,
    search,
    departement,
    statut,
    setSearch,
    setDepartement,
    setStatut,
    setPage,
    refresh,
  };
}
