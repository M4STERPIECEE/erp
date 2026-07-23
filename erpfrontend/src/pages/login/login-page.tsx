import {
  Box,
  Flex,
  Heading,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Button,
  Checkbox,
  Link,
  VStack,
  FormControl,
  FormLabel,
  useColorModeValue,
  IconButton,
  Alert,
  AlertIcon,
  AlertDescription,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const handleTogglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      const dest = from ?? "/";
      navigate(dest, { replace: true });
    } catch (err: unknown) {
      setError((err as Error).message ?? "Échec de la connexion");
    } finally {
      setIsSubmitting(false);
    }
  };
  const bgLightDark = useColorModeValue("#f6f7f8", "#14181e");
  const cardBg = useColorModeValue("white", "#1a202c");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textMain = useColorModeValue("gray.900", "gray.100");
  const textMuted = useColorModeValue("gray.500", "gray.400");
  const inputBg = useColorModeValue("gray.50", "gray.800");

  return (
    <Box minH="100vh" w="100vw" bg={bgLightDark} position="relative" overflow="hidden" color={textMain} display="flex" alignItems="center" justifyContent="center">
      <Box position="absolute" inset="0" bg="#1f3b61" opacity={useColorModeValue(0.05, 0.1)} pointerEvents="none" />
      <Box position="absolute" top="0" left="0" right="0" h="256px" bgGradient="linear(to-b, rgba(31,59,97,0.1), transparent)" pointerEvents="none" />
      <Flex flexDir="column" alignItems="center" justifyContent="center" p={{ base: 4, sm: 6, lg: 8 }} zIndex="10" position="relative" w="full" maxW="container.lg" >
        <Box w="full" maxW="400px" bg={cardBg} shadow="xl" rounded="xl" borderWidth="1px" borderColor={borderColor} overflow="hidden">
          <Flex flexDir="column" alignItems="center" pt={8} pb={4} px={6} textAlign="center">
            <Flex boxSize={12} bg="rgba(31,59,97,0.1)" rounded="lg" alignItems="center" justifyContent="center" mb={4} color="#1f3b61">
              <Box as="span" className="material-symbols-outlined" fontSize="32px" lineHeight="1">
                dataset
              </Box>
            </Flex>
            <Heading as="h1" color={useColorModeValue("#1f3b61", "white")} fontSize="2xl" fontWeight="bold" lineHeight="tight" letterSpacing="tight" mb={2}>
              HR Management System
            </Heading>
            <Text color={textMuted} fontSize="sm" fontWeight="normal">
              Connectez-vous pour accéder à votre portail RH
            </Text>
          </Flex>
          <Box px={6} pb={8}>
            <VStack as="form" spacing={4} onSubmit={handleSubmit} w="full" maxW="300px" mx="auto">
              <FormControl>
                <FormLabel color={useColorModeValue("gray.700", "gray.300")} fontSize="sm" fontWeight="medium">
                  Email professionnel
                </FormLabel>
                <InputGroup size="lg">
                  <InputLeftElement pointerEvents="none" color="gray.400" h="12" display="flex" alignItems="center">
                    <Box as="span" className="material-symbols-outlined" fontSize="20px" lineHeight="1">
                      mail
                    </Box>
                  </InputLeftElement>
                  <Input type="email" placeholder="exemple@entreprise.com" value={email} onChange={(e) => setEmail(e.target.value)} isRequired bg={inputBg} borderWidth="1px" borderColor={useColorModeValue("gray.200", "gray.600")} color={textMain} _focus={{ borderColor: "#2d8a8a", boxShadow: "0 0 0 1px #2d8a8a" }} _placeholder={{ color: "gray.400" }} h="12" fontSize="sm" pl={10} rounded="lg" />
                </InputGroup>
              </FormControl>
              <FormControl>
                <Flex justify="space-between" align="center" mb={2}>
                  <FormLabel m={0} color={useColorModeValue("gray.700", "gray.300")} fontSize="sm" fontWeight="medium">
                    Mot de passe
                  </FormLabel>
                </Flex>
                <InputGroup size="lg">
                  <InputLeftElement pointerEvents="none" color="gray.400" h="12" display="flex" alignItems="center">
                    <Box as="span" className="material-symbols-outlined" fontSize="20px" lineHeight="1">
                      lock
                    </Box>
                  </InputLeftElement>
                  <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} isRequired bg={inputBg} borderWidth="1px" borderColor={useColorModeValue("gray.200", "gray.600")} color={textMain} _focus={{ borderColor: "#2d8a8a", boxShadow: "0 0 0 1px #2d8a8a" }} _placeholder={{ color: "gray.400" }} h="12" fontSize="sm" pl={10} pr={12} rounded="lg" />
                  <InputRightElement h="12" display="flex" alignItems="center">
                    <IconButton aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"} variant="ghost" size="sm" icon={<Box as="span" className="material-symbols-outlined" fontSize="20px" lineHeight="1">{showPassword ? "visibility" : "visibility_off"}</Box>} color="gray.400" _hover={{ color: useColorModeValue("gray.600", "gray.200"), bg: "transparent" }} onClick={handleTogglePassword} />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <Flex w="full" align="center" justify="space-between" mt={1}>
                <Checkbox size="sm" colorScheme="teal" sx={{ ".chakra-checkbox__control": { borderColor: useColorModeValue("gray.300", "gray.600"), bg: useColorModeValue("white", "gray.800"), borderWidth: "1px", }, ".chakra-checkbox__control[data-checked]": { bg: "#2d8a8a", borderColor: "#2d8a8a", }, }} >
                  <Text color={textMuted} fontSize="sm" ml={2}>
                    Se souvenir de moi
                  </Text>
                </Checkbox>
                <Link color="#2d8a8a" fontSize="sm" fontWeight="medium" _hover={{ color: "rgba(45,138,138,0.8)", textDecoration: "none" }}>
                  Mot de passe oublié ?
                </Link>
              </Flex>
              {error && (
                <Alert status="error" rounded="lg" fontSize="sm">
                  <AlertIcon />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" w="full" h="12" bg="#2d8a8a" color="white" fontWeight="bold" fontSize="sm" isLoading={isSubmitting} loadingText="Connexion…" _hover={{ bg: "rgba(45,138,138,0.9)", transform: "translateY(-1px)" }} _active={{ transform: "translateY(0)" }} boxShadow="0 4px 6px -1px rgba(45,138,138,0.2), 0 2px 4px -1px rgba(45,138,138,0.1)" transition="all 0.2s" mt={2}>
                Se connecter
              </Button>
            </VStack>
          </Box>
          <Flex px={6} py={3.5} bg={useColorModeValue("gray.50", "rgba(26,32,44,0.5)")} borderTopWidth="1px" borderColor={useColorModeValue("gray.100", "gray.700")} justify="center" textAlign="center" >
            <Text color={textMuted} fontSize="xs">
              Besoin d'assistance ?{" "}
              <Link color={useColorModeValue("#1f3b61", "gray.200")} fontWeight="medium" _hover={{ textDecoration: "underline" }}>
                Contacter le support IT
              </Link>
            </Text>
          </Flex>
        </Box>
        <Box mt={8} textAlign="center">
          <Text color={useColorModeValue("gray.400", "gray.500")} fontSize="xs">
            © {new Date().getFullYear()} HR Management System. Tous droits réservés.
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}
