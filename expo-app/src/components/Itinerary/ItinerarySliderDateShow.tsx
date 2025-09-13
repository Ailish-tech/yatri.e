import { View, Text } from "@gluestack-ui/themed";

type ItinerarySliderDateShowTypes = {
  numberOfDay: number,
  nameOfWeekday: string
}

export function ItinerarySliderDateShow({ numberOfDay, nameOfWeekday }: ItinerarySliderDateShowTypes){
  return(
    <View flexDirection="column" alignItems="center" mx={5}>
      <Text fontSize="$xl" color="#808080" fontWeight="$semibold">{ nameOfWeekday }</Text>
      <Text fontSize="$xl" color="#000" fontWeight="$bold">{ numberOfDay }</Text>
    </View>
  )
}