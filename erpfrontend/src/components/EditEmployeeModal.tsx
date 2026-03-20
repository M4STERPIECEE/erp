import { useEffect, useState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import {
  Box, Flex, Button, Spinner, Text,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  FormControl, FormLabel, FormErrorMessage, Input, Grid,
  Menu, MenuButton, MenuList, MenuItem,
  useToast,
} from "@chakra-ui/react";
import type { EmployeeResponse, UpdateEmployeeRequest } from "../types/employee.types";
import { CONTRACT_TYPES, STATUS_TYPES } from "../types/employee.types";
import { updateEmployee } from "../services/employee.service";
import { useDepartments } from "../hooks/useDepartments";

interface EditEmployeeModalProps {
  employee: EmployeeResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

const borderClr = "gray.200";

const customInput = {
  bg: "gray.50",
  borderColor: borderClr,
  color: "gray.900",
  rounded: "lg",
  fontSize: "sm",
  _placeholder: { color: "gray.400" },
  _focus: { borderColor: "#2563eb", boxShadow: "0 0 0 3px rgba(37,99,235,0.15)" },
} as const;

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
  _focus: { borderColor: "#2563eb", boxShadow: "0 0 0 3px rgba(37,99,235,0.15)" },
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
    bg: selected ? "blue.50" : "transparent",
    fontWeight: selected ? "600" : "normal",
    _hover: { bg: "gray.100" },
  };
}

const chevron = (
  <Box as="span" className="material-symbols-outlined" fontSize="20px" color="gray.400" lineHeight="1">
    keyboard_arrow_down
  </Box>
);

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <FormLabel fontSize="sm" fontWeight="medium" color="gray.700" mb={1}>{children}</FormLabel>
  );
}

interface FormValues {
  nom: string;
  prenom: string;
  telephone: string;
  dateNaissance: string;
  dateEmbauche: string;
  poste: string;
  statut: string;
  departementId: string;
  contractType: string;
  salaireBase: string;
  dateFinContrat: string;
}

export default function EditEmployeeModal({ employee, isOpen, onClose, onUpdated }: EditEmployeeModalProps) {
  const { departements } = useDepartments();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      nom: "", prenom: "", telephone: "", dateNaissance: "", dateEmbauche: "",
      poste: "", statut: "ACTIF", departementId: "", contractType: "", salaireBase: "", dateFinContrat: "",
    },
  });

  const selectedContractType = useWatch({ control, name: "contractType" });
  const needsEndDate = selectedContractType !== "" && selectedContractType !== "CDI";

  useEffect(() => {
    if (employee && isOpen) {
      reset({
        nom: employee.nom,
        prenom: employee.prenom,
        telephone: employee.telephone ?? "",
        dateNaissance: employee.dateNaissance ?? "",
        dateEmbauche: employee.dateEmbauche,
        poste: employee.poste,
        statut: employee.statut,
        departementId: employee.departementId != null ? String(employee.departementId) : "",
        contractType: employee.contractType ?? "",
        salaireBase: employee.salaireBase != null ? String(employee.salaireBase) : "",
        dateFinContrat: "",
      });
    }
  }, [employee, isOpen, reset]);

  const onSubmit = async (values: FormValues) => {
    if (!employee) return;
    setIsSubmitting(true);
    try {
      const payload: UpdateEmployeeRequest = {
        nom: values.nom,
        prenom: values.prenom,
        telephone: values.telephone || undefined,
        dateNaissance: values.dateNaissance || undefined,
        dateEmbauche: values.dateEmbauche,
        poste: values.poste,
        statut: values.statut,
        departementId: Number(values.departementId),
        contractType: values.contractType,
        salaireBase: Number(values.salaireBase),
        dateFinContrat: values.dateFinContrat || undefined,
      };
      await updateEmployee(employee.id, payload);
      toast({
        title: "Employé mis à jour",
        description: `${values.prenom} ${values.nom} a été modifié avec succès.`,
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
      onUpdated?.();
      onClose();
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de modifier cet employé.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!employee) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl" isCentered>
      <ModalOverlay bg="rgba(15,23,42,0.45)" backdropFilter="blur(6px)" />
      <ModalContent rounded="2xl" fontFamily="'Inter', sans-serif" overflow="hidden" bg="white" color="gray.900">
        <Box h="4px" bgGradient="linear(to-r, #2563eb, #1d4ed8)" />
        <ModalHeader px={7} pt={6} pb={2} bg="white">
          <Text fontSize="xl" fontWeight="700" color="gray.900">Modifier l'employé</Text>
          <Text fontSize="sm" fontWeight="normal" color="gray.500" mt={0.5}>{employee.prenom} {employee.nom} · {employee.matricule}</Text>
        </ModalHeader>
        <ModalCloseButton top={5} right={5} color="gray.500" _hover={{ bg: "gray.100", color: "gray.700" }} />
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody px={7} pb={4} bg="white">
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
              <FormControl isRequired isInvalid={!!errors.nom}>
                <FieldLabel>Nom</FieldLabel>
                <Input {...customInput} {...register("nom", { required: "Le nom est obligatoire" })} />
                <FormErrorMessage fontSize="xs">{errors.nom?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isRequired isInvalid={!!errors.prenom}>
                <FieldLabel>Prénom</FieldLabel>
                <Input {...customInput} {...register("prenom", { required: "Le prénom est obligatoire" })} />
                <FormErrorMessage fontSize="xs">{errors.prenom?.message}</FormErrorMessage>
              </FormControl>
              <FormControl>
                <FieldLabel>Téléphone</FieldLabel>
                <Input {...customInput} {...register("telephone")} />
              </FormControl>
              <FormControl>
                <FieldLabel>Date de naissance</FieldLabel>
                <Input type="date" {...customInput} {...register("dateNaissance")} />
              </FormControl>
              <FormControl isRequired isInvalid={!!errors.dateEmbauche}>
                <FieldLabel>Date d'embauche</FieldLabel>
                <Input type="date" {...customInput} {...register("dateEmbauche", { required: "La date d'embauche est obligatoire" })} />
                <FormErrorMessage fontSize="xs">{errors.dateEmbauche?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isRequired isInvalid={!!errors.poste}>
                <FieldLabel>Poste</FieldLabel>
                <Input {...customInput} {...register("poste", { required: "Le poste est obligatoire" })} />
                <FormErrorMessage fontSize="xs">{errors.poste?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isRequired isInvalid={!!errors.salaireBase}>
                <FieldLabel>Salaire de base</FieldLabel>
                <Input type="number" step="0.01" {...customInput} {...register("salaireBase", {
                  required: "Le salaire est obligatoire",
                  min: { value: 0.01, message: "Le salaire doit être positif" },
                })} />
                <FormErrorMessage fontSize="xs">{errors.salaireBase?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isRequired isInvalid={!!errors.statut}>
                <FieldLabel>Statut</FieldLabel>
                <Controller name="statut" control={control} rules={{ required: "Le statut est obligatoire" }}
                  render={({ field }) => (
                    <Menu matchWidth>
                      <MenuButton as={Button} {...menuButtonStyles(!!errors.statut, !!field.value)} rightIcon={chevron}>
                        {field.value || "Sélectionner..."}
                      </MenuButton>
                      <MenuList {...menuListStyles}>
                        {STATUS_TYPES.map((s) => (
                          <MenuItem key={s} {...menuItemStyles(field.value === s)} onClick={() => field.onChange(s)}>{s}</MenuItem>
                        ))}
                      </MenuList>
                    </Menu>
                  )}
                />
                <FormErrorMessage fontSize="xs">{errors.statut?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isRequired isInvalid={!!errors.departementId}>
                <FieldLabel>Département</FieldLabel>
                <Controller name="departementId" control={control} rules={{ required: "Le département est obligatoire" }}
                  render={({ field }) => (
                    <Menu matchWidth>
                      <MenuButton as={Button} {...menuButtonStyles(!!errors.departementId, !!field.value)} rightIcon={chevron}>
                        {field.value ? departements.find((d) => String(d.id) === field.value)?.nom ?? "Sélectionner..." : "Sélectionner..."}
                      </MenuButton>
                      <MenuList {...menuListStyles}>
                        {departements.map((d) => (
                          <MenuItem key={d.id} {...menuItemStyles(field.value === String(d.id))} onClick={() => field.onChange(String(d.id))}>{d.nom}</MenuItem>
                        ))}
                      </MenuList>
                    </Menu>
                  )}
                />
                <FormErrorMessage fontSize="xs">{errors.departementId?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isRequired isInvalid={!!errors.contractType}>
                <FieldLabel>Type de contrat</FieldLabel>
                <Controller name="contractType" control={control} rules={{ required: "Le type de contrat est obligatoire" }}
                  render={({ field }) => (
                    <Menu matchWidth>
                      <MenuButton as={Button} {...menuButtonStyles(!!errors.contractType, !!field.value)} rightIcon={chevron}>
                        {field.value || "Sélectionner..."}
                      </MenuButton>
                      <MenuList {...menuListStyles}>
                        {CONTRACT_TYPES.map((c) => (
                          <MenuItem key={c} {...menuItemStyles(field.value === c)} onClick={() => field.onChange(c)}>{c}</MenuItem>
                        ))}
                      </MenuList>
                    </Menu>
                  )}
                />
                <FormErrorMessage fontSize="xs">{errors.contractType?.message}</FormErrorMessage>
              </FormControl>
              {needsEndDate && (
                <FormControl isRequired isInvalid={!!errors.dateFinContrat}>
                  <FieldLabel>Date fin de contrat</FieldLabel>
                  <Input type="date" {...customInput} {...register("dateFinContrat", {
                    required: needsEndDate ? "La date de fin est obligatoire pour ce type de contrat" : false,
                  })} />
                  <FormErrorMessage fontSize="xs">{errors.dateFinContrat?.message}</FormErrorMessage>
                </FormControl>
              )}
            </Grid>
          </ModalBody>
          <ModalFooter px={7} pt={2} pb={7} bg="white">
            <Flex w="full" gap={3}>
              <Button flex={1} h="44px" bg="gray.100" color="gray.700" fontWeight="600" fontSize="sm" rounded="xl" _hover={{ bg: "gray.200" }} onClick={handleClose} isDisabled={isSubmitting}>
                Annuler
              </Button>
              <Button type="submit" flex={1} h="44px" bg="#2563eb" color="white" fontWeight="600" fontSize="sm" rounded="xl" _hover={{ bg: "#1d4ed8", transform: "translateY(-1px)", boxShadow: "0 10px 15px -3px rgba(37,99,235,0.35)" }} _active={{ transform: "translateY(0)" }} transition="all 0.15s" isLoading={isSubmitting} spinner={<Spinner size="sm" />} leftIcon={!isSubmitting ? <Box as="span" className="material-symbols-outlined" fontSize="18px" lineHeight="1">save</Box> : undefined}>
                <Text>Enregistrer</Text>
              </Button>
            </Flex>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
