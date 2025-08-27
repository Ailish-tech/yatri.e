import { useState } from "react";
import { SafeAreaView, StatusBar } from "react-native";

import { Text, View } from "@gluestack-ui/themed";

import { ButtonIconLeft } from "@components/Buttons/ButtonIconLeft";
import { ItineraryCreateDialog } from "@components/Dialogs/ItineraryCreateDialog";

import { ArrowLeft, Plus } from "lucide-react-native";
import { IconButton } from "@components/Buttons/IconButton";
import { useNavigation } from "@react-navigation/native";
import { AuthNavigationProp } from "@routes/auth.routes";

export function GenerateItineraryMenu(){
  const [showAlertDialog, setShowAlertDialog] = useState(false);

  const navigation = useNavigation<AuthNavigationProp>();
  
  return(
    <SafeAreaView>
      <StatusBar barStyle="dark-content" />
      <View px={15} mt={5} flexDirection="row" justifyContent="space-between" alignItems="center">
        <IconButton 
          icon={ ArrowLeft }
          iconSize="xl"
          iconColor="#000"
          buttonBgColor="transparent"
          buttonFunctionality={ () => navigation.goBack() }
          styles={{ marginLeft: -10 }}
        />
        <ButtonIconLeft 
          textContent="Novo Itinerário" 
          icon={ Plus } 
          action={ () => setShowAlertDialog(true) }
          iconDimension={24}
          textColor="#FFF"
          iconStyles={{ marginRight: 5, color: '#FFF' }}
          buttonStyles={{ backgroundColor: '#2752B7', borderRadius: 20 }}
        />
      </View>

      <Text color='#2752B7' ml={25} mt={20} fontSize="$3xl" fontWeight="$bold">Itinerários</Text>

      <View
        bgColor="#ffffff"
        width={100}
        borderRadius={15}
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.2}
        shadowRadius={5}
        elevation={5}
        justifyContent="center"
        alignSelf="center"
        w="95%"
        py={15}
        pl={20}
        mt={15}
      ></View>

      {
        showAlertDialog
          ? <ItineraryCreateDialog showAlertDialog={ showAlertDialog } setShowAlertDialog={ setShowAlertDialog } />
          : null
      }
    </SafeAreaView>
  )
}