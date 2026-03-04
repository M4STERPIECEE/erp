import { useCallback, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { requestLeave } from "../services/employee-space.service";
import type { LeaveRequest } from "../types/employee-space.types";

interface UseRequestLeaveReturn {
  submit: (data: LeaveRequest) => Promise<boolean>;
  isSubmitting: boolean;
}

export function useRequestLeave(onSuccess?: () => void): UseRequestLeaveReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const submit = useCallback(
    async (data: LeaveRequest): Promise<boolean> => {
      setIsSubmitting(true);
      try {
        await requestLeave(data);
        toast({
          title: "Demande envoyée",
          description: "Votre demande de congé a été soumise avec succès.",
          status: "success",
          duration: 4000,
          isClosable: true,
          position: "top-right",
        });
        onSuccess?.();
        return true;
      } catch (err: unknown) {
        let message = "Une erreur est survenue lors de la demande.";
        if (err && typeof err === "object" && "response" in err) {
          const resp = (err as { response?: { data?: { message?: string } } }).response;
          if (resp?.data?.message) message = resp.data.message;
        }
        toast({
          title: "Erreur",
          description: message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [toast, onSuccess],
  );

  return { submit, isSubmitting };
}
