import { useCallback, useEffect, useRef, useState } from "react";
import { getDepartments } from "../services/department.service";
import type { DepartmentResponse } from "../types/department.types";

interface UseDepartmentsReturn {
  departements: DepartmentResponse[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useDepartments(): UseDepartmentsReturn {
  const [departements, setDepartements] = useState<DepartmentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIdRef = useRef(0);

  useEffect(() => {
    const id = ++fetchIdRef.current;
    const controller = new AbortController();

    getDepartments().then(
      (data) => {
        if (controller.signal.aborted || id !== fetchIdRef.current) return;
        setDepartements(data);
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
  }, []);

  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    if (refreshKey === 0) return;
    const id = ++fetchIdRef.current;

    getDepartments().then(
      (data) => {
        if (id !== fetchIdRef.current) return;
        setDepartements(data);
        setIsLoading(false);
        setError(null);
      },
      (err: unknown) => {
        if (id !== fetchIdRef.current) return;
        const message = err instanceof Error ? err.message : "Erreur lors du chargement";
        setError(message);
        setIsLoading(false);
      },
    );
  }, [refreshKey]);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  return { departements, isLoading, error, refresh };
}
