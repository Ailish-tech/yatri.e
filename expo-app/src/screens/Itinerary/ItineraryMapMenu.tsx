import { useEffect, useRef, useState } from "react";
import { SafeAreaView, StatusBar } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import MapView from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { View } from "@gluestack-ui/themed";

import { ButtonIconRight } from "@components/Buttons/ButtonIconRight";
import { Maps } from "@components/Maps/Maps";

import { generateItinerary } from '@utils/gptRequests';
import { useNotificationStore } from '@utils/notificationStore';

import { userTrips } from "@data/itineraries";

import { AuthNavigationProp } from "@routes/auth.routes";

import { CreatingItinerary } from "../../../@types/CreatingItinerary";

import { Globe } from 'lucide-react-native';

export function ItineraryMapMenu() {
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [allCountriesTogether, setAllCountriesTogether] = useState<string>("");
  const [allTripStylesTogether, setAllTripStylesTogether] = useState<string>("");
  const [allVehicleTypesTogether, setAllVehicleTypesTogether] = useState<string>("");

  const navigation = useNavigation<AuthNavigationProp>();
  const route = useRoute<RouteProp<{ params: { itineraryData: CreatingItinerary, userPreferences: string[], visaIssue: any } }, 'params'>>();

  const addNotification = useNotificationStore(state => state.addNotification);

  const mapUserPositionRef = useRef<MapView | null>(null);

  const ITINERARY_STORAGE_KEY = '@eztripai_allUserTripItineraries';

  const { 
    title, 
    dateBegin, 
    dateEnd, 
    days, 
    continent, 
    countries,
    visa,
    originCountry,
    budget, 
    peopleQuantity, 
    acconpanying, 
    tripStyle, 
    locomotionMethod,
    specialWish,
    visitPreferences,
    contacts
  } = route.params.itineraryData;

  // Preparando lista de países se não for o Modo Surpresa e também estilo de viagem e os métodos de locomoção que serão utilizados
  useEffect(() => {
    if (countries && countries.length > 0) {
      var finalText = "";
      for (let i = 0; i < countries.length; i++) {
        finalText += (countries[i] + ", ")
      }
      setAllCountriesTogether(finalText);
    }

    if (tripStyle && tripStyle.length > 0) {
      var finalText = "";
      for (let i = 0; i < tripStyle.length; i++) {
        finalText += (tripStyle[i] + " e ")
      }
      setAllTripStylesTogether(finalText);
    }

    if (locomotionMethod && locomotionMethod.length > 0) {
      var finalText = "";
      for (let i = 0; i < locomotionMethod.length; i++) {
        finalText += (locomotionMethod[i] + ", ")
      }
      setAllVehicleTypesTogether(finalText);
    }
  }, [countries, tripStyle, locomotionMethod]);

  // Texto final do "Preparando os parâmetros inseridos pelo usuário"
  const preferencesAllDefinedText = `Início da viagem em ${ dateBegin } e o fim em ${ dateEnd }, possuindo ${ days } dias de viagem.
  Iremos para ${ continent } e aos países ${ allCountriesTogether }. Somos ${ acconpanying } com ${ peopleQuantity } pessoas e
  de ${ originCountry }. Temos um orçamento de ${ budget }. Viagem com foco em ${ allTripStylesTogether }, utilizaremos ${ allVehicleTypesTogether }
  e temos um desejo para a viagem: ${ specialWish }. Gostamos de ${ route.params.userPreferences?.join(', ') }.`;

  // Padrão de resposta que deve ser retornado para colocar no Object itineraries:
  const answerPattern = `
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "location": "Cidade, País",
      "timeline": [
        {
          "time": "HH:MM",
          "activity": "Descrição da atividade",
          "details": "Detalhes adicionais",
          "coordinates" "-18.245; 09.237"
        }
      ],
      "suggestedActivities": ["Atividade extra recomendada 1", "Atividade extra recomendada 2"]
    },
  `;

  const generateDetailed = async () => {
    const prompt = `Gere um itinerário turístico completo e detalhado para a viagem abaixo, retornando um Object. Cada dia deve conter, considerando tempos de deslocamento realistas (não invente dados, apenas estime com base em trajetos comuns), o seguinte padrão de resposta: ${ answerPattern }. Use apenas os dados fornecidos do usuário para esta viagem: ${ preferencesAllDefinedText }. Retorne apenas este padrão de resposta, nada além disso. Seja bem específico no nome dos locais a serem visitados. Só não especifique nome de hotéis.`;

    console.log("Prompt completo que foi enviado a IA ==> ", prompt);

    try {
      setLoading(true);
      setItinerary('');

      const result = await generateItinerary(prompt);
      setItinerary(JSON.parse(result));

      let trip: CreatingItinerary = {
        title: route.params.itineraryData.title,
        dateBegin: route.params.itineraryData.dateBegin,
        dateEnd: route.params.itineraryData.dateEnd,
        days: route.params.itineraryData.days,
        continent: route.params.itineraryData.continent,
        countries: route.params.itineraryData.countries,
        originCountry: route.params.itineraryData.originCountry,
        visa: route.params.itineraryData.visa,
        budget: route.params.itineraryData.budget,
        peopleQuantity: route.params.itineraryData.peopleQuantity,
        acconpanying: route.params.itineraryData.acconpanying,
        tripStyle: route.params.itineraryData.tripStyle,
        locomotionMethod: route.params.itineraryData.locomotionMethod,
        specialWish: route.params.itineraryData.specialWish,
        visitPreferences: route.params.userPreferences,
        contacts: route.params.itineraryData.contacts,
        itinerary: itinerary
      }
      userTrips.push(trip);

      addNotification({
        title: "Novo Roteiro Pronto",
        description: "Um novo roteiro para a sua incrível próxima viagem foi gerado pela Inteligência Artificial. Confira já!",
        routeIcon: Globe
      });

      await AsyncStorage.setItem(ITINERARY_STORAGE_KEY, JSON.stringify(userTrips));
    } catch (error) {
      setItinerary('Erro ao gerar roteiro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    console.log("Parâmetros recebidos: ", route.params);
    console.log("Dados do itinerário: ", route.params.itineraryData);
    console.log("Preferências do usuário: ", route.params.userPreferences);
    generateDetailed();
  }, []);

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