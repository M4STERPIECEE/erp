import { useForm } from "react-hook-form";
import {
  Box, Flex, Button, Spinner, Text,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  FormControl, FormLabel, FormErrorMessage, Input, Select, Grid,
} from "@chakra-ui/react";
import { useCreateEmploye } from "../hooks/useCreateEmploye";
import { useAuth } from "../hooks/useAuth";
import { CONTRAT_TYPES, DEPARTEMENTS, ROLE_TYPES } from "../types/employe.types";
import type { CreateEmployeeRequest } from "../types/employe.types";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const borderClr = "gray.200";

const customSelect = {
  border: "none",
  bg: "transparent",
  color: "gray.900",
  fontSize: "sm",
  pr: 10,
  iconSize: "0",
  _focus: { boxShadow: "none", borderColor: "transparent" },
} as const;

const selectWrapperStyles = {
  position: "relative" as const,
  bg: "gray.50",
  borderWidth: "1px",
  borderColor: borderClr,
  rounded: "lg",
  _focusWithin: { borderColor: "#14b8a6", boxShadow: "0 0 0 3px rgba(20,184,166,0.15)" },
};

const customInput = {
  bg: "gray.50",
  borderColor: borderClr,
  color: "gray.900",
  rounded: "lg",
  fontSize: "sm",
  _placeholder: { color: "gray.400" },
  _focus: { borderColor: "#14b8a6", boxShadow: "0 0 0 3px rgba(20,184,166,0.15)" },
} as const;

const errorSelect = {
  ...selectWrapperStyles,
  borderColor: "red.300",
};

const errorInput = {
  ...customInput,
  borderColor: "red.300",
};

function SelectWrapper({ children, isInvalid }: { children: React.ReactNode; isInvalid?: boolean }) {
  return (
    <Box {...(isInvalid ? errorSelect : selectWrapperStyles)}>
      {children}
      <Box as="span" className="material-symbols-outlined" position="absolute" right={3} top="50%" transform="translateY(-50%)" fontSize="20px" color="gray.400" lineHeight="1" pointerEvents="none">
        keyboard_arrow_down
      </Box>
    </Box>
  );
}

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
  typeContrat: string;
  salaireBase: string;
  role: string;
}

export default function AddEmployeeModal({ isOpen, onClose, onCreated }: AddEmployeeModalProps) {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      nom: "", prenom: "", email: "", telephone: "",
      dateNaissance: "", dateEmbauche: "", poste: "",
      departementId: "", typeContrat: "", salaireBase: "",
      role: "employe",
    },
  });

  const { submit, isSubmitting } = useCreateEmploye(() => {
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
      typeContrat: values.typeContrat,
      salaireBase: Number(values.salaireBase),
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
              {/* Nom */}
              <FormControl isRequired isInvalid={!!errors.nom}>
                <FieldLabel>Nom</FieldLabel>
                <Input placeholder="Martin" {...customInput} {...(errors.nom ? errorInput : {})}
                  {...register("nom", { required: "Le nom est obligatoire" })} />
                <FormErrorMessage fontSize="xs">{errors.nom?.message}</FormErrorMessage>
              </FormControl>

              {/* Prénom */}
              <FormControl isRequired isInvalid={!!errors.prenom}>
                <FieldLabel>Prénom</FieldLabel>
                <Input placeholder="Sophie" {...customInput} {...(errors.prenom ? errorInput : {})}
                  {...register("prenom", { required: "Le prénom est obligatoire" })} />
                <FormErrorMessage fontSize="xs">{errors.prenom?.message}</FormErrorMessage>
              </FormControl>

              {/* Email */}
              <FormControl isRequired isInvalid={!!errors.email}>
                <FieldLabel>Email</FieldLabel>
                <Input type="email" placeholder="sophie.m@xyz.com" {...customInput} {...(errors.email ? errorInput : {})}
                  {...register("email", {
                    required: "L'email est obligatoire",
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email invalide" },
                  })} />
                <FormErrorMessage fontSize="xs">{errors.email?.message}</FormErrorMessage>
              </FormControl>

              {/* Téléphone */}
              <FormControl>
                <FieldLabel>Téléphone</FieldLabel>
                <Input placeholder="+33 6 12 34 56 78" {...customInput} {...register("telephone")} />
              </FormControl>

              {/* Date de naissance */}
              <FormControl>
                <FieldLabel>Date de naissance</FieldLabel>
                <Input type="date" {...customInput} {...register("dateNaissance")} />
              </FormControl>

              {/* Date d'embauche */}
              <FormControl isRequired isInvalid={!!errors.dateEmbauche}>
                <FieldLabel>Date d'embauche</FieldLabel>
                <Input type="date" {...customInput} {...(errors.dateEmbauche ? errorInput : {})}
                  {...register("dateEmbauche", { required: "La date d'embauche est obligatoire" })} />
                <FormErrorMessage fontSize="xs">{errors.dateEmbauche?.message}</FormErrorMessage>
              </FormControl>

              {/* Poste */}
              <FormControl isRequired isInvalid={!!errors.poste}>
                <FieldLabel>Poste</FieldLabel>
                <Input placeholder="Développeur Senior" {...customInput} {...(errors.poste ? errorInput : {})}
                  {...register("poste", { required: "Le poste est obligatoire" })} />
                <FormErrorMessage fontSize="xs">{errors.poste?.message}</FormErrorMessage>
              </FormControl>

              {/* Salaire de base */}
              <FormControl isRequired isInvalid={!!errors.salaireBase}>
                <FieldLabel>Salaire de base</FieldLabel>
                <Input type="number" step="0.01" placeholder="3500.00" {...customInput} {...(errors.salaireBase ? errorInput : {})}
                  {...register("salaireBase", {
                    required: "Le salaire est obligatoire",
                    min: { value: 0.01, message: "Le salaire doit être positif" },
                  })} />
                <FormErrorMessage fontSize="xs">{errors.salaireBase?.message}</FormErrorMessage>
              </FormControl>

              {/* Département */}
              <FormControl isRequired isInvalid={!!errors.departementId}>
                <FieldLabel>Département</FieldLabel>
                <SelectWrapper isInvalid={!!errors.departementId}>
                  <Select {...customSelect}
                    {...register("departementId", { required: "Le département est obligatoire" })}>
                    <option value="">Sélectionner...</option>
                    {DEPARTEMENTS.map((d) => (
                      <option key={d.id} value={d.id}>{d.nom}</option>
                    ))}
                  </Select>
                </SelectWrapper>
                <FormErrorMessage fontSize="xs">{errors.departementId?.message}</FormErrorMessage>
              </FormControl>

              {/* Type de contrat */}
              <FormControl isRequired isInvalid={!!errors.typeContrat}>
                <FieldLabel>Type de contrat</FieldLabel>
                <SelectWrapper isInvalid={!!errors.typeContrat}>
                  <Select {...customSelect}
                    {...register("typeContrat", { required: "Le type de contrat est obligatoire" })}>
                    <option value="">Sélectionner...</option>
                    {CONTRAT_TYPES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </SelectWrapper>
                <FormErrorMessage fontSize="xs">{errors.typeContrat?.message}</FormErrorMessage>
              </FormControl>

              {/* Rôle (admin only) */}
              {isAdmin && (
                <FormControl isRequired isInvalid={!!errors.role}>
                  <FieldLabel>Rôle Keycloak</FieldLabel>
                  <SelectWrapper isInvalid={!!errors.role}>
                    <Select {...customSelect}
                      {...register("role", { required: "Le rôle est obligatoire" })}>
                      {ROLE_TYPES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </Select>
                  </SelectWrapper>
                  <FormErrorMessage fontSize="xs">{errors.role?.message}</FormErrorMessage>
                </FormControl>
              )}
            </Grid>
          </ModalBody>

          <ModalFooter px={7} pt={2} pb={7} bg="white">
            <Flex w="full" gap={3}>
              <Button
                flex={1} h="44px" bg="gray.100" color="gray.700"
                fontWeight="600" fontSize="sm" rounded="xl"
                _hover={{ bg: "gray.200" }}
                onClick={handleClose}
                isDisabled={isSubmitting}>
                Annuler
              </Button>
              <Button
                type="submit"
                flex={1} h="44px" bg="#14b8a6" color="white"
                fontWeight="600" fontSize="sm" rounded="xl"
                _hover={{ bg: "#0d9488", transform: "translateY(-1px)", boxShadow: "0 10px 15px -3px rgba(20,184,166,0.35)" }}
                _active={{ transform: "translateY(0)" }}
                transition="all 0.15s"
                isLoading={isSubmitting}
                spinner={<Spinner size="sm" />}
                leftIcon={!isSubmitting ? <Box as="span" className="material-symbols-outlined" fontSize="18px" lineHeight="1">save</Box> : undefined}>
                <Text>Enregistrer</Text>
              </Button>
            </Flex>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
