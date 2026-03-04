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
  const [mois, setMois] = useState(now.getMonth() + 1);
  const [annee, setAnnee] = useState(now.getFullYear());
  const [absences, setAbsences] = useState<AbsenceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchIdRef = useRef(0);

  const fetch = useCallback(() => {
    const id = ++fetchIdRef.current;
    setIsLoading(true);
    setError(null);

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
  }, [mois, annee]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { absences, isLoading, error, mois, annee, setMois, setAnnee, refresh: fetch };
}
