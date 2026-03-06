import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@chakra-ui/react";
import {
  getAllLeaves,
  getAdminLeaveStats,
  approveLeave as approveLeaveApi,
  rejectLeave as rejectLeaveApi,
} from "../services/leave.service";
import type { AdminLeaveResponse, AdminLeaveStats } from "../types/leave.types";

interface UseAllLeavesReturn {
  leaves: AdminLeaveResponse[];
  stats: AdminLeaveStats | null;
  isLoading: boolean;
  error: string | null;
  approve: (id: number) => Promise<boolean>;
  reject: (id: number) => Promise<boolean>;
  refresh: () => void;
}

export function useAllLeaves(): UseAllLeavesReturn {
  const [leaves, setLeaves] = useState<AdminLeaveResponse[]>([]);
  const [stats, setStats] = useState<AdminLeaveStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const fetchIdRef = useRef(0);
  const toast = useToast();

  useEffect(() => {
    const id = ++fetchIdRef.current;

    Promise.all([getAllLeaves(), getAdminLeaveStats()])
      .then(([leavesData, statsData]) => {
        if (id === fetchIdRef.current) {
          setLeaves(leavesData);
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

  const approve = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await approveLeaveApi(id);
        toast({ title: "Congé approuvé", status: "success", duration: 3000, isClosable: true, position: "top-right" });
        refresh();
        return true;
      } catch {
        toast({ title: "Erreur", description: "Impossible d'approuver ce congé", status: "error", duration: 4000, isClosable: true, position: "top-right" });
        return false;
      }
    },
    [refresh, toast],
  );

  const reject = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await rejectLeaveApi(id);
        toast({ title: "Congé refusé", status: "info", duration: 3000, isClosable: true, position: "top-right" });
        refresh();
        return true;
      } catch {
        toast({ title: "Erreur", description: "Impossible de refuser ce congé", status: "error", duration: 4000, isClosable: true, position: "top-right" });
        return false;
      }
    },
    [refresh, toast],
  );

  return { leaves, stats, isLoading, error, approve, reject, refresh };
}
