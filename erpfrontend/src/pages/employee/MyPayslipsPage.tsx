import { useMemo, useState } from "react";
import {Badge, Box, Button, Flex, Grid, Heading, IconButton, Select, Spinner, Table, Tbody, Td, Text, Th, Thead, Tr,} from "@chakra-ui/react";
import { useMyPayslips } from "../../hooks/useMyPayslips";
import type { PayslipResponse } from "../../types/employee-space.types";

const MOIS_LABELS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function formatAriary(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + " €";
}

function capitalizeFirst(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function statutColor(statut: string): string {
  if (statut === "PAYEE") return "green";
  if (statut === "VALIDEE") return "blue";
  return "yellow";
}

function statutLabel(statut: string): string {
  if (statut === "PAYEE") return "Payé";
  if (statut === "VALIDEE") return "Validée";
  return statut;
}

function formatMonthYear(payslip?: PayslipResponse): string {
  if (!payslip) return "—";
  return `${MOIS_LABELS[payslip.mois - 1]} ${payslip.annee}`;
}

function formatDepositDate(payslip?: PayslipResponse): string {
  if (!payslip) return "—";

  const date = new Date(payslip.annee, payslip.mois - 1, 28);
  return `Déposée le ${capitalizeFirst(date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }))}`;
}

function formatNextDueDate(payslip?: PayslipResponse): string {
  if (!payslip) return "—";

  const date = new Date(payslip.annee, payslip.mois, 28);
  return `Prévue pour le ${capitalizeFirst(date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }))}`;
}

export default function MyPayslipsPage() {
  const { fiches, isLoading, error, telecharger } = useMyPayslips();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const sortedFiches = useMemo(
    () => [...fiches].sort((a, b) => b.annee - a.annee || b.mois - a.mois),
    [fiches],
  );

  const years = useMemo(
    () => Array.from(new Set(sortedFiches.map((f) => f.annee))).sort((a, b) => b - a),
    [sortedFiches],
  );

  const activeSelectedYear = selectedYear !== null && years.includes(selectedYear) ? selectedYear : years[0] ?? null;

  const displayFiches = useMemo(
    () => (activeSelectedYear === null ? sortedFiches : sortedFiches.filter((f) => f.annee === activeSelectedYear)),
    [activeSelectedYear, sortedFiches],
  );

  const latestPayslip = sortedFiches[0];

  const annualSummary = useMemo(() => {
    return displayFiches.reduce(
      (acc, fiche) => ({
        totalNet: acc.totalNet + fiche.salaireNet,
        socialCharges: acc.socialCharges + fiche.cotisationsTotal,
        incomeTax: acc.incomeTax + fiche.deductionAbsences,
      }),
      { totalNet: 0, socialCharges: 0, incomeTax: 0 },
    );
  }, [displayFiches]);

  if (isLoading) {
    return (
      <Flex h="full" align="center" justify="center" direction="column" gap={4}>
        <Spinner size="xl" color="#1E3A5F" thickness="3px" />
        <Text color="gray.500" fontSize="sm">Chargement des fiches de paie…</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex h="full" align="center" justify="center" direction="column" gap={4}>
        <Box as="span" className="material-symbols-outlined" fontSize="64px" color="red.400">error</Box>
        <Text color="gray.700" fontWeight="bold">{error}</Text>
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg="#f6f7f8" color="#0f172a">
      <Box as="main" p={10}>
        <Box maxW="1600px" mx="auto" display="flex" flexDir="column" gap={10}>
          <Grid templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }} gap={6}>
            <Box
              gridColumn={{ base: "auto", lg: "span 2" }}
              position="relative"
              overflow="hidden"
              rounded="xl"
              bgGradient="linear(to-br, #1f3b61, #2c3e50)"
              p={8}
              color="white"
              shadow="lg"
              minH="280px"
            >
              <Flex position="relative" zIndex={1} direction="column" h="full" justify="space-between">
                <Box>
                  <Box as="span" display="inline-block" px={3} py={1} bg="whiteAlpha.200" rounded="full" fontSize="10px" fontWeight="bold" letterSpacing="widest" textTransform="uppercase" mb={4}>
                    Dernière Fiche de Paie
                  </Box>
                  <Heading as="h2" fontSize={{ base: "3xl", md: "4xl" }} fontWeight="black" letterSpacing="tight" mb={2}>
                    {formatMonthYear(latestPayslip)}
                  </Heading>
                  <Text color="whiteAlpha.700" fontSize="sm" fontWeight="medium">
                    {formatDepositDate(latestPayslip)}
                  </Text>
                </Box>

                <Flex mt={8} align="end" justify="space-between" gap={4} flexWrap="wrap">
                  <Box>
                    <Text color="whiteAlpha.600" fontSize="10px" textTransform="uppercase" fontWeight="bold" letterSpacing="widest" mb={1}>
                      Salaire Net à Payer
                    </Text>
                    <Text fontSize={{ base: "4xl", md: "5xl" }} fontWeight="black" letterSpacing="tight">
                      {latestPayslip ? formatAriary(latestPayslip.salaireNet) : "—"}
                    </Text>
                  </Box>
                  <Button
                    bg="#2c7a7b"
                    color="white"
                    px={6}
                    py={3}
                    rounded="lg"
                    fontSize="sm"
                    fontWeight="bold"
                    leftIcon={<Box as="span" className="material-symbols-outlined" fontSize="20px" lineHeight="1">download</Box>}
                    _hover={{ bg: "rgba(44,122,123,0.9)" }}
                    _active={{ transform: "scale(0.95)" }}
                    transition="all 0.15s"
                    shadow="xl"
                    onClick={() => latestPayslip && telecharger(latestPayslip.id, latestPayslip.mois, latestPayslip.annee)}
                    isDisabled={!latestPayslip}
                  >
                    Télécharger PDF
                  </Button>
                </Flex>
              </Flex>

              <Box
                as="span"
                className="material-symbols-outlined"
                position="absolute"
                right="-32px"
                bottom="-32px"
                fontSize="180px"
                color="whiteAlpha.100"
                pointerEvents="none"
                lineHeight="1"
              >
                payments
              </Box>
            </Box>

            <Box bg="white" rounded="xl" shadow="sm" p={6} display="flex" flexDirection="column" borderWidth="1px" borderColor="rgba(226,232,240,0.5)">
              <Flex align="center" justify="space-between" mb={6}>
                <Heading as="h3" color="#1f3b61" fontWeight="bold" fontSize="lg" letterSpacing="tight">
                  Récapitulatif Annuel
                </Heading>
                <Box as="span" className="material-symbols-outlined" color="#2c7a7b" fontSize="24px" lineHeight="1">
                  insights
                </Box>
              </Flex>

              <Box flex="1">
                <Flex justify="space-between" align="center" py={3} borderBottomWidth="1px" borderColor="rgba(226,232,240,0.3)">
                  <Text fontSize="sm" color="gray.500">
                    Total Net ({activeSelectedYear ?? "—"})
                  </Text>
                  <Text fontSize="sm" fontWeight="bold" color="#0f172a">
                    {formatAriary(annualSummary.totalNet)}
                  </Text>
                </Flex>
                <Flex justify="space-between" align="center" py={3} borderBottomWidth="1px" borderColor="rgba(226,232,240,0.3)">
                  <Text fontSize="sm" color="gray.500">
                    Prélèvements Sociaux
                  </Text>
                  <Text fontSize="sm" fontWeight="bold" color="#ef4444">
                    - {formatAriary(annualSummary.socialCharges)}
                  </Text>
                </Flex>
                <Flex justify="space-between" align="center" py={3}>
                  <Text fontSize="sm" color="gray.500">
                    Impôt sur le Revenu
                  </Text>
                  <Text fontSize="sm" fontWeight="bold" color="slate.700">
                    - {formatAriary(annualSummary.incomeTax)}
                  </Text>
                </Flex>
              </Box>

              <Box mt={6} p={4} bg="#f8fafc" rounded="lg">
                <Text fontSize="10px" textTransform="uppercase" fontWeight="bold" letterSpacing="widest" color="gray.400" mb={2}>
                  Prochaine Échéance
                </Text>
                <Text fontSize="sm" fontWeight="semibold" color="#1f3b61">
                  {formatNextDueDate(latestPayslip)}
                </Text>
              </Box>
            </Box>
          </Grid>

          <Box display="flex" flexDirection="column" gap={6}>
            <Flex direction={{ base: "column", md: "row" }} align={{ base: "start", md: "end" }} justify="space-between" gap={4}>
              <Box>
                <Heading as="h2" fontSize={{ base: "2xl", md: "3xl" }} fontWeight="black" letterSpacing="tight" color="#1f3b61">
                  Historique des fiches
                </Heading>
                <Text color="gray.500" fontSize="sm" mt={1}>
                  Consultez et téléchargez vos archives de paie.
                </Text>
              </Box>

              <Flex align="center" gap={3} wrap="wrap">
                <Box position="relative">
                  <Text
                    as="label"
                    position="absolute"
                    top="-8px"
                    left={3}
                    px={1}
                    bg="#ffffff"
                    fontSize="10px"
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="widest"
                    zIndex={1}
                    color="gray.400"
                  >
                    Année
                  </Text>
                  <Select
                    value={activeSelectedYear ?? ""}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    h="44px"
                    minW="140px"
                    appearance="none"
                    bg="white"
                    borderColor="#e2e8f0"
                    rounded="lg"
                    px={4}
                    pr={10}
                    fontSize="sm"
                    fontWeight="medium"
                    cursor="pointer"
                    _focus={{ borderColor: "#1f3b61", boxShadow: "0 0 0 1px #1f3b61" }}
                  >
                    {years.length === 0 ? (
                      <option value="">—</option>
                    ) : (
                      years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))
                    )}
                  </Select>
                  <Box
                    as="span"
                    className="material-symbols-outlined"
                    position="absolute"
                    right={3}
                    top="50%"
                    transform="translateY(-50%)"
                    color="gray.400"
                    pointerEvents="none"
                    lineHeight="1"
                  >
                    expand_more
                  </Box>
                </Box>

                <Button
                  h="44px"
                  px={4}
                  borderWidth="1px"
                  borderColor="#e2e8f0"
                  rounded="lg"
                  bg="white"
                  color="gray.600"
                  _hover={{ bg: "gray.50" }}
                  _active={{ transform: "scale(0.95)" }}
                  transition="all 0.15s"
                  leftIcon={<Box as="span" className="material-symbols-outlined" fontSize="20px" lineHeight="1">filter_list</Box>}
                >
                  <Text as="span" fontSize="sm" fontWeight="bold" textTransform="uppercase" letterSpacing="tight">
                    Filtres
                  </Text>
                </Button>
              </Flex>
            </Flex>

            <Box bg="white" rounded="xl" shadow="sm" overflow="hidden" borderWidth="1px" borderColor="rgba(226,232,240,0.5)">
              {displayFiches.length === 0 ? (
                <Flex direction="column" align="center" justify="center" py={20} gap={4} bg="white" rounded="xl" borderWidth="2px" borderStyle="dashed" borderColor="#e2e8f0">
                  <Box w={16} h={16} bg="#f8fafc" rounded="full" display="flex" alignItems="center" justifyContent="center" mt={-4}>
                    <Box as="span" className="material-symbols-outlined" color="gray.300" fontSize="32px" lineHeight="1">
                      search_off
                    </Box>
                  </Box>
                  <Heading as="h3" fontSize="lg" fontWeight="bold" color="#1f3b61">
                    Aucune fiche de paie trouvée
                  </Heading>
                  <Text color="gray.500" fontSize="sm">
                    Essayez de modifier vos critères de recherche ou l'année sélectionnée.
                  </Text>
                </Flex>
              ) : (
                <Box overflowX="auto">
                  <Table variant="unstyled" w="full" sx={{ borderCollapse: "collapse" }}>
                    <Thead>
                      <Tr bg="#f8fafc" borderBottomWidth="1px" borderColor="rgba(226,232,240,0.5)">
                        <Th px={6} py={4} fontSize="10px" fontWeight="black" textTransform="uppercase" letterSpacing="widest" color="gray.500">
                          Période
                        </Th>
                        <Th px={6} py={4} fontSize="10px" fontWeight="black" textTransform="uppercase" letterSpacing="widest" color="gray.500">
                          Salaire de base
                        </Th>
                        <Th px={6} py={4} fontSize="10px" fontWeight="black" textTransform="uppercase" letterSpacing="widest" color="gray.500">
                          Primes
                        </Th>
                        <Th px={6} py={4} fontSize="10px" fontWeight="black" textTransform="uppercase" letterSpacing="widest" color="gray.500">
                          Déductions
                        </Th>
                        <Th px={6} py={4} fontSize="10px" fontWeight="black" textTransform="uppercase" letterSpacing="widest" color="gray.500">
                          Salaire Net
                        </Th>
                        <Th px={6} py={4} fontSize="10px" fontWeight="black" textTransform="uppercase" letterSpacing="widest" color="gray.500" textAlign="center">
                          Statut
                        </Th>
                        <Th px={6} py={4} fontSize="10px" fontWeight="black" textTransform="uppercase" letterSpacing="widest" color="gray.500" textAlign="right">
                          Actions
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {displayFiches.map((f) => (
                        <Tr key={f.id} _hover={{ bg: "#f8fafc" }} transition="background 0.15s">
                          <Td px={6} py={5} fontWeight="bold" color="#1f3b61">
                            {MOIS_LABELS[f.mois - 1]} {f.annee}
                          </Td>
                          <Td px={6} py={5} color="gray.600" fontSize="sm" fontWeight="medium">
                            {formatAriary(f.salaireBase)}
                          </Td>
                          <Td px={6} py={5} color="#2c7a7b" fontSize="sm" fontWeight="bold">
                            + {formatAriary(f.primePresence)}
                          </Td>
                          <Td px={6} py={5} color="#ef4444" fontSize="sm">
                            - {formatAriary(f.deductionAbsences)}
                          </Td>
                          <Td px={6} py={5} color="#0f172a" fontSize="sm" fontWeight="black">
                            {formatAriary(f.salaireNet)}
                          </Td>
                          <Td px={6} py={5} textAlign="center">
                            <Badge px={3} py={1} rounded="full" bg={`${statutColor(f.statut)}.50`} color={`${statutColor(f.statut)}.500`} fontSize="10px" fontWeight="bold" textTransform="uppercase" letterSpacing="widest">
                              {statutLabel(f.statut)}
                            </Badge>
                          </Td>
                          <Td px={6} py={5} textAlign="right">
                            <IconButton
                              aria-label="Télécharger PDF"
                              variant="ghost"
                              size="sm"
                              color="gray.400"
                              _hover={{ color: "#1f3b61", bg: "gray.50" }}
                              icon={<Box as="span" className="material-symbols-outlined" fontSize="20px" lineHeight="1">picture_as_pdf</Box>}
                              onClick={() => telecharger(f.id, f.mois, f.annee)}
                            />
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      <Box as="footer" px={10} py={8} textAlign={{ base: "center", sm: "left" }}>
        <Text fontSize="10px" color="gray.400" textTransform="uppercase" letterSpacing="widest">
          Archive Numérique Certifiée conforme à la réglementation en vigueur.
        </Text>
      </Box>
    </Box>
  );
}
