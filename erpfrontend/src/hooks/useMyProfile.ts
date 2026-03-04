import { useCallback, useEffect, useRef, useState } from "react";
import { getMyProfile } from "../services/employee-space.service";
import type { MyProfileResponse } from "../types/employee-space.types";

interface UseMyProfileReturn {
  profil: MyProfileResponse | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useMyProfile(): UseMyProfileReturn {
  const [profil, setProfil] = useState<MyProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const fetchIdRef = useRef(0);

  useEffect(() => {
    const id = ++fetchIdRef.current;

    getMyProfile()
      .then((data) => {
        if (id === fetchIdRef.current) {
          setProfil(data);
        }
      })
      .catch((err) => {
        if (id === fetchIdRef.current) {
          setError(err?.response?.data?.message ?? "Impossible de charger le profil");
        }
      })
      .finally(() => {
        if (id === fetchIdRef.current) setIsLoading(false);
      });
  }, [refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setIsLoading(true);
    setError(null);
  }, []);

  return { profil, isLoading, error, refresh };
}
