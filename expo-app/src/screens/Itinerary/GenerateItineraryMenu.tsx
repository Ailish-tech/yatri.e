import { useState } from "react";
import { SafeAreaView, StatusBar } from "react-native";

import { Button, ButtonText, Text, View } from "@gluestack-ui/themed";

import { ButtonIconLeft } from "@components/Buttons/ButtonIconLeft";
import { ItineraryCreateDialog } from "@components/Dialogs/ItineraryCreateDialog";

import { ArrowLeft, Plus } from "lucide-react-native";
import { IconButton } from "@components/Buttons/IconButton";
import { useNavigation } from "@react-navigation/native";
import { AuthNavigationProp } from "@routes/auth.routes";
import { ItinerariesError } from "@components/Errors/ItinerariesError";

type MenuItineraryTypes = {
  dialog: boolean,
  filters: "Planejados" | "Rascunhos" | "Passados"
}

export function GenerateItineraryMenu(){
  const [showAlertDialog, setShowAlertDialog] = useState<MenuItineraryTypes["dialog"]>(false);
  const [selectedFilter, setSelectedFilter] = useState<MenuItineraryTypes["filters"]>("Planejados");

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
          styles={{ marginLeft: -15 }}
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
        maxHeight={250}
        justifyContent="center"
        alignItems="center"
        alignSelf="center"
        w="95%"
        py={15}
        mt={15}
      >
        <View>
          <ItinerariesError />
          <ButtonIconLeft
            textContent="Novo Itinerário"
            icon={Plus}
            action={() => setShowAlertDialog(true)}
            iconDimension={24}
            textColor="#FFF"
            iconStyles={{ marginRight: 5, color: '#FFF' }}
            buttonStyles={{ backgroundColor: '#2752B7', borderRadius: 20 }}
            styles={{ alignSelf: "center" }}
          />
        </View>
      </View>

      <View flexDirection="row" justifyContent="center" mt={30} mx={15}>
        <Button 
          borderTopLeftRadius={15} 
          borderBottomLeftRadius={15} 
          borderTopRightRadius={0} 
          borderBottomRightRadius={0} 
          w="33%" 
          bgColor={ selectedFilter === "Planejados" ? "#2752B7" : "lightgray" }
          onPress={ () => { setSelectedFilter("Planejados") }}
        >
          <ButtonText 
            color={ selectedFilter === "Planejados" ? "$white" : "$black" } 
            textAlign="center" 
            fontSize="$sm"
          >Planejados</ButtonText>
        </Button>
        <Button 
          borderTopLeftRadius={0} 
          borderBottomLeftRadius={0} 
          borderTopRightRadius={0} 
          borderBottomRightRadius={0} 
          w="33%" 
          bgColor={ selectedFilter === "Rascunhos" ? "#2752B7" : "lightgray" }
          onPress={ () => { setSelectedFilter("Rascunhos") }}
        >
          <ButtonText 
            color={ selectedFilter === "Rascunhos" ? "$white" : "$black" } 
            textAlign="center" 
            fontSize="$sm"
          >Rascunhos</ButtonText>
        </Button>
        <Button 
          borderTopLeftRadius={0} 
          borderBottomLeftRadius={0} 
          borderTopRightRadius={15} 
          borderBottomRightRadius={15} 
          w="33%" 
          bgColor={ selectedFilter === "Passados" ? "#2752B7" : "lightgray" }
          onPress={ () => { setSelectedFilter("Passados") }}
        >
          <ButtonText 
            color={ selectedFilter === "Passados" ? "$white" : "$black" } 
            textAlign="center" 
            fontSize="$sm"
          >Passados</ButtonText>
        </Button>
      </View>

      <View
        bgColor="#ffffff"
        width={100}
        borderRadius={15}
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.2}
        shadowRadius={5}
        elevation={5}
        maxHeight={250}
        justifyContent="center"
        alignItems="center"
        alignSelf="center"
        w="95%"
        py={15}
        mt={15}
      >
        <View>
          <ItinerariesError />
          <ButtonIconLeft
            textContent="Novo Itinerário"
            icon={Plus}
            action={() => setShowAlertDialog(true)}
            iconDimension={24}
            textColor="#FFF"
            iconStyles={{ marginRight: 5, color: '#FFF' }}
            buttonStyles={{ backgroundColor: '#2752B7', borderRadius: 20 }}
            styles={{ alignSelf: "center" }}
          />
        </View>
      </View>

      {
        showAlertDialog
          ? <ItineraryCreateDialog showAlertDialog={ showAlertDialog } setShowAlertDialog={ setShowAlertDialog } />
          : null
      }
    </SafeAreaView>
  )
}