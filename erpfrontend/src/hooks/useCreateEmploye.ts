import { useCallback, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { createEmploye } from "../services/employe.service";
import type { CreateEmployeeRequest } from "../types/employe.types";

interface UseCreateEmployeReturn {
  submit: (data: CreateEmployeeRequest) => Promise<boolean>;
  isSubmitting: boolean;
}

export function useCreateEmploye(onSuccess?: () => void): UseCreateEmployeReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const submit = useCallback(
    async (data: CreateEmployeeRequest): Promise<boolean> => {
      setIsSubmitting(true);
      try {
        await createEmploye(data);
        toast({
          title: "Employé créé",
          description: `${data.prenom} ${data.nom} a été ajouté avec succès.`,
          status: "success",
          duration: 4000,
          isClosable: true,
          position: "top-right",
        });
        onSuccess?.();
        return true;
      } catch (err: unknown) {
        let message = "Une erreur est survenue lors de la création.";
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
