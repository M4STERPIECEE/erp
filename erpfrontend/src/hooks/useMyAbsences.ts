import { useCallback, useEffect, useRef, useState } from "react";
import { getMyAbsences } from "../services/employee-space.service";
import type { AbsenceResponse } from "../types/employee-space.types";

interface UseMyAbsencesReturn {
  absences: AbsenceResponse[];
  isLoading: boolean;
  error: string | null;
  mois: number;
  annee: number;
  setMois: (m: number) => void;
  setAnnee: (a: number) => void;
  refresh: () => void;
}

export function useMyAbsences(): UseMyAbsencesReturn {
  const now = new Date();
  const [mois, setMoisRaw] = useState(now.getMonth() + 1);
  const [annee, setAnneeRaw] = useState(now.getFullYear());
  const [absences, setAbsences] = useState<AbsenceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const fetchIdRef = useRef(0);

  useEffect(() => {
    const id = ++fetchIdRef.current;

    getMyAbsences(mois, annee)
      .then((data) => {
        if (id === fetchIdRef.current) setAbsences(data);
      })
      .catch((err) => {
        if (id === fetchIdRef.current) {
          setError(err?.response?.data?.message ?? "Impossible de charger les absences");
        }
      })
      .finally(() => {
        if (id === fetchIdRef.current) setIsLoading(false);
      });
  }, [mois, annee, refreshKey]);

  const setMois = useCallback((m: number) => {
    setMoisRaw(m);
    setIsLoading(true);
    setError(null);
  }, [setMoisRaw, setIsLoading, setError]);

  const setAnnee = useCallback((a: number) => {
    setAnneeRaw(a);
    setIsLoading(true);
    setError(null);
  }, [setAnneeRaw, setIsLoading, setError]);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setIsLoading(true);
    setError(null);
  }, [setRefreshKey, setIsLoading, setError]);

  return { absences, isLoading, error, mois, annee, setMois, setAnnee, refresh };
}
