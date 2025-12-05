import { TouchableOpacity, Image as RNImage } from "react-native";
import { Text, View, Button, ButtonIcon } from "@gluestack-ui/themed";

import DefaultImage from '@assets/adaptive-icon.png';
import { MoreVertical } from "lucide-react-native";

type ItineraryCardProps = {
  title: string;
  dateBegin: string;
  dateEnd: string;
  imageUri?: string;
  daysUntil: number;
  onPress: () => void;
  onOptionsPress?: () => void;
};

export function ItineraryCard({ 
  title, 
  dateBegin, 
  dateEnd, 
  imageUri, 
  daysUntil, 
  onPress,
  onOptionsPress
}: ItineraryCardProps) {
  
  const formatDaysText = () => {
    if (daysUntil < 0) {
      return `Há ${Math.abs(daysUntil)} dias`;
    } else if (daysUntil === 0) {
      return "Hoje";
    } else {
      return `Em ${daysUntil} dias`;
    }
  };

  return (
    <View
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        width: "100%",
        minHeight: 260,
        marginBottom: 15,
        position: "relative"
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={{ flex: 1 }}
      >
        <View>
          <RNImage
            source={imageUri ? { uri: imageUri } : DefaultImage}
            style={{
              width: "100%",
              height: 210,
              borderTopLeftRadius: 15,
              borderTopRightRadius: 15
            }}
            resizeMode="cover"
          />
          <View px={15} py={10}>
            <View flexDirection="row" alignItems="center" justifyContent="space-between">
              <Text fontSize="$xl" fontWeight="$bold" color="$black" flex={1} numberOfLines={1}>
                {title}
              </Text>
              <Text fontSize="$md" fontWeight="$semibold" color="$gray600" ml={10}>
                {formatDaysText()}
              </Text>
            </View>
            <Text fontSize="$sm" color="$gray500" mt={5}>
              {dateBegin} - {dateEnd}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      
      {onOptionsPress && (
        <Button
          position="absolute"
          top={10}
          right={10}
          bgColor="rgba(0, 0, 0, 0.5)"
          borderRadius={50}
          w={40}
          h={40}
          onPress={(e) => {
            onOptionsPress();
          }}
          zIndex={10}
        >
          <ButtonIcon as={MoreVertical} color="#FFF" size="lg" />
        </Button>
      )}
    </View>
  );
}
