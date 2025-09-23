import { useEffect, useRef, useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet, Image } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import MapView from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Button, ButtonText, View, Text, ButtonIcon, ScrollView } from "@gluestack-ui/themed";

import { GlassView, GlassContainer, isLiquidGlassAvailable } from 'expo-glass-effect';

import { Maps } from "@components/Maps/Maps";
import { SlideUpItinerary } from "@components/Sliders/SlideUpItinerary";

import { generateItinerary } from '@utils/gptRequests';
import { useNotificationStore } from '@utils/notificationStore';
import { filterItineraryData, filterUserPreferences } from '@utils/dataFilters';

import { userTrips } from "@data/itineraries";

import { AuthNavigationProp } from "@routes/auth.routes";

import { CreatingItinerary } from "../../../@types/CreatingItinerary";

import DefaultStatsBackground from "@assets/background.webp";

import { Bed, ChevronLeft, Coins, Compass, Globe, Heart, Images, Landmark, PartyPopper, Plane, ShoppingBag, TreePine, UtensilsCrossed } from 'lucide-react-native';

type ShowMapStatsInformationType = {
  show: "Map" | "Stats"
}

export function ItineraryMapMenu() {
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [allCountriesTogether, setAllCountriesTogether] = useState<string>("");
  const [allTripStylesTogether, setAllTripStylesTogether] = useState<string>("");
  const [allVehicleTypesTogether, setAllVehicleTypesTogether] = useState<string>("");
  const [hideBackButton, setHideBackButton] = useState<boolean>(false);
  const [showMapStatsInformation, setShowMapStatsInformation] = useState<ShowMapStatsInformationType["show"]>("Map");
  const [firstLatitude, setFirstLatitude] = useState<number>();
  const [firstLongitude, setFirstLongitude] = useState<number>();
  const [selectedDay, setSelectedDay] = useState<number>(0);

  const categoriesOptions = ["Ponto Turístico", "Gastronomia", "Hospedagem", "Vida Noturna", "Parques", "Shopping", "Cultura", "Viagens"]

  const navigation = useNavigation<AuthNavigationProp>();
  const route = useRoute<RouteProp<{ params: { itineraryData: CreatingItinerary, userPreferences: string[], visaIssue: any } }, 'params'>>();

  const addNotification = useNotificationStore(state => state.addNotification);

  const mapUserPositionRef = useRef<MapView | null>(null);

  const ITINERARY_STORAGE_KEY = '@eztripai_allUserTripItineraries';

  // Aplicando filtros aos dados recebidos
  const filteredItineraryData = filterItineraryData(route.params.itineraryData);
  const filteredUserPreferences = filterUserPreferences(route.params.userPreferences || []);

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
  } = filteredItineraryData;

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
  Iremos para ${ continent } e aos países ${ allCountriesTogether } (Não acrescente outros locais). Somos ${ acconpanying } com ${ peopleQuantity } pessoas e
  de ${ originCountry }. Temos um orçamento de ${ budget }. Viagem com foco em ${ allTripStylesTogether }, utilizaremos ${ allVehicleTypesTogether }
  e temos um desejo para a viagem: ${ specialWish }. Gostamos de ${ filteredUserPreferences?.join(', ') }.`;

  const preferencesSurpriseDestinationText = `Início da viagem em ${ dateBegin } e o fim em ${ dateEnd }, possuindo ${ days } dias de viagem.
  Somos ${ acconpanying } com ${ peopleQuantity } pessoas e de ${ originCountry }. Temos um orçamento de ${ budget }. Viagem com foco 
  em ${ allTripStylesTogether }, utilizaremos ${ allVehicleTypesTogether } e temos um desejo para a viagem: ${ specialWish }. 
  Gostamos de ${ filteredUserPreferences?.join(', ') }.`;

  const answerPattern = `DAY-> Número do dia; DATE-> YYYY-MM-DD; LOCATION-> Cidade, País; 
  TIMELINE-> { TIME-> HH:MM; TITLE-> Descrição da atividade; DESCRIPTION-> Detalhes adicionais
  COORDINATES-> xx.xxxxx e yy.yyyyy; CATEGORY-> String vazia; };
  SUGGESTEDACTIVITIES->[Atividade extra recomendada 1, Atividade extra recomendada 2];
  PIXABAYTAGS->Tags relevantes para encontrar uma imgaem na API do Pixabay separadas por vírgula`;

  function possibleCategoriesOptionsTogether(){
    let options = "";
    categoriesOptions.forEach(element => {
      options += (element + ", ");
    });

    return options;
  }

  // Função para converter o PlainText estruturado em Object
  const parseAnswerPatternToItinerary = (textResponse: string): any[] => {
    const itinerary: any[] = [];
    
    // Divide por DAY-> para separar cada dia
    const dayBlocks = textResponse.split(/DAY->/g).filter(block => block.trim());
    
    dayBlocks.forEach((dayBlock, index) => {
      const dayNumber = index + 1;
      let currentDay: any = {
        day: dayNumber,
        date: "",
        location: "",
        timeline: [],
        suggestedActivities: [],
        pixabayTags: "",
        images: []
      };

      // Parse da data
      const dateMatch = dayBlock.match(/DATE->\s*([\d-]+)/);
      if (dateMatch) {
        currentDay.date = dateMatch[1].trim();
      }

      // Parse da localização
      const locationMatch = dayBlock.match(/LOCATION->\s*([^;]+)/);
      if (locationMatch) {
        currentDay.location = locationMatch[1].trim();
      }

      // Parse das atividades do timeline - busca por cada bloco entre chaves
      const timelineMatches = dayBlock.match(/\{[^}]+\}/g);
      if (timelineMatches) {
        timelineMatches.forEach(timelineBlock => {
          const timeMatch = timelineBlock.match(/TIME->\s*(\d{1,2}:\d{2})/);
          const titleMatch = timelineBlock.match(/TITLE->\s*([^;]+)/);
          const descMatch = timelineBlock.match(/DESCRIPTION->\s*([^;]+)/);
          const coordMatch = timelineBlock.match(/COORDINATES->\s*([-\d.]+)\s*e\s*([-\d.]+)/);
          const categoryMatch = timelineBlock.match(/CATEGORY->\s*([^;}]*)/);

          if (timeMatch && titleMatch) {
            const coordinates = coordMatch 
              ? `${coordMatch[1]},${coordMatch[2]}` 
              : "0.0000,0.0000";

            const activity = {
              time: timeMatch[1].trim(),
              title: titleMatch[1].trim(),
              description: descMatch ? descMatch[1].trim() : titleMatch[1].trim(),
              coordinates: coordinates,
              category: categoryMatch ? categoryMatch[1].trim() : ""
            };

            currentDay.timeline.push(activity);
          }
        });
      }

      // Parse das atividades sugeridas
      const activitiesMatch = dayBlock.match(/SUGGESTEDACTIVITIES->\s*\[([^\]]+)\]/);
      if (activitiesMatch) {
        currentDay.suggestedActivities = activitiesMatch[1]
          .split(',')
          .map(activity => activity.trim());
      }

      // Parse das tags do Pixabay
      const tagsMatch = dayBlock.match(/PIXABAYTAGS->\s*([^;]+)/);
      if (tagsMatch) {
        currentDay.pixabayTags = tagsMatch[1].trim();
      }

      // Só adiciona o dia se tiver pelo menos uma atividade
      if (currentDay.timeline.length > 0) {
        itinerary.push(currentDay);
      }
    });

    return itinerary;
  };

  const generateDetailed = async () => {
    const prompt = `Gere um itinerário turístico completo e detalhado para uma viagem. Para cada dia, use EXATAMENTE este formato: ${ answerPattern }. Use apenas os dados fornecidos do usuário: ${ preferencesAllDefinedText }. Retorne apenas o texto no formato mostrado, sem explicações extras. Seja específico nos nomes dos locais. Cada dia deve ter entre 5-8 atividades no TIMELINE. Retorne descrições ricas em detalhes com no mínimo 10 palavras. As opções de categorias são (retorne apenas 1): ${ possibleCategoriesOptionsTogether() }`;

    try {
      // Verifica se já existe itinerário nos parâmetros
      const hasExistingItinerary = route.params?.itineraryData?.itinerary && 
        typeof route.params.itineraryData.itinerary === 'object' &&
        Object.keys(route.params.itineraryData.itinerary).length > 0;

      if (!hasExistingItinerary) {
        setLoading(true);
        setItinerary([]);
  
        const result = await generateItinerary(prompt);
        
        if (!result || typeof result !== 'string') {
          throw new Error('Resposta inválida da API');
        }

        // Converte PlainText estruturado para Object
        const generatedItinerary = parseAnswerPatternToItinerary(result);
        
        if (generatedItinerary.length === 0) {
          throw new Error('Não foi possível processar o formato da resposta da IA');
        }
        
        setItinerary(generatedItinerary);

        navigation.setParams({
          itineraryData: {
            ...route.params.itineraryData,
            itinerary: generatedItinerary
          }
        });
  
        let trip: CreatingItinerary = {
          title: filteredItineraryData.title,
          dateBegin: route.params.itineraryData.dateBegin,
          dateEnd: route.params.itineraryData.dateEnd,
          days: filteredItineraryData.days,
          continent: filteredItineraryData.continent,
          countries: filteredItineraryData.countries,
          originCountry: filteredItineraryData.originCountry,
          visa: filteredItineraryData.visa,
          budget: filteredItineraryData.budget,
          peopleQuantity: filteredItineraryData.peopleQuantity,
          acconpanying: filteredItineraryData.acconpanying,
          tripStyle: filteredItineraryData.tripStyle,
          locomotionMethod: filteredItineraryData.locomotionMethod,
          specialWish: filteredItineraryData.specialWish,
          visitPreferences: filteredUserPreferences,
          contacts: filteredItineraryData.contacts,
          itinerary: generatedItinerary
        }
        userTrips.push(trip);
  
        addNotification({
          title: "Novo Roteiro Pronto",
          description: "Um novo roteiro para a sua incrível próxima viagem foi gerado pela Inteligência Artificial. Confira já!",
          routeIcon: Globe
        });
  
        await AsyncStorage.setItem(ITINERARY_STORAGE_KEY, JSON.stringify(userTrips));
      }
    } catch (error) {
      console.error('Erro ao gerar roteiro detalhado:', error);
      setItinerary([]);
    } finally {
      setLoading(false);
    }
  }

  const generateSurprise = async () => {
    const prompt = `Gere um itinerário turístico completo e detalhado para uma viagem com um destino surpresa em qualquer local do mundo. Para cada dia, use EXATAMENTE este formato: ${answerPattern}. Use apenas os dados fornecidos do usuário: ${preferencesSurpriseDestinationText}. Retorne apenas o texto no formato mostrado, sem explicações extras. Seja específico nos nomes dos locais. Cada dia deve ter entre 5-8 atividades no TIMELINE.  Retorne descrições ricas em detalhes com no mínimo 10 palavras. As opções de categorias são (retorne apenas 1): ${ possibleCategoriesOptionsTogether() }`;

    try {
      // Verifica se já existe itinerário nos parâmetros
      const hasExistingItinerary = route.params?.itineraryData?.itinerary && 
        typeof route.params.itineraryData.itinerary === 'object' &&
        Object.keys(route.params.itineraryData.itinerary).length > 0;

      if (!hasExistingItinerary) {
        setLoading(true);
        setItinerary([]);
  
        const result = await generateItinerary(prompt);
        
        if (!result || typeof result !== 'string') {
          throw new Error('Resposta inválida da API');
        }

        // Parse do PlainText estruturado para formato de objeto
        const generatedItinerary = parseAnswerPatternToItinerary(result);
        
        if (generatedItinerary.length === 0) {
          throw new Error('Não foi possível processar o formato da resposta da IA');
        }
        
        setItinerary(generatedItinerary);

        navigation.setParams({
          itineraryData: {
            ...route.params.itineraryData,
            itinerary: generatedItinerary
          }
        });
  
        let trip: CreatingItinerary = {
          title: filteredItineraryData.title,
          dateBegin: route.params.itineraryData.dateBegin,
          dateEnd: route.params.itineraryData.dateEnd,
          days: filteredItineraryData.days,
          continent: filteredItineraryData.continent,
          countries: filteredItineraryData.countries,
          originCountry: filteredItineraryData.originCountry,
          visa: filteredItineraryData.visa,
          budget: filteredItineraryData.budget,
          peopleQuantity: filteredItineraryData.peopleQuantity,
          acconpanying: filteredItineraryData.acconpanying,
          tripStyle: filteredItineraryData.tripStyle,
          locomotionMethod: filteredItineraryData.locomotionMethod,
          specialWish: filteredItineraryData.specialWish,
          visitPreferences: filteredUserPreferences,
          contacts: filteredItineraryData.contacts,
          itinerary: generatedItinerary
        }
        userTrips.push(trip);
  
        addNotification({
          title: "Novo Roteiro Pronto",
          description: "Um novo roteiro para a sua incrível próxima viagem foi gerado pela Inteligência Artificial. Confira já!",
          routeIcon: Globe
        });
  
        await AsyncStorage.setItem(ITINERARY_STORAGE_KEY, JSON.stringify(userTrips));
      }
    } catch (error) {
      console.error('Erro ao gerar roteiro surpresa:', error);
      setItinerary([]);
    } finally {
      setLoading(false);
    }
  }

  // Função para converter itinerário em pontos para o mapa em um dia específico que estará selecionado
  const convertItineraryToMapPoints = (itineraryData: any[], dayIndex: number): Array<{title: string, description: string, coordinate: {latitude: number, longitude: number}}> => {    
    const points: Array<{title: string, description: string, coordinate: {latitude: number, longitude: number}}> = [];
    
    if (!Array.isArray(itineraryData)) {
      return points;
    }

    // Busca o dia específico pelo index dele
    const selectedDayData = itineraryData.find(day => day.day === dayIndex + 1);
    
    if (selectedDayData && selectedDayData.timeline && Array.isArray(selectedDayData.timeline)) {
      selectedDayData.timeline.forEach((activity: any) => {
        if (activity.coordinates && activity.coordinates !== "0.0000,0.0000") {
          const [lat, lng] = activity.coordinates.split(',').map(Number);
          if (!isNaN(lat) && !isNaN(lng)) {
            const point = {
              title: activity.title || 'Atividade',
              description: `${activity.time} - ${activity.description || activity.title}`,
              coordinate: {
                latitude: lat,
                longitude: lng
              }
            };
            points.push(point);
          }
        }
      });
    }
    return points;
  };

  useEffect(() => {
    // Verifica se há itinerário nos parâmetros e define no estado local
    const existingItinerary = route.params?.itineraryData?.itinerary;
    
    if (existingItinerary && Array.isArray(existingItinerary) && existingItinerary.length > 0) {
      setItinerary(existingItinerary);
      return;
    }

    // Só executa geração se não há itinerário nos parâmetros
    const hasExistingItinerary = route.params?.itineraryData?.itinerary && 
      typeof route.params.itineraryData.itinerary === 'object' &&
      Object.keys(route.params.itineraryData.itinerary).length > 0;

    if (!hasExistingItinerary && allTripStylesTogether !== "" && allVehicleTypesTogether !== "") {
      if (countries && countries.length > 0) {
        if (allCountriesTogether !== "") {
          generateDetailed();
        }
      } else {
        generateSurprise();
      }
    }
  }, [allCountriesTogether, allTripStylesTogether, allVehicleTypesTogether]);

  const styles = StyleSheet.create({
    containerStyle: {
      marginTop: 135,
      marginBottom: 175,
      marginHorizontal: 15,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-around',
      gap: 10,
    },
    glass: {
      width: 166,
      height: 140,
      borderRadius: 15,
      flexDirection: 'column',
      margin: 5,
    }
  });

  return (
    <View flex={1} position="relative">
      {
        hideBackButton === false 
        ? 
          <View>
            <Button 
              bgColor="lightgray"
              borderRadius={100}
              zIndex={10}
              w={50}
              h={50}
              style={{ position: "absolute", top: 65, left: 10 }} 
              onPress={ () => navigation.navigate("GenerateItineraryMenu") }
            >
              <ButtonIcon as={ ChevronLeft } color="#000" size="xl" />
            </Button>
            <View flexDirection="row" position="absolute" top={70} right={10} zIndex={1}>
              <Button 
                bgColor={ showMapStatsInformation === "Map" ? "#2752B7" : "lightgray" } 
                borderTopLeftRadius={10}
                borderBottomLeftRadius={10}
                borderTopRightRadius={0}
                borderBottomRightRadius={0}
                onPress={ () => setShowMapStatsInformation("Map") }
                marginBottom={5}
              >
                <ButtonText color={ showMapStatsInformation === "Map" ? "#FFF" : "#000" }>Mapa</ButtonText>
              </Button>
              <Button 
                bgColor={ showMapStatsInformation === "Stats" ? "#2752B7" : "lightgray" }
                borderTopLeftRadius={0}
                borderBottomLeftRadius={0}
                borderTopRightRadius={10}
                borderBottomRightRadius={10}
                onPress={ () => setShowMapStatsInformation("Stats") }
              >
                <ButtonText color={ showMapStatsInformation === "Stats" ? "#FFF" : "#000" }>Stats</ButtonText>
              </Button>
            </View>
          </View>
        : null
      }
      <StatusBar barStyle="dark-content" />
      <View style={{ flex: 1 }}>
        {
          showMapStatsInformation === "Map"
          ?
            <Maps 
              ref={ mapUserPositionRef } 
              initialLatitude={ firstLatitude?.toString() } 
              initialLongitude={ firstLongitude?.toString() } 
              itineraryPlaces={ convertItineraryToMapPoints(itinerary, selectedDay) } 
            />
          :
            <View flex={1}>
              <Image
                source={DefaultStatsBackground}
                style={{ position: "absolute", width: "100%", height: "100%" }}
                resizeMode="cover"
              />
              <ScrollView>
                <GlassContainer spacing={10} style={ styles.containerStyle }>
                  <GlassView style={styles.glass} glassEffectStyle="clear">
                    {
                      isLiquidGlassAvailable()
                        ?
                        <View flex={1} p={12} borderRadius={20} justifyContent="center" alignItems="center">
                          <View
                            p={12}
                            borderRadius={50}
                            bgColor="rgba(255, 255, 255, 0.2)"
                            mb={12}
                            flexDirection="row"
                            justifyContent="space-between"
                            alignItems="center"
                            width="100%"
                          >
                            <Compass size={45} color="#FFF" strokeWidth={2.25} />
                            <Text fontSize="$4xl" fontWeight="$semibold" color="#FDFDFD">0</Text>
                          </View>
                          <Text fontSize="$lg" fontWeight="$semibold" color="#FDFDFD" textAlign="center">Pontos Turísticos</Text>
                        </View>
                        :
                        <View flex={1} bgColor="rgba(255, 255, 255, 0.452)" p={12} borderRadius={20} justifyContent="center" alignItems="center">
                          <View
                            p={12}
                            borderRadius={50}
                            bgColor="rgba(255, 255, 255, 0.2)"
                            mb={12}
                            flexDirection="row"
                            justifyContent="space-between"
                            alignItems="center"
                            width="100%"
                          >
                            <Compass size={45} color="#FFF" strokeWidth={2.25} />
                            <Text fontSize="$4xl" fontWeight="$semibold" color="#FDFDFD">0</Text>
                          </View>
                          <Text fontSize="$lg" fontWeight="$semibold" color="#FDFDFD" textAlign="center">Pontos Turísticos</Text>
                        </View>
                    }
                  </GlassView>
                  <GlassView style={styles.glass} glassEffectStyle="clear">
                    {
                      isLiquidGlassAvailable()
                        ?
                        <View flex={1} p={12} borderRadius={20} justifyContent="center" alignItems="center">
                          <View
                            p={12}
                            borderRadius={50}
                            bgColor="rgba(255, 255, 255, 0.2)"
                            mb={12}
                            flexDirection="row"
                            justifyContent="space-between"
                            alignItems="center"
                            width="100%"
                          >
                            <UtensilsCrossed size={45} color="#FFF" strokeWidth={2.25} />
                            <Text fontSize="$4xl" fontWeight="$semibold" color="#FDFDFD">0</Text>
                          </View>
                          <Text fontSize="$lg" fontWeight="$semibold" color="#FDFDFD" textAlign="center">Restaurantes</Text>
                        </View>
                        :
                        <View flex={1} bgColor="rgba(255, 255, 255, 0.452)" p={12} borderRadius={20} justifyContent="center" alignItems="center">
                          <View
                            p={12}
                            borderRadius={50}
                            bgColor="rgba(255, 255, 255, 0.2)"
                            mb={12}
                            flexDirection="row"
                            justifyContent="space-between"
                            alignItems="center"
                            width="100%"
                          >
                            <UtensilsCrossed size={45} color="#FFF" strokeWidth={2.25} />
                            <Text fontSize="$4xl" fontWeight="$semibold" color="#FDFDFD">0</Text>
                          </View>
                          <Text fontSize="$lg" fontWeight="$semibold" color="#FDFDFD" textAlign="center">Restaurantes</Text>
                        </View>
                    }
                  </GlassView>
                  <GlassView style={styles.glass} glassEffectStyle="clear">
                    {
                      isLiquidGlassAvailable()
                        ?
                        <View flex={1} p={12} borderRadius={20} justifyContent="center" alignItems="center">
                          <View
                            p={12}
                            borderRadius={50}
                            bgColor="rgba(255, 255, 255, 0.2)"
                            mb={12}
                            flexDirection="row"
                            justifyContent="space-between"
                            alignItems="center"
                            width="100%"
                          >
                            <Bed size={45} color="#FFF" strokeWidth={2.25} />
                            <Text fontSize="$4xl" fontWeight="$semibold" color="#FDFDFD">0</Text>
                          </View>
                          <Text fontSize="$lg" fontWeight="$semibold" color="#FDFDFD" textAlign="center">Hospedagens</Text>
                        </View>
                        :
                        <View flex={1} bgColor="rgba(255, 255, 255, 0.452)" p={12} borderRadius={20} justifyContent="center" alignItems="center">
                          <View
                            p={12}
                            borderRadius={50}
                            bgColor="rgba(255, 255, 255, 0.2)"
                            mb={12}
                            flexDirection="row"
                            justifyContent="space-between"
                            alignItems="center"
                            width="100%"
                          >
                            <Bed size={45} color="#FFF" strokeWidth={2.25} />
                            <Text fontSize="$4xl" fontWeight="$semibold" color="#FDFDFD">0</Text>
                          </View>
                          <Text fontSize="$lg" fontWeight="$semibold" color="#FDFDFD" textAlign="center">Hospedagens</Text>
                        </View>
                    }
                  </GlassView>
                  <GlassView style={styles.glass} glassEffectStyle="clear">
                    {
                      isLiquidGlassAvailable()
                        ?
                        <View flex={1} p={12} borderRadius={20} justifyContent="center" alignItems="center">
                          <View
                            p={12}
                            borderRadius={50}
                            bgColor="rgba(255, 255, 255, 0.2)"
                            mb={12}
                            flexDirection="row"
                            justifyContent="space-between"
                            alignItems="center"
                            width="100%"
                          >
                            <PartyPopper size={45} color="#FFF" strokeWidth={2.25} />
                            <Text fontSize="$4xl" fontWeight="$semibold" color="#FDFDFD">0</Text>
                          </View>
                          <Text fontSize="$lg" fontWeight="$semibold" color="#FDFDFD" textAlign="center">Vida Noturna</Text>
                        </View>
                        :
                        <View flex={1} bgColor="rgba(255, 255, 255, 0.452)" p={12} borderRadius={20} justifyContent="center" alignItems="center">
                          <View
                            p={12}
                            borderRadius={50}
                            bgColor="rgba(255, 255, 255, 0.2)"
                            mb={12}
                            flexDirection="row"
                            justifyContent="space-between"
                            alignItems="center"
                            width="100%"
                          >
                            <PartyPopper size={45} color="#FFF" strokeWidth={2.25} />
                            <Text fontSize="$4xl" fontWeight="$semibold" color="#FDFDFD">0</Text>
                          </View>
                          <Text fontSize="$lg" fontWeight="$semibold" color="#FDFDFD" textAlign="center">Vida Noturna</Text>
                        </View>
                    }
                  </GlassView>
                  <GlassView style={styles.glass} glassEffectStyle="clear">
                    {
                      isLiquidGlassAvailable()
                        ?
                        <View flex={1} p={12} borderRadius={20} justifyContent="center" alignItems="center">
                          <View
                            p={12}
                            borderRadius={50}
                            bgColor="rgba(255, 255, 255, 0.2)"
                            mb={12}
                            flexDirection="row"
                            justifyContent="space-between"
                            alignItems="center"
                            width="100%"
                          >
                            <TreePine size={45} color="#FFF" strokeWidth={2.25} />
                            <Text fontSize="$4xl" fontWeight="$semibold" color="#FDFDFD">0</Text>
                          </View>
                          <Text fontSize="$lg" fontWeight="$semibold" color="#FDFDFD" textAlign="center">Parques</Text>
                        </View>
                        :
                        <View flex={1} bgColor="rgba(255, 255, 255, 0.452)" p={12} borderRadius={20} justifyContent="center" alignItems="center">
                          <View
                            p={12}
                            borderRadius={50}
                            bgColor="rgba(255, 255, 255, 0.2)"
                            mb={12}
                            flexDirection="row"
                            justifyContent="space-between"
                            alignItems="center"
                            width="100%"
                          >
                            <TreePine size={45} color="#FFF" strokeWidth={2.25} />
                            <Text fontSize="$4xl" fontWeight="$semibold" color="#FDFDFD">0</Text>
                          </View>
                          <Text fontSize="$lg" fontWeight="$semibold" color="#FDFDFD" textAlign="center">Parques</Text>
                        </View>
                    }
                  </GlassView>
                  <GlassView style={styles.glass} glassEffectStyle="clear">
                    {
                      isLiquidGlassAvailable()
                        ?
                        <View flex={1} p={12} borderRadius={20} justifyContent="center" alignItems="center">
                          <View
                            p={12}
                            borderRadius={50}
                            bgColor="rgba(255, 255, 255, 0.2)"
                            mb={12}
                            flexDirection="row"
                            justifyContent="space-between"
                            alignItems="center"
                            width="100%"
                          >
                            <ShoppingBag size={45} color="#FFF" strokeWidth={2.25} />
                            <Text fontSize="$4xl" fontWeight="$semibold" color="#FDFDFD">0</Text>
                          </View>
                          <Text fontSize="$lg" fontWeight="$semibold" color="#FDFDFD" textAlign="center">Shopping</Text>
                        </View>
                        :
                        <View flex={1} bgColor="rgba(255, 255, 255, 0.452)" p={12} borderRadius={20} justifyContent="center" alignItems="center">
                          <View
                            p={12}
                            borderRadius={50}
                            bgColor="rgba(255, 255, 255, 0.2)"
                            mb={12}
                            flexDirection="row"
                            justifyContent="space-between"
                            alignItems="center"
                            width="100%"
                          >
                            <ShoppingBag size={45} color="#FFF" strokeWidth={2.25} />
                            <Text fontSize="$4xl" fontWeight="$semibold" color="#FDFDFD">0</Text>
                          </View>
                          <Text fontSize="$lg" fontWeight="$semibold" color="#FDFDFD" textAlign="center">Shopping</Text>
                        </View>
                    }
                  </GlassView>
                  <GlassView style={styles.glass} glassEffectStyle="clear">
                    {
                      isLiquidGlassAvailable()
                        ?
                        <View flex={1} p={12} borderRadius={20} justifyContent="center" alignItems="center">
                          <View
                            p={12}
                            borderRadius={50}
                            bgColor="rgba(255, 255, 255, 0.2)"
                            mb={12}
                            flexDirection="row"
                            justifyContent="space-between"
                            alignItems="center"
                            width="100%"
                          >
                            <Landmark size={45} color="#FFF" strokeWidth={2.25} />
                            <Text fontSize="$4xl" fontWeight="$semibold" color="#FDFDFD">0</Text>
                          </View>
                          <Text fontSize="$lg" fontWeight="$semibold" color="#FDFDFD" textAlign="center">Cultura</Text>
                        </View>
                        :
                        <View flex={1} bgColor="rgba(255, 255, 255, 0.452)" p={12} borderRadius={20} justifyContent="center" alignItems="center">
                          <View
                            p={12}
                            borderRadius={50}
                            bgColor="rgba(255, 255, 255, 0.2)"
                            mb={12}
                            flexDirection="row"
                            justifyContent="space-between"
                            alignItems="center"
                            width="100%"
                          >
                            <Landmark size={45} color="#FFF" strokeWidth={2.25} />
                            <Text fontSize="$4xl" fontWeight="$semibold" color="#FDFDFD">0</Text>
                          </View>
                          <Text fontSize="$lg" fontWeight="$semibold" color="#FDFDFD" textAlign="center">Cultura</Text>
                        </View>
                    }
                  </GlassView>
                  <GlassView style={styles.glass} glassEffectStyle="clear">
                    {
                      isLiquidGlassAvailable()
                        ?
                        <View flex={1} p={12} borderRadius={20} justifyContent="center" alignItems="center">
                          <View
                            p={12}
                            borderRadius={50}
                            bgColor="rgba(255, 255, 255, 0.2)"
                            mb={12}
                            flexDirection="row"
                            justifyContent="space-between"
                            alignItems="center"
                            width="100%"
                          >
                            <Plane size={45} color="#FFF" strokeWidth={2.25} />
                            <Text fontSize="$4xl" fontWeight="$semibold" color="#FDFDFD">0</Text>
                          </View>
                          <Text fontSize="$lg" fontWeight="$semibold" color="#FDFDFD" textAlign="center">Viagem</Text>
                        </View>
                        :
                        <View flex={1} bgColor="rgba(255, 255, 255, 0.452)" p={12} borderRadius={20} justifyContent="center" alignItems="center">
                          <View
                            p={12}
                            borderRadius={50}
                            bgColor="rgba(255, 255, 255, 0.2)"
                            mb={12}
                            flexDirection="row"
                            justifyContent="space-between"
                            alignItems="center"
                            width="100%"
                          >
                            <Plane size={45} color="#FFF" strokeWidth={2.25} />
                            <Text fontSize="$4xl" fontWeight="$semibold" color="#FDFDFD">0</Text>
                          </View>
                          <Text fontSize="$lg" fontWeight="$semibold" color="#FDFDFD" textAlign="center">Viagem</Text>
                        </View>
                    }
                  </GlassView>
                  <GlassView style={styles.glass} glassEffectStyle="clear">
                    {
                      isLiquidGlassAvailable()
                        ?
                        <Button 
                          borderRadius={100} 
                          justifyContent="center" 
                          alignItems="center" 
                          w={90} 
                          h={90}
                        >
                          <View
                            p={12}
                            borderRadius={100}
                            bgColor="rgba(255, 255, 255, 0.2)"
                            flexDirection="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Images size={40} color="#FFF" strokeWidth={2.25} />
                          </View>
                        </Button>
                        :
                        <Button 
                          bgColor="rgba(255, 255, 255, 0.452)" 
                          borderRadius={100} 
                          justifyContent="center" 
                          alignItems="center" 
                          w={90} 
                          h={90}
                        >
                          <View
                            p={12}
                            borderRadius={100}
                            bgColor="rgba(255, 255, 255, 0.2)"
                            flexDirection="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Images size={40} color="#FFF" strokeWidth={2.25} />
                          </View>
                        </Button>
                    }
                  </GlassView>
                  <GlassView style={styles.glass} glassEffectStyle="clear">
                    {
                      isLiquidGlassAvailable()
                        ?
                        <View borderRadius={100} justifyContent="center" alignItems="center" w={90} h={90}>
                          <View
                            p={12}
                            borderRadius={100}
                            bgColor="rgba(255, 255, 255, 0.2)"
                            flexDirection="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Heart size={40} color="#FFF" strokeWidth={2.25} />
                          </View>
                        </View>
                        :
                        <View bgColor="rgba(255, 255, 255, 0.452)" borderRadius={100} justifyContent="center" alignItems="center" w={90} h={90}>
                          <View
                            p={12}
                            borderRadius={100}
                            bgColor="rgba(255, 255, 255, 0.2)"
                            flexDirection="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Heart size={40} color="#FFF" strokeWidth={2.25} />
                          </View>
                        </View>
                    }
                  </GlassView>
                </GlassContainer>
              </ScrollView>
            </View>
        }
      </View>
      <View position="absolute" bottom={0} left={0} right={0}>
        <SafeAreaView>
          <SlideUpItinerary
            isLoading={ loading }
            hideBackButton={ setHideBackButton }
            setFirstLatitude={ setFirstLatitude }
            setFirstLongitude={ setFirstLongitude }
            setSelectedDay={ setSelectedDay }
          />
        </SafeAreaView>
      </View>
    </View>
  )
}