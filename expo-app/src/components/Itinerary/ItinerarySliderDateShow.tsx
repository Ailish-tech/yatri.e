import { TouchableOpacity } from "react-native";
import { View, Text } from "@gluestack-ui/themed";

type ItinerarySliderDateShowTypes = {
  numberOfDay: number,
  nameOfWeekday: string,
  isSelected?: boolean,
  onPress?: () => void
}

export function ItinerarySliderDateShow({ numberOfDay, nameOfWeekday, isSelected = false, onPress }: ItinerarySliderDateShowTypes){
  return(
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View 
        flexDirection="column" 
        alignItems="center" 
        mx={5}
        py={8}
        px={12}
        backgroundColor={isSelected ? "#2752B7" : "transparent"}
        borderRadius={12}
        borderWidth={isSelected ? 0 : 1}
        borderColor="#E0E0E0"
      >
        <Text 
          fontSize="$sm" 
          color={isSelected ? "white" : "#808080"} 
          fontWeight="$semibold"
        >
          { nameOfWeekday }
        </Text>
        <Text 
          fontSize="$lg" 
          color={isSelected ? "white" : "#000"} 
          fontWeight="$bold"
        >
          { numberOfDay }
        </Text>
      </View>
    </TouchableOpacity>
  )
}