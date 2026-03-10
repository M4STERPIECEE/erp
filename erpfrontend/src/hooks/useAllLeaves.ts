import { useCallback, useEffect, useReducer, useRef, useState } from "react";
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

type FetchState = { leaves: AdminLeaveResponse[]; stats: AdminLeaveStats | null; isLoading: boolean; error: string | null };
type FetchAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; leaves: AdminLeaveResponse[]; stats: AdminLeaveStats }
  | { type: "FETCH_ERROR"; error: string };

function fetchReducer(state: FetchState, action: FetchAction): FetchState {
  switch (action.type) {
    case "FETCH_START":   return { ...state, isLoading: true, error: null };
    case "FETCH_SUCCESS": return { leaves: action.leaves, stats: action.stats, isLoading: false, error: null };
    case "FETCH_ERROR":   return { ...state, isLoading: false, error: action.error };
    default: return state;
  }
}

export function useAllLeaves(statut?: string, search?: string, departementId?: number): UseAllLeavesReturn {
  const [{ leaves, stats, isLoading, error }, dispatch] = useReducer(fetchReducer, {
    leaves: [], stats: null, isLoading: true, error: null,
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const fetchIdRef = useRef(0);
  const toast = useToast();

  useEffect(() => {
    const id = ++fetchIdRef.current;
    dispatch({ type: "FETCH_START" });
    const params = { statut, search, departementId };

    Promise.all([getAllLeaves(params), getAdminLeaveStats()])
      .then(([leavesData, statsData]) => {
        if (id === fetchIdRef.current)
          dispatch({ type: "FETCH_SUCCESS", leaves: leavesData, stats: statsData });
      })
      .catch((err) => {
        if (id === fetchIdRef.current)
          dispatch({ type: "FETCH_ERROR", error: err?.response?.data?.message ?? "Impossible de charger les congés" });
      });
  }, [refreshKey, statut, search, departementId]);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

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
