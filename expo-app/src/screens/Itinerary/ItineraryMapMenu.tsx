import { useRef } from "react";
import { SafeAreaView, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import MapView from "react-native-maps";

import { View } from "@gluestack-ui/themed";

import { ButtonIconRight } from "@components/Buttons/ButtonIconRight";
import { RecenterButton } from "@components/Maps/RecenterButton";
import { Maps } from "@components/Maps/Maps";

import { AuthNavigationProp } from "@routes/auth.routes";

export function ItineraryMapMenu() {
  const navigation = useNavigation<AuthNavigationProp>();

  const mapUserPositionRef = useRef<MapView | null>(null);

  return (
    <View flex={1} position="relative">
      <View flexDirection="row" alignItems="center">
        <ButtonIconRight
          textContent="Voltar"
          action={() => navigation.navigate("GenerateItineraryMenu")}
          styles={{
            position: 'absolute',
            backgroundColor: "#FDFDFD",
            borderRadius: 15,
            paddingVertical: 5,
            paddingHorizontal: 10,
            top: 10,
            left: 10,
            zIndex: 1,
            marginTop: 50
          }}
        />
      </View>
      <StatusBar barStyle="dark-content" />
      <View style={{ flex: 1 }}>
        <Maps ref={mapUserPositionRef} />
        <SafeAreaView>
          
        </SafeAreaView>
      </View>
    </View>
  )
}