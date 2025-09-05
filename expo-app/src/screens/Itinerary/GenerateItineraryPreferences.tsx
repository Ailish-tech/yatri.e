import { Input, InputField, View, Text } from "@gluestack-ui/themed";

export function GenerateItineraryPreferences() {
  return(
    <View>
      <Text fontSize={16} color="#6B7280" mb={8}>Título do itinerário</Text>
      <Input borderWidth={1} borderColor="#D1D5DB" borderRadius={12} padding={16} bgColor="#FFF">
        <InputField placeholder="Insira o valor máximo a ser gasto nesta viagem" />
      </Input>
    </View>
  )
}