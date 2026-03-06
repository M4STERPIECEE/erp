// RequestLeaveModal.tsx
import { useForm, useWatch, Controller } from "react-hook-form";
import {
  Box,
  Flex,
  Button,
  Spinner,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Grid,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { useRequestLeave } from "../hooks/useRequestLeave";
import { LEAVE_TYPE_OPTIONS } from "../types/employee-space.types";
import type { LeaveRequest, LeaveType } from "../types/employee-space.types";

interface RequestLeaveModalProps {
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

const selectWrapperStyles = {
  position: "relative" as const,
  bg: "white", // ← changé pour un rendu plus propre en light mode
  borderWidth: "1px",
  borderColor: borderClr,
  rounded: "lg",
  _focusWithin: { borderColor: "#14b8a6", boxShadow: "0 0 0 3px rgba(20,184,166,0.15)" },
};

const errorSelect = {
  ...selectWrapperStyles,
  borderColor: "red.300",
};

const customSelect = {
  border: "none",
  bg: "transparent",
  color: "gray.900",
  fontSize: "sm",
  pr: 10,
  iconSize: "0",
  _focus: { boxShadow: "none", borderColor: "transparent" },
} as const;

function SelectWrapper({ children, isInvalid }: { children: React.ReactNode; isInvalid?: boolean }) {
  return (
    <Box {...(isInvalid ? errorSelect : selectWrapperStyles)}>
      {children}
      <Box
        as="span"
        className="material-symbols-outlined"
        position="absolute"
        right={3}
        top="50%"
        transform="translateY(-50%)"
        fontSize="20px"
        color="gray.400"
        lineHeight="1"
        pointerEvents="none"
      >
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

const TYPE_LABELS: Record<LeaveType, string> = {
  ANNUEL: "Congé annuel",
  MALADIE: "Congé maladie",
  MATERNITE: "Congé maternité",
  SANS_SOLDE: "Congé sans solde",
};

interface FormValues {
  type: string;
  dateDebut: string;
  dateFin: string;
  motif: string;
}

function countBusinessDays(start: string, end: string): number {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (e < s) return 0;
  let count = 0;
  const current = new Date(s);
  while (current <= e) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

export default function RequestLeaveModal({ isOpen, onClose, onCreated }: RequestLeaveModalProps) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { type: "", dateDebut: "", dateFin: "", motif: "" },
  });

  const { submit, isSubmitting } = useRequestLeave(() => {
    onCreated?.();
  });

  const dateDebut = useWatch({ control, name: "dateDebut" }) ?? "";
  const dateFin = useWatch({ control, name: "dateFin" }) ?? "";
  const joursOuvrables = countBusinessDays(dateDebut, dateFin);

  const onSubmit = async (values: FormValues) => {
    const payload: LeaveRequest = {
      type: values.type as LeaveType,
      dateDebut: values.dateDebut,
      dateFin: values.dateFin,
      motif: values.motif || undefined,
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
    <Modal isOpen={isOpen} onClose={handleClose} size="xl" isCentered>
      <ModalOverlay bg="rgba(15,23,42,0.45)" backdropFilter="blur(6px)" />
      <ModalContent rounded="2xl" fontFamily="'Inter', sans-serif" overflow="hidden" bg="white" color="gray.900">
        <Box h="4px" bgGradient="linear(to-r, #14b8a6, #0d9488)" />
        <ModalHeader px={7} pt={6} pb={2} fontSize="xl" fontWeight="700" color="gray.900" bg="white">
          Demander un congé
        </ModalHeader>
        <ModalCloseButton top={5} right={5} color="gray.500" _hover={{ bg: "gray.100", color: "gray.700" }} />
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody px={7} pb={4} bg="white">
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
              <FormControl isRequired isInvalid={!!errors.type} gridColumn={{ md: "span 2" }}>
                <FieldLabel>Type de congé</FieldLabel>
                <Controller
                  name="type"
                  control={control}
                  rules={{ required: "Le type est obligatoire" }}
                  render={({ field }) => (
                    <Menu matchWidth>
                      <MenuButton
                        as={Button}
                        w="full"
                        h="40px"
                        bg="gray.50"
                        borderWidth="1px"
                        borderColor={errors.type ? "red.300" : "gray.200"}
                        rounded="lg"
                        fontSize="sm"
                        fontWeight="normal"
                        color={field.value ? "gray.900" : "gray.400"}
                        textAlign="left"
                        rightIcon={
                          <Box as="span" className="material-symbols-outlined" fontSize="20px" color="gray.400" lineHeight="1">
                            keyboard_arrow_down
                          </Box>
                        }
                        _hover={{ bg: "gray.100" }}
                        _active={{ bg: "gray.50" }}
                        _focus={{ borderColor: "#14b8a6", boxShadow: "0 0 0 3px rgba(20,184,166,0.15)" }}
                      >
                        {field.value ? TYPE_LABELS[field.value as LeaveType] : "Sélectionner..."}
                      </MenuButton>
                      <MenuList
                        minW="0"
                        rounded="xl"
                        shadow="lg"
                        borderColor="gray.200"
                        p={2}
                        bg="white"
                      >
                        {LEAVE_TYPE_OPTIONS.map((t) => (
                          <MenuItem
                            key={t}
                            rounded="lg"
                            fontSize="sm"
                            color="gray.700"
                            bg={field.value === t ? "teal.50" : "transparent"}
                            fontWeight={field.value === t ? "600" : "normal"}
                            _hover={{ bg: "gray.100" }}
                            onClick={() => field.onChange(t)}
                          >
                            {TYPE_LABELS[t]}
                          </MenuItem>
                        ))}
                      </MenuList>
                    </Menu>
                  )}
                />
                <FormErrorMessage fontSize="xs">{errors.type?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.dateDebut}>
                <FieldLabel>Date de début</FieldLabel>
                <Input
                  type="date"
                  {...customInput}
                  {...(errors.dateDebut ? errorInput : {})}
                  {...register("dateDebut", { required: "La date de début est obligatoire" })}
                />
                <FormErrorMessage fontSize="xs">{errors.dateDebut?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.dateFin}>
                <FieldLabel>Date de fin</FieldLabel>
                <Input
                  type="date"
                  {...customInput}
                  {...(errors.dateFin ? errorInput : {})}
                  {...register("dateFin", {
                    required: "La date de fin est obligatoire",
                    validate: (val) => {
                      if (dateDebut && val < dateDebut) return "La date de fin doit être après la date de début";
                      return true;
                    },
                  })}
                />
                <FormErrorMessage fontSize="xs">{errors.dateFin?.message}</FormErrorMessage>
              </FormControl>

              {joursOuvrables > 0 && (
                <Box gridColumn={{ md: "span 2" }}>
                  <Flex align="center" gap={2} bg="blue.50" p={3} rounded="lg">
                    <Box as="span" className="material-symbols-outlined" fontSize="18px" color="blue.500">
                      info
                    </Box>
                    <Text fontSize="sm" color="blue.700" fontWeight="medium">
                      {joursOuvrables} jour(s) ouvrable(s)
                    </Text>
                  </Flex>
                </Box>
              )}

              <FormControl gridColumn={{ md: "span 2" }}>
                <FieldLabel>Motif (optionnel)</FieldLabel>
                <Textarea
                  placeholder="Décrivez la raison de votre demande..."
                  {...customInput}
                  rows={3}
                  resize="vertical"
                  {...register("motif")}
                />
              </FormControl>
            </Grid>
          </ModalBody>

          <ModalFooter px={7} pt={3} pb={7}>
            <Flex w="full" gap={3}>
              <Button
                flex={1}
                height="44px"
                bg="gray.100"
                color="gray.700"
                fontWeight="600"
                fontSize="sm"
                rounded="xl"
                shadow="sm"
                _hover={{ bg: "gray.200", color: "gray.800", shadow: "md" }}
                _active={{ bg: "gray.300" }}
                onClick={handleClose}
                isDisabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                flex={1}
                height="44px"
                bg="#1E3A5F"
                color="white"
                fontWeight="600"
                fontSize="sm"
                rounded="xl"
                shadow="sm"
                _hover={{ bg: "#16335a", transform: "translateY(-1px)", boxShadow: "0 10px 15px -3px rgba(30,58,95,0.4)" }}
                _active={{ bg: "#12284a", transform: "translateY(0)" }}
                type="submit"
                isLoading={isSubmitting}
                loadingText="Envoi..."
                gap={2}
              >
                {isSubmitting ? <Spinner size="sm" /> : null}
                Soumettre la demande
              </Button>
            </Flex>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}