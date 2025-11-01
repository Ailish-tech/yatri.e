import { Box, Text } from "@gluestack-ui/themed";

import { ClipboardList } from "lucide-react-native";

export function ItinerariesError(){
  return (
    <Box flex={1} px={4} py={20} alignItems="center" justifyContent="center">
      <ClipboardList color="red" size={60} />
      <Text textAlign="center" mt={10} size="lg">
        Não há nenhum itinerário até o momento! Que tal começar criando um novo?
      </Text>
    </Box>
  )
}