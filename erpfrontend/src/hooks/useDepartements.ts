import { useCallback, useEffect, useRef, useState } from "react";
import { getDepartements } from "../services/departement.service";
import type { DepartementResponse } from "../types/departement.types";

interface UseDepartementsReturn {
  departements: DepartementResponse[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useDepartements(): UseDepartementsReturn {
  const [departements, setDepartements] = useState<DepartementResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIdRef = useRef(0);

  useEffect(() => {
    const id = ++fetchIdRef.current;
    const controller = new AbortController();

    getDepartements().then(
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

    getDepartements().then(
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
