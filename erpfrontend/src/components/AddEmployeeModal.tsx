import { useForm, useWatch, Controller } from "react-hook-form";
import {
  Box, Flex, Button, Spinner, Text,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  FormControl, FormLabel, FormErrorMessage, Input, Grid,
  Menu, MenuButton, MenuList, MenuItem,
} from "@chakra-ui/react";
import { useCreateEmployee } from "../hooks/useCreateEmployee";
import { useAuth } from "../hooks/useAuth";
import { CONTRACT_TYPES, ROLE_TYPES } from "../types/employee.types";
import type { CreateEmployeeRequest } from "../types/employee.types";
import { useDepartments } from "../hooks/useDepartments";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}
const borderClr = "gray.200";

const customInput = {
  bg: "gray.50",
  borderColor: borderClr,
  color: "gray.900",
  rounded: "lg",
  fontSize: "sm",
  _placeholder: { color: "gray.400" },
  _focus: { borderColor: "#14b8a6", boxShadow: "0 0 0 3px rgba(20,184,166,0.15)" },
} as const;

const errorInput = {
  ...customInput,
  borderColor: "red.300",
};

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
  _focus: { borderColor: "#14b8a6", boxShadow: "0 0 0 3px rgba(20,184,166,0.15)" },
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

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <FormLabel fontSize="sm" fontWeight="medium" color="gray.700" mb={1}>
      {children}
    </FormLabel>
  );
}

interface FormValues {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  dateNaissance: string;
  dateEmbauche: string;
  poste: string;
  departementId: string;
  contractType: string;
  salaireBase: string;
  dateFinContrat: string;
  role: string;
}

export default function AddEmployeeModal({ isOpen, onClose, onCreated }: AddEmployeeModalProps) {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");
  const { departements } = useDepartments();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      nom: "", prenom: "", email: "", telephone: "",
      dateNaissance: "", dateEmbauche: "", poste: "",
      departementId: "", contractType: "", salaireBase: "",
      dateFinContrat: "", role: "employe",
    },
  });

  const selectedContractType = useWatch({ control, name: "contractType" });
  const needsEndDate = selectedContractType !== "" && selectedContractType !== "CDI";

  const { submit, isSubmitting } = useCreateEmployee(() => {
    onCreated?.();
  });

  const onSubmit = async (values: FormValues) => {
    const payload: CreateEmployeeRequest = {
      nom: values.nom,
      prenom: values.prenom,
      email: values.email,
      telephone: values.telephone || undefined,
      dateNaissance: values.dateNaissance || undefined,
      dateEmbauche: values.dateEmbauche,
      poste: values.poste,
      departementId: Number(values.departementId),
      contractType: values.contractType,
      salaireBase: Number(values.salaireBase),
      dateFinContrat: values.dateFinContrat || undefined,
      role: values.role,
    };

    const ok = await submit(payload);
    if (ok) {
      reset();
      onClose();
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl" isCentered>
      <ModalOverlay bg="rgba(15,23,42,0.45)" backdropFilter="blur(6px)" />
      <ModalContent rounded="2xl" fontFamily="'Inter', sans-serif" overflow="hidden" bg="white" color="gray.900">
        <Box h="4px" bgGradient="linear(to-r, #14b8a6, #0d9488)" />
        <ModalHeader px={7} pt={6} pb={2} fontSize="xl" fontWeight="700" color="gray.900" bg="white">
          Ajouter un employé
        </ModalHeader>
        <ModalCloseButton top={5} right={5} color="gray.500" _hover={{ bg: "gray.100", color: "gray.700" }} />
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody px={7} pb={4} bg="white">
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
              <FormControl isRequired isInvalid={!!errors.nom}>
                <FieldLabel>Nom</FieldLabel>
                <Input placeholder="Martin" {...customInput} {...(errors.nom ? errorInput : {})}
                  {...register("nom", { required: "Le nom est obligatoire" })} />
                <FormErrorMessage fontSize="xs">{errors.nom?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isRequired isInvalid={!!errors.prenom}>
                <FieldLabel>Prénom</FieldLabel>
                <Input placeholder="Sophie" {...customInput} {...(errors.prenom ? errorInput : {})}
                  {...register("prenom", { required: "Le prénom est obligatoire" })} />
                <FormErrorMessage fontSize="xs">{errors.prenom?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isRequired isInvalid={!!errors.email}>
                <FieldLabel>Email</FieldLabel>
                <Input type="email" placeholder="sophie.m@xyz.com" {...customInput} {...(errors.email ? errorInput : {})}
                  {...register("email", {
                    required: "L'email est obligatoire",
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email invalide" },
                  })} />
                <FormErrorMessage fontSize="xs">{errors.email?.message}</FormErrorMessage>
              </FormControl>
              <FormControl>
                <FieldLabel>Téléphone</FieldLabel>
                <Input placeholder="+33 6 12 34 56 78" {...customInput} {...register("telephone")} />
              </FormControl>
              <FormControl>
                <FieldLabel>Date de naissance</FieldLabel>
                <Input type="date" {...customInput} {...register("dateNaissance")} />
              </FormControl>
              <FormControl isRequired isInvalid={!!errors.dateEmbauche}>
                <FieldLabel>Date d'embauche</FieldLabel>
                <Input type="date" {...customInput} {...(errors.dateEmbauche ? errorInput : {})}
                  {...register("dateEmbauche", { required: "La date d'embauche est obligatoire" })} />
                <FormErrorMessage fontSize="xs">{errors.dateEmbauche?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isRequired isInvalid={!!errors.poste}>
                <FieldLabel>Poste</FieldLabel>
                <Input placeholder="Développeur Senior" {...customInput} {...(errors.poste ? errorInput : {})}
                  {...register("poste", { required: "Le poste est obligatoire" })} />
                <FormErrorMessage fontSize="xs">{errors.poste?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isRequired isInvalid={!!errors.salaireBase}>
                <FieldLabel>Salaire de base</FieldLabel>
                <Input type="number" step="0.01" placeholder="3500.00" {...customInput} {...(errors.salaireBase ? errorInput : {})}
                  {...register("salaireBase", {
                    required: "Le salaire est obligatoire",
                    min: { value: 0.01, message: "Le salaire doit être positif" },
                  })} />
                <FormErrorMessage fontSize="xs">{errors.salaireBase?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isRequired isInvalid={!!errors.departementId}>
                <FieldLabel>Département</FieldLabel>
                <Controller
                  name="departementId"
                  control={control}
                  rules={{ required: "Le département est obligatoire" }}
                  render={({ field }) => (
                    <Menu matchWidth>
                      <MenuButton as={Button} {...menuButtonStyles(!!errors.departementId, !!field.value)} rightIcon={chevron}>
                        {field.value ? departements.find((d) => String(d.id) === field.value)?.nom ?? "Sélectionner..." : "Sélectionner..."}
                      </MenuButton>
                      <MenuList {...menuListStyles}>
                        {departements.map((d) => (
                          <MenuItem key={d.id} {...menuItemStyles(field.value === String(d.id))} onClick={() => field.onChange(String(d.id))}>
                            {d.nom}
                          </MenuItem>
                        ))}
                      </MenuList>
                    </Menu>
                  )}
                />
                <FormErrorMessage fontSize="xs">{errors.departementId?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isRequired isInvalid={!!errors.contractType}>
                <FieldLabel>Type de contrat</FieldLabel>
                <Controller
                  name="contractType"
                  control={control}
                  rules={{ required: "Le type de contrat est obligatoire" }}
                  render={({ field }) => (
                    <Menu matchWidth>
                      <MenuButton as={Button} {...menuButtonStyles(!!errors.contractType, !!field.value)} rightIcon={chevron}>
                        {field.value || "Sélectionner..."}
                      </MenuButton>
                      <MenuList {...menuListStyles}>
                        {CONTRACT_TYPES.map((c) => (
                          <MenuItem key={c} {...menuItemStyles(field.value === c)} onClick={() => field.onChange(c)}>
                            {c}
                          </MenuItem>
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
                  <Input type="date" {...customInput} {...(errors.dateFinContrat ? errorInput : {})}
                    {...register("dateFinContrat", {
                      required: needsEndDate ? "La date de fin est obligatoire pour ce type de contrat" : false,
                    })} />
                  <FormErrorMessage fontSize="xs">{errors.dateFinContrat?.message}</FormErrorMessage>
                </FormControl>
              )}
              {isAdmin && (
                <FormControl isRequired isInvalid={!!errors.role}>
                  <FieldLabel>Rôle</FieldLabel>
                  <Controller
                    name="role"
                    control={control}
                    rules={{ required: "Le rôle est obligatoire" }}
                    render={({ field }) => (
                      <Menu matchWidth>
                        <MenuButton as={Button} {...menuButtonStyles(!!errors.role, true)} rightIcon={chevron}>
                          {field.value || "Sélectionner..."}
                        </MenuButton>
                        <MenuList {...menuListStyles}>
                          {ROLE_TYPES.map((r) => (
                            <MenuItem key={r} {...menuItemStyles(field.value === r)} onClick={() => field.onChange(r)}>
                              {r}
                            </MenuItem>
                          ))}
                        </MenuList>
                      </Menu>
                    )}
                  />
                  <FormErrorMessage fontSize="xs">{errors.role?.message}</FormErrorMessage>
                </FormControl>
              )}
            </Grid>
          </ModalBody>
          <ModalFooter px={7} pt={2} pb={7} bg="white">
            <Flex w="full" gap={3}>
              <Button flex={1} h="44px" bg="gray.100" color="gray.700" fontWeight="600" fontSize="sm" rounded="xl" _hover={{ bg: "gray.200" }} onClick={handleClose} isDisabled={isSubmitting}>
                Annuler
              </Button>
              <Button type="submit" flex={1} h="44px" bg="#14b8a6" color="white" fontWeight="600" fontSize="sm" rounded="xl" _hover={{ bg: "#0d9488", transform: "translateY(-1px)", boxShadow: "0 10px 15px -3px rgba(20,184,166,0.35)" }} _active={{ transform: "translateY(0)" }} transition="all 0.15s" isLoading={isSubmitting} spinner={<Spinner size="sm" />} leftIcon={!isSubmitting ? <Box as="span" className="material-symbols-outlined" fontSize="18px" lineHeight="1">save</Box> : undefined}>
                <Text>Enregistrer</Text>
              </Button>
            </Flex>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
