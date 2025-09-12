import { SafeAreaView, StatusBar } from "react-native";

import { View, Text, Button, ButtonText } from "@gluestack-ui/themed";

import { IdCard, PlaneTakeoff, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react-native";

import { VisaModelTypes } from '../../../@types/VisaModelTypes';

export function VisaModel({ results, origin, destination, action }: VisaModelTypes){
  return(
    <SafeAreaView 
      style={
        results === "Negative" ? { flex: 1, backgroundColor: "#b91c1c" }
          : results === "Unknown" ? { flex: 1, backgroundColor: "#f97316" }
            : { flex: 1, backgroundColor: "#84cc16" }
      }
    >
      <StatusBar barStyle="light-content" />
      <View flexDirection="column" alignItems="center" mt={15}>
        <View bgColor="#FDFDFD" p={18} borderRadius={100}>
          <IdCard size={100} color={
            results === "Negative" ? "#b91c1c"
              : results === "Unknown" ? "#f97316"
                : "#84cc16"
          } />
        </View>
        <Text color="#FFF" fontSize="$4xl" fontWeight="$bold" mt={15} textAlign="center">Checagem de Visto</Text>
        <View flexDirection="row" my={40} alignItems="center" gap={8}>
          <Text fontSize="$4xl" color="#FDFDFD" fontWeight="$bold" mr={5}>{ origin }</Text>
          <View borderWidth={2} borderColor="#FDFDFD" w={50} />
          <PlaneTakeoff color="#FFF" size={70} />
          <View borderWidth={2} borderColor="#FDFDFD" w={50} />
          <Text fontSize="$4xl" color="#FDFDFD" fontWeight="$bold" ml={5}>{ destination }</Text>
        </View>
        { 
          results === "Negative"
          ? <View flexDirection="column" alignItems="center" p={8}>
              <ShieldAlert size={165} color="#FFF" />
              <Text fontSize="$2xl" color="#FFF" fontWeight="$bold" textAlign="center" mt={5}>Visto é Necessário</Text>
              <Text textAlign="center" color="#FDFDFD">Um Visto pode ser necessário para esta viagem. Por favor cheque esta informação com o seu governo local</Text>
            </View>
          : results === "Unknown"
          ? <View flexDirection="column" alignItems="center" p={8}>
              <ShieldQuestion size={165} color="#FFF" />
              <Text fontSize="$2xl" color="#FFF" fontWeight="$bold" textAlign="center" mt={5}>Informação de Visto desconhecida</Text>
              <Text textAlign="center" color="#FDFDFD">Nós não temos informações precisas sobre a necessidade de visto entre seu país e o de destino</Text>
            </View>
          : <View flexDirection="column" alignItems="center" p={8}>
              <ShieldCheck size={165} color="#FFF" />
              <Text fontSize="$2xl" color="#FFF" fontWeight="$bold" textAlign="center" mt={5}>Visto não Necessário</Text>
              <Text textAlign="center" color="#FDFDFD">Por favor confirme esta informação com o website do seu governo local e a embaixada do país de destino</Text>
            </View>
        }
        <Button 
          bgColor="#FDFDFD" 
          variant="solid" 
          mt={30}
          borderRadius="$xl"
          shadowColor="$black"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.25}
          shadowRadius={8}
          elevation={5}
          onPress={action}
          alignItems="center"
          justifyContent="center"
          w="60%"
          h={50}
        >
          <ButtonText 
            color="#000" 
            fontSize="$lg" 
            fontWeight="$semibold"
            textAlign="center"
          >
            Continuar
          </ButtonText>
        </Button>
      </View>
    </SafeAreaView>
  )
}