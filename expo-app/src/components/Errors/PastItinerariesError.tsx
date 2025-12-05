import { Box, Text } from "@gluestack-ui/themed";

import { CalendarCheck } from "lucide-react-native";

export function PastItinerariesError(){
  return (
    <Box flex={1} px={4} py={20} alignItems="center" justifyContent="center">
      <CalendarCheck color="#9CA3AF" size={60} />
      <Text textAlign="center" mt={10} size="lg" color="$gray600">
        Você não tem nenhum roteiro expirado aqui ainda.
      </Text>
    </Box>
  )
}
