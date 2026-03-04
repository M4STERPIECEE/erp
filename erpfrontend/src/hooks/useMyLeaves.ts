import { useCallback, useEffect, useRef, useState } from "react";
import { getMyLeaves, getLeaveStats, cancelLeave } from "../services/employee-space.service";
import { useToast } from "@chakra-ui/react";
import type { LeaveResponse, LeaveStatsResponse } from "../types/employee-space.types";

interface UseMyLeavesReturn {
  conges: LeaveResponse[];
  stats: LeaveStatsResponse | null;
  isLoading: boolean;
  error: string | null;
  annuler: (id: number) => Promise<boolean>;
  refresh: () => void;
}

export function useMyLeaves(): UseMyLeavesReturn {
  const [conges, setConges] = useState<LeaveResponse[]>([]);
  const [stats, setStats] = useState<LeaveStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const fetchIdRef = useRef(0);
  const toast = useToast();

  useEffect(() => {
    const id = ++fetchIdRef.current;

    Promise.all([getMyLeaves(), getLeaveStats()])
      .then(([congesData, statsData]) => {
        if (id === fetchIdRef.current) {
          setConges(congesData);
          setStats(statsData);
        }
      })
      .catch((err) => {
        if (id === fetchIdRef.current) {
          setError(err?.response?.data?.message ?? "Impossible de charger les congés");
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

  const annuler = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await cancelLeave(id);
        toast({
          title: "Congé annulé",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
        refresh();
        return true;
      } catch (err: unknown) {
        let message = "Impossible d'annuler ce congé";
        if (err && typeof err === "object" && "response" in err) {
          const resp = (err as { response?: { data?: { message?: string } } }).response;
          if (resp?.data?.message) message = resp.data.message;
        }
        toast({
          title: "Erreur",
          description: message,
          status: "error",
          duration: 4000,
          isClosable: true,
          position: "top-right",
        });
        return false;
      }
    },
    [refresh, toast],
  );

  return { conges, stats, isLoading, error, annuler, refresh };
}
