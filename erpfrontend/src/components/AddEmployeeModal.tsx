import { useState } from "react";
import {
  Box, Flex, Button,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  FormControl, FormLabel, Input, Select, Grid,
} from "@chakra-ui/react";

type ContratType = "CDI" | "CDD" | "STAGE" | "FREELANCE";
type StatutType = "ACTIF" | "INACTIF" | "SUSPENDU";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
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

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Box {...selectWrapperStyles}>
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

const emptyForm = {
  nom: "",
  prenom: "",
  email: "",
  telephone: "",
  poste: "",
  date_embauche: "",
  departement: "",
  contrat: "" as ContratType | "",
  statut: "ACTIF" as StatutType,
};

export default function AddEmployeeModal({ isOpen, onClose }: AddEmployeeModalProps) {
  const [form, setForm] = useState(emptyForm);

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const handleClose = () => {
    setForm(emptyForm);
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
        <ModalBody px={7} pb={4} bg="white">
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
            <FormControl isRequired>
              <FieldLabel>Nom</FieldLabel>
              <Input {...field("nom")} placeholder="Martin" {...customInput} />
            </FormControl>
            <FormControl isRequired>
              <FieldLabel>Prénom</FieldLabel>
              <Input {...field("prenom")} placeholder="Sophie" {...customInput} />
            </FormControl>
            <FormControl isRequired>
              <FieldLabel>Email</FieldLabel>
              <Input {...field("email")} type="email" placeholder="sophie.m@xyz.com" {...customInput} />
            </FormControl>
            <FormControl>
              <FieldLabel>Téléphone</FieldLabel>
              <Input {...field("telephone")} placeholder="+33 6 12 34 56 78" {...customInput} />
            </FormControl>
            <FormControl isRequired>
              <FieldLabel>Poste</FieldLabel>
              <Input {...field("poste")} placeholder="Développeur Senior" {...customInput} />
            </FormControl>
            <FormControl isRequired>
              <FieldLabel>Date d'embauche</FieldLabel>
              <Input {...field("date_embauche")} type="date" {...customInput} />
            </FormControl>
            <FormControl isRequired>
              <FieldLabel>Département</FieldLabel>
              <SelectWrapper>
                <Select {...field("departement")} {...customSelect}>
                  <option value="">Sélectionner...</option>
                  <option value="Informatique">Informatique</option>
                  <option value="Ressources Humaines">Ressources Humaines</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                </Select>
              </SelectWrapper>
            </FormControl>
            <FormControl isRequired>
              <FieldLabel>Type de contrat</FieldLabel>
              <SelectWrapper>
                <Select {...field("contrat")} {...customSelect}>
                  <option value="">Sélectionner...</option>
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="STAGE">Stage</option>
                  <option value="FREELANCE">Freelance</option>
                </Select>
              </SelectWrapper>
            </FormControl>
            <FormControl isRequired>
              <FieldLabel>Statut</FieldLabel>
              <SelectWrapper>
                <Select {...field("statut")} {...customSelect}>
                  <option value="ACTIF">Actif</option>
                  <option value="INACTIF">Inactif</option>
                  <option value="SUSPENDU">Suspendu</option>
                </Select>
              </SelectWrapper>
            </FormControl>

          </Grid>
        </ModalBody>

        <ModalFooter px={7} pt={2} pb={7} bg="white">
          <Flex w="full" gap={3}>
            <Button
              flex={1} h="44px" bg="gray.100" color="gray.700"
              fontWeight="600" fontSize="sm" rounded="xl"
              _hover={{ bg: "gray.200" }}
              onClick={handleClose}>
              Annuler
            </Button>
            <Button flex={1} h="44px" bg="#14b8a6" color="white"
              fontWeight="600" fontSize="sm" rounded="xl"
              _hover={{ bg: "#0d9488", transform: "translateY(-1px)", boxShadow: "0 10px 15px -3px rgba(20,184,166,0.35)" }}
              _active={{ transform: "translateY(0)" }}
              transition="all 0.15s" leftIcon={<Box as="span" className="material-symbols-outlined" fontSize="18px" lineHeight="1">save</Box>}>
              Enregistrer
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
