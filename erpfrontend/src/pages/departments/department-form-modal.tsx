import { useEffect, useState } from "react";
import {
  Box, Flex, Button, Spinner,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  FormControl, FormLabel, Input, Textarea,
  Menu, MenuButton, MenuList, MenuItem,
  useToast,
} from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { createDepartment, updateDepartment } from "../../services/department.service";
import { getEmployees } from "../../services/employee.service";
import type { EmployeeResponse } from "../../types/employee.types";
import type { DepartmentResponse, CreateDepartmentRequest } from "../../types/department.types";

const menuButtonStyles = (isInvalid: boolean, hasValue: boolean) => ({
  w: "full",
  h: "40px",
  bg: "gray.50",
  borderWidth: "1px",
  borderColor: isInvalid ? "red.300" : "gray.200",
  rounded: "lg",
  fontSize: "sm",
  fontWeight: "normal",
  color: hasValue ? "gray.900" : "gray.400",
  textAlign: "left" as const,
  _hover: { bg: "gray.100" },
  _active: { bg: "gray.50" },
  _focus: { borderColor: "#14b8a6", boxShadow: "0 0 0 3px rgba(20,184,166,0.12)" },
});

const menuListStyles = {
  minW: "0",
  rounded: "xl",
  shadow: "lg",
  borderColor: "gray.200",
  p: 2,
  bg: "white",
};

function menuItemStyles(selected: boolean) {
  return {
    rounded: "lg",
    fontSize: "sm",
    color: "gray.700",
    bg: selected ? "teal.50" : "transparent",
    fontWeight: selected ? "600" : "normal",
    _hover: { bg: "gray.100" },
  };
}

const chevron = (
  <Box as="span" className="material-symbols-outlined" fontSize="20px" color="gray.400" lineHeight="1">
    keyboard_arrow_down
  </Box>
);

export default function DepartementFormModal({ isOpen, onClose, onSaved, editTarget }: {
  isOpen: boolean; onClose: () => void; onSaved: () => void;
  editTarget: DepartmentResponse | null;
}) {
  const { register, handleSubmit, reset, control, formState: { isSubmitting } } = useForm<CreateDepartmentRequest>({
    defaultValues: editTarget
      ? { nom: editTarget.nom, description: editTarget.description ?? "", responsableId: editTarget.responsableId ?? undefined }
      : { nom: "", description: "", responsableId: undefined },
  });
  const toast = useToast();
  const [employes, setEmployes] = useState<EmployeeResponse[]>([]);

  useEffect(() => {
    getEmployees({ size: 500 }).then(
      (res) => setEmployes(res.content),
      () => { /* ignore */ },
    );
  }, []);

  const onSubmit = async (values: CreateDepartmentRequest) => {
    const payload: CreateDepartmentRequest = {
      ...values,
      responsableId: values.responsableId ? Number(values.responsableId) : null,
    };
    try {
      if (editTarget) {
        await updateDepartment(editTarget.id, payload);
        toast({ title: "Département modifié", status: "success", duration: 3000, isClosable: true, position: "top-right" });
      } else {
        await createDepartment(payload);
        toast({ title: "Département créé", status: "success", duration: 3000, isClosable: true, position: "top-right" });
      }
      reset();
      onClose();
      onSaved();
    } catch {
      toast({ title: "Erreur", description: "Impossible de sauvegarder le département.", status: "error", duration: 5000, isClosable: true, position: "top-right" });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md" closeOnOverlayClick={false}>
      <ModalOverlay bg="rgba(15,23,42,0.45)" backdropFilter="blur(6px)" />
      <ModalContent rounded="2xl" mx={4} bg="white" overflow="hidden">
        <Box h="4px" bgGradient="linear(to-r, #14b8a6, #0d9488)" />
        <ModalHeader fontSize="lg" fontWeight="700" color="gray.900" pt={6}>
          {editTarget ? "Modifier le département" : "Nouveau département"}
        </ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody display="flex" flexDir="column" gap={4}>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">Nom</FormLabel>
              <Input {...register("nom", { required: true })} placeholder="Ex: Ressources Humaines" bg="gray.50" color="gray.900" borderColor="gray.200" rounded="lg" fontSize="sm" _focus={{ borderColor: "#14b8a6", boxShadow: "0 0 0 3px rgba(20,184,166,0.12)" }} />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">Description</FormLabel>
              <Textarea {...register("description")} placeholder="Description du département..." bg="gray.50" color="gray.900" borderColor="gray.200" rounded="lg" fontSize="sm" rows={3} _focus={{ borderColor: "#14b8a6", boxShadow: "0 0 0 3px rgba(20,184,166,0.12)" }} />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">Responsable</FormLabel>
              <Controller
                name="responsableId"
                control={control}
                render={({ field }) => {
                  const selectedEmployee = employes.find((e) => e.id === Number(field.value));
                  return (
                    <Menu matchWidth>
                      <MenuButton
                        as={Button}
                        {...menuButtonStyles(false, !!field.value)}
                        rightIcon={chevron}
                      >
                        {selectedEmployee
                          ? `${selectedEmployee.prenom} ${selectedEmployee.nom} — ${selectedEmployee.poste}`
                          : "Aucun responsable"}
                      </MenuButton>
                      <MenuList {...menuListStyles}>
                        <MenuItem
                          {...menuItemStyles(false)}
                          onClick={() => field.onChange(undefined)}
                        >
                          Aucun responsable
                        </MenuItem>
                        {employes.map((e) => (
                          <MenuItem
                            key={e.id}
                            {...menuItemStyles(Number(field.value) === e.id)}
                            onClick={() => field.onChange(e.id)}
                          >
                            {e.prenom} {e.nom} — {e.poste}
                          </MenuItem>
                        ))}
                      </MenuList>
                    </Menu>
                  );
                }}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter pb={6}>
            <Flex w="full" gap={3}>
              <Button flex={1} h="44px" bg="gray.100" color="gray.700" fontWeight="600" fontSize="sm" rounded="xl" _hover={{ bg: "gray.200" }} onClick={onClose} isDisabled={isSubmitting}>
                Annuler
              </Button>
              <Button flex={1} h="44px" bg="#14b8a6" color="white" fontWeight="600" fontSize="sm" rounded="xl" _hover={{ bg: "#0d9488" }} type="submit" isLoading={isSubmitting} spinner={<Spinner size="sm" />}>
                {editTarget ? "Enregistrer" : "Créer"}
              </Button>
            </Flex>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
