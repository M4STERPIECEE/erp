import { useCallback, useEffect, useRef, useState } from "react";
import { getMyPayslips, downloadPayslipPdf } from "../services/employee-space.service";
import { useToast } from "@chakra-ui/react";
import type { PayslipResponse } from "../types/employee-space.types";

interface UseMyPayslipsReturn {
  fiches: PayslipResponse[];
  isLoading: boolean;
  error: string | null;
  telecharger: (id: number, mois: number, annee: number) => Promise<void>;
  refresh: () => void;
}

export function useMyPayslips(): UseMyPayslipsReturn {
  const [fiches, setFiches] = useState<PayslipResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const fetchIdRef = useRef(0);
  const toast = useToast();

  useEffect(() => {
    const id = ++fetchIdRef.current;

    getMyPayslips()
      .then((data) => {
        if (id === fetchIdRef.current) setFiches(data);
      })
      .catch((err) => {
        if (id === fetchIdRef.current) {
          setError(err?.response?.data?.message ?? "Impossible de charger les fiches de paie");
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

  const telecharger = useCallback(
    async (id: number, mois: number, annee: number) => {
      try {
        const blob = await downloadPayslipPdf(id);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `fiche_paie_${mois}_${annee}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {
        toast({
          title: "Erreur",
          description: "Impossible de télécharger la fiche de paie",
          status: "error",
          duration: 4000,
          isClosable: true,
          position: "top-right",
        });
      }
    },
    [toast],
  );

  return { fiches, isLoading, error, telecharger, refresh };
}
