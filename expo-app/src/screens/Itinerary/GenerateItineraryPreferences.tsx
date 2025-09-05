import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { 
  Input, 
  InputField, 
  View, 
  Text,
  Checkbox,
  CheckboxIndicator,
  CheckboxIcon,
  CheckboxLabel
} from "@gluestack-ui/themed";

import FelipeMascotItinerary from "@assets/Mascot/Felipe_Mascot_Itinerary_Features.svg";

import { Check } from "lucide-react-native";

export function GenerateItineraryPreferences() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#2752B7' }}>
      <StatusBar barStyle="light-content" backgroundColor="#2752B7" />
      <View flexDirection="column" alignItems="center" mt={10} mb={20}>
        <View justifyContent="center" alignItems="center">
          <View 
            position="absolute"
            width={260}
            height={260}
            bgColor='rgba(37, 99, 235, 0.5)'
            borderRadius={100}
            shadowColor="#2563eb"
            shadowOffset={{ width: 0, height: 0 }}
            shadowOpacity={1}
            shadowRadius={20}
            elevation={10}
          />
          <FelipeMascotItinerary width={250} height={250} />
        </View>
        <Text mt={15} fontWeight="$bold" fontSize="$xl" textAlign="center" color="white">Finalize os parâmetros do seu novo roteiro</Text>
      </View>
      <View mx={10}>
        <View mb={20}>
          <Text fontSize={16} color="white" mb={8}>Orçamento máximo a ser gasto nesta viagem</Text>
          <Input borderWidth={1} borderColor="#D1D5DB" borderRadius={12} padding={8} bgColor="#FFF">
            <InputField placeholder="0" />
          </Input>
        </View>
        <View mb={20}>
          <Text fontSize={16} color="white" mb={8}>Quantas pessoas te acompanham?</Text>
          <Input borderWidth={1} borderColor="#D1D5DB" borderRadius={12} padding={8} bgColor="#FFF">
            <InputField placeholder="0" />
          </Input>
        </View>
        <View flexDirection="column" mb={20}>
          <Text fontSize={16} color="white" mb={8}>Quem te acompanha?</Text>
          <View flexDirection="row" ml={5}>
            <Checkbox 
              isDisabled={false} 
              isInvalid={false} 
              size="lg" 
              value={""} 
              mr={20}
            >
              <CheckboxIndicator 
                borderColor="white" 
                borderWidth={2}
                borderRadius={6}
                bgColor="transparent"
              >
                <CheckboxIcon as={Check} color="white" />
              </CheckboxIndicator>
              <CheckboxLabel ml={5} color="white" fontSize={16}>Família</CheckboxLabel>
            </Checkbox>
            <Checkbox 
              isDisabled={false} 
              isInvalid={false} 
              size="lg" 
              value={""} 
              mr={20}
            >
              <CheckboxIndicator 
                borderColor="white" 
                borderWidth={2}
                borderRadius={6}
                bgColor="transparent"
              >
                <CheckboxIcon as={Check} color="white" />
              </CheckboxIndicator>
              <CheckboxLabel ml={5} color="white" fontSize={16}>Amigos</CheckboxLabel>
            </Checkbox>
          </View>
        </View>
        <View flexDirection="column" mb={20}>
          <Text fontSize={16} color="white" mb={8}>Qual estilo de viagem você prefere?</Text>
          <View flexDirection="row" ml={5}>
            <Checkbox isDisabled={false} isInvalid={false} size="lg" value={""} mr={20}>
              <CheckboxIndicator 
                borderColor="white" 
                borderWidth={2}
                borderRadius={6}
                bgColor="transparent"
              >
                <CheckboxIcon as={Check} color="white" />
              </CheckboxIndicator>
              <CheckboxLabel ml={5} color="white" fontSize={16}>Urbana</CheckboxLabel>
            </Checkbox>
            <Checkbox isDisabled={false} isInvalid={false} size="lg" value={""} mr={20}>
              <CheckboxIndicator 
                borderColor="white" 
                borderWidth={2}
                borderRadius={6}
                bgColor="transparent"
              >
                <CheckboxIcon as={Check} color="white" />
              </CheckboxIndicator>
              <CheckboxLabel ml={5} color="white" fontSize={16}>Rural</CheckboxLabel>
            </Checkbox>
            <Checkbox isDisabled={false} isInvalid={false} size="lg" value={""}>
              <CheckboxIndicator 
                borderColor="white" 
                borderWidth={2}
                borderRadius={6}
                bgColor="transparent"
              >
                <CheckboxIcon as={Check} color="white" />
              </CheckboxIndicator>
              <CheckboxLabel ml={5} color="white" fontSize={16}>Ambos</CheckboxLabel>
            </Checkbox>
          </View>
        </View>
        <View flexDirection="column">
          <Text fontSize={16} color="white" mb={8}>Método de locomoção preferido?</Text>
          <View flexDirection="row" flexWrap="wrap" rowGap={8} ml={5}>
            <Checkbox isDisabled={false} isInvalid={false} size="lg" value={""} mr={20}>
              <CheckboxIndicator 
                borderColor="white" 
                borderWidth={2}
                borderRadius={6}
                bgColor="transparent"
              >
                <CheckboxIcon as={Check} color="white" />
              </CheckboxIndicator>
              <CheckboxLabel ml={5} color="white" fontSize={16}>Carro</CheckboxLabel>
            </Checkbox>
            <Checkbox isDisabled={false} isInvalid={false} size="lg" value={""} mr={20}>
              <CheckboxIndicator 
                borderColor="white" 
                borderWidth={2}
                borderRadius={6}
                bgColor="transparent"
              >
                <CheckboxIcon as={Check} color="white" />
              </CheckboxIndicator>
              <CheckboxLabel ml={5} color="white" fontSize={16}>Moto</CheckboxLabel>
            </Checkbox>
            <Checkbox isDisabled={false} isInvalid={false} size="lg" value={""} mr={20}>
              <CheckboxIndicator 
                borderColor="white" 
                borderWidth={2}
                borderRadius={6}
                bgColor="transparent"
              >
                <CheckboxIcon as={Check} color="white" />
              </CheckboxIndicator>
              <CheckboxLabel ml={5} color="white" fontSize={16}>Caminhada</CheckboxLabel>
            </Checkbox>
            <Checkbox isDisabled={false} isInvalid={false} size="lg" value={""} mr={20}>
              <CheckboxIndicator 
                borderColor="white" 
                borderWidth={2}
                borderRadius={6}
                bgColor="transparent"
              >
                <CheckboxIcon as={Check} color="white" />
              </CheckboxIndicator>
              <CheckboxLabel ml={5} color="white" fontSize={16}>Trem</CheckboxLabel>
            </Checkbox>
            <Checkbox isDisabled={false} isInvalid={false} size="lg" value={""} mr={20}>
              <CheckboxIndicator 
                borderColor="white" 
                borderWidth={2}
                borderRadius={6}
                bgColor="transparent"
              >
                <CheckboxIcon as={Check} color="white" />
              </CheckboxIndicator>
              <CheckboxLabel ml={5} color="white" fontSize={16}>Barco</CheckboxLabel>
            </Checkbox>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}