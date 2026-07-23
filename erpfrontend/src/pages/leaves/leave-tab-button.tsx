import { Button } from "@chakra-ui/react";

export default function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <Button variant="unstyled" py={4} px={2} mr={6} rounded="none" borderBottomWidth="2px" borderColor={active ? "#1E3A5F" : "transparent"} color={active ? "#1E3A5F" : "gray.500"} fontWeight={active ? "semibold" : "medium"} fontSize="sm" _hover={{ color: active ? "#1E3A5F" : "gray.700" }} transition="colors 0.15s" onClick={onClick}>
      {label}
    </Button>
  );
}
