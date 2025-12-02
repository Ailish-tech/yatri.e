import { useEffect, useState, useCallback } from "react";
import { StyleSheet, Dimensions, FlatList, Alert } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";

import {
  Gesture,
  GestureDetector,
  Directions,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

import { Box, Spinner, View, Text, Button, ButtonIcon, ButtonText } from "@gluestack-ui/themed";

import Timeline from 'react-native-timeline-flatlist';

import { ItineraryCategoriesDefine } from "@components/Itinerary/ItineraryCategoriesDefine";
import { ItinerarySliderDateShow } from "@components/Itinerary/ItinerarySliderDateShow";

import { useFavoritePlaces } from "../../hooks/useFavoritePlaces";

import { AuthNavigationProp } from "@routes/auth.routes";

import { ArrowDown, ArrowUp, CalendarX, ChevronRight, Compass, HandCoins, MessageCircle, Pen, SquarePlus, UtensilsCrossed, Bed, PartyPopper, TreePine, ShoppingBag, Landmark, Plane, Heart } from "lucide-react-native";

import { CreatingItinerary } from "../../../@types/CreatingItinerary";
import { CategoriesCounterTypes } from "../../../@types/CategoriesCounterTypes";

type ItinerarySliderProps = {
  isLoading: boolean,
  hideBackButton: (hide: boolean) => void,
  setFirstLatitude: (latitude: number) => void,
  setFirstLongitude: (longitude: number) => void,
  setCategoriesCounter: React.Dispatch<React.SetStateAction<CategoriesCounterTypes>>,
  setSelectedDay?: (dayIndex: number) => void
}

type CalendarDaysTypes = {
  id: string,
  numberOfDay: number,
  nameOfWeekday: string
}

type TimelineItemTypes = {
  time: string,
  title: string,
  description: string,
  coordinates?: string,
  category: string
}

type DayItineraryTypes = {
  day: number,
  date: string,
  location: string,
  timeline: TimelineItemTypes[],
  suggestedActivities?: string[],
  pixabayTags?: string,
  images?: string[]
}

export function SlideUpItinerary({ isLoading, hideBackButton, setFirstLatitude, setFirstLongitude, setSelectedDay, setCategoriesCounter }: ItinerarySliderProps) {
  const navigation = useNavigation<AuthNavigationProp>();
  const route = useRoute<RouteProp<{ params: { itineraryData: CreatingItinerary, userPreferences: string[], visaIssue: any } }, 'params'>>();
  const {
    title,
    dateBegin,
    dateEnd,
    itinerary,
  } = route.params.itineraryData;

  const { addFavoritePlace, isFavorite } = useFavoritePlaces();

  const [allTripDays, setAllTripDays] = useState<CalendarDaysTypes[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showCategories, setShowCategories] = useState<boolean>(false);
  const [editingTimelineIndex, setEditingTimelineIndex] = useState<number | null>(null);
  const [itineraryState, setItineraryState] = useState<DayItineraryTypes[]>(Array.isArray(itinerary) ? itinerary : []);

  const { height: screenHeight } = Dimensions.get('window');

  const position = useSharedValue(0);
  const lastDirection = useSharedValue<"UP" | "DOWN" | null>(null);

  const flingUpGesture = Gesture.Fling()
    .direction(Directions.UP)
    .onStart(() => {
      if (lastDirection.value !== "UP") {
        position.value = withTiming(-25, { duration: 300 });
        lastDirection.value = "UP";
        runOnJS(hideBackButton)(true);
      }
    });

  const flingDownGesture = Gesture.Fling()
    .direction(Directions.DOWN)
    .onStart(() => {
      if (lastDirection.value !== "DOWN") {
        position.value = withTiming(0, { duration: 300 });
        lastDirection.value = "DOWN";
        runOnJS(hideBackButton)(false);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const isExpanded = position.value !== 0;
    const collapsedHeight = 200;
    const expandedHeight = screenHeight * 0.82;

    return {
      height: withTiming(
        isExpanded ? expandedHeight : collapsedHeight,
        { duration: 300 }
      ),
      bottom: 0,
      transform: [
        {
          translateY: withTiming(
            isExpanded ? -75 : 0,
            { duration: 300 }
          )
        }
      ],
    };
  });

  const handleSelectCategory = (category: string) => {
    if (editingTimelineIndex === null) return;

    // Obtém a categoria atual antes da mudança para decrementar se necessário
    const currentActivity = itineraryState[selectedDayIndex]?.timeline?.[editingTimelineIndex];
    const oldCategory = currentActivity?.category;

    setCategoriesCounter((prev: CategoriesCounterTypes) => {
      const newCounter = { ...prev };
      
      // Decrementa a categoria antiga se ela existir
      if (oldCategory) {
        switch (oldCategory) {
          case "Ponto Turístico":
            newCounter.touristAttractions = Math.max(0, newCounter.touristAttractions - 1);
            break;
          case "Gastronomia":
            newCounter.restaurant = Math.max(0, newCounter.restaurant - 1);
            break;
          case "Hospedagem":
            newCounter.accomodation = Math.max(0, newCounter.accomodation - 1);
            break;
          case "Vida Noturna":
            newCounter.nightLife = Math.max(0, newCounter.nightLife - 1);
            break;
          case "Parques":
            newCounter.parks = Math.max(0, newCounter.parks - 1);
            break;
          case "Shopping":
            newCounter.shopping = Math.max(0, newCounter.shopping - 1);
            break;
          case "Cultura":
            newCounter.culture = Math.max(0, newCounter.culture - 1);
            break;
          case "Viagens":
            newCounter.travel = Math.max(0, newCounter.travel - 1);
            break;
        }
      }

      // Incrementa a nova categoria
      switch (category) {
        case "Ponto Turístico":
          newCounter.touristAttractions += 1;
          break;
        case "Gastronomia":
          newCounter.restaurant += 1;
          break;
        case "Hospedagem":
          newCounter.accomodation += 1;
          break;
        case "Vida Noturna":
          newCounter.nightLife += 1;
          break;
        case "Parques":
          newCounter.parks += 1;
          break;
        case "Shopping":
          newCounter.shopping += 1;
          break;
        case "Cultura":
          newCounter.culture += 1;
          break;
        case "Viagens":
          newCounter.travel += 1;
          break;
      }
      return newCounter;
    });

    setItineraryState(prev => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const newItinerary = safePrev.map((day, idx) => {
        if (idx === selectedDayIndex) {
          const newTimeline = [...day.timeline];
          newTimeline[editingTimelineIndex] = {
            ...newTimeline[editingTimelineIndex],
            category,
          };
          return { ...day, timeline: newTimeline };
        }
        return day;
      });
      return newItinerary;
    });

    setShowCategories(false);
    setEditingTimelineIndex(null);
  };

  const handleAddToFavorites = async (rowData: TimelineItemTypes, index: number) => {
    const currentDay = itineraryState[selectedDayIndex];
    
    if (!currentDay) return;

    // Gera um ID único para o local favorito
    const placeId = `${title}-${currentDay.day}-${index}-${rowData.time}`;

    // Verifica se já está nos favoritos
    if (isFavorite(placeId)) {
      Alert.alert(
        "Já está nos favoritos",
        `"${rowData.title}" já foi adicionado aos seus locais favoritos.`,
        [{ text: "OK" }]
      );
      return;
    }

    try {
      await addFavoritePlace({
        id: placeId,
        title: rowData.title,
        description: rowData.description,
        coordinates: rowData.coordinates || "0.0000,0.0000",
        category: rowData.category || "",
        location: currentDay.location,
        date: currentDay.date,
        itineraryTitle: title,
        favoritedAt: new Date().toISOString(),
        images: currentDay.images || []
      });

      Alert.alert(
        "Adicionado aos Favoritos!",
        `"${rowData.title}" foi adicionado à sua lista de locais favoritos.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      // DEBUG: console.error('Erro ao adicionar aos favoritos:', error);
      Alert.alert(
        "Erro",
        "Não foi possível adicionar este local aos favoritos. Tente novamente.",
        [{ text: "OK" }]
      );
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Ponto Turístico":
        return Compass;
      case "Gastronomia":
        return UtensilsCrossed;
      case "Hospedagem":
        return Bed;
      case "Vida Noturna":
        return PartyPopper;
      case "Parques":
        return TreePine;
      case "Shopping":
        return ShoppingBag;
      case "Cultura":
        return Landmark;
      case "Viagens":
        return Plane;
      default:
        return SquarePlus;
    }
  };

  function parseDate(dateInput: Date | string): Date {
    if (typeof dateInput === 'string') {
      const dateOnly = dateInput.split('T')[0];
      const [year, month, day] = dateOnly.split('-').map(Number);
      return new Date(year, month - 1, day);
    } else {
      return new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate());
    }
  }

  function weekDaysCalendarConstruction(dateStart: Date | string) {
    const currentSelectedDate = parseDate(dateStart);
    const weekdays = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

    return weekdays[currentSelectedDate.getDay()];
  }

  function getDatesBetween(startDate: Date | string, endDate: Date | string): Date[] {
    const start = parseDate(startDate);
    const end = parseDate(endDate);

    const dates: Date[] = [];
    let current = new Date(start);

    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  function loadAllDayElements() {
    const possibleDays = getDatesBetween(dateBegin, dateEnd);

    const daysArray = possibleDays.map((date, index) => ({
      id: index.toString(),
      numberOfDay: date.getDate(),
      nameOfWeekday: weekDaysCalendarConstruction(date)
    }));

    setAllTripDays(daysArray);
  }

  useEffect(() => {
    loadAllDayElements();
  }, [dateBegin, dateEnd]);

  // Atualiza itineraryState quando itinerary muda
  useEffect(() => {
    if (Array.isArray(itinerary)) {
      setItineraryState(itinerary);
    }
  }, [itinerary]);

  // Conta as categorias existentes no itinerário quando ele é carregado
  useEffect(() => {
    if (!Array.isArray(itineraryState) || itineraryState.length === 0) return;

    const categoryCount = {
      touristAttractions: 0,
      restaurant: 0,
      accomodation: 0,
      nightLife: 0,
      parks: 0,
      shopping: 0,
      culture: 0,
      travel: 0
    };

    itineraryState.forEach((day) => {
      if (day.timeline && Array.isArray(day.timeline)) {
        day.timeline.forEach((activity) => {
          if (activity.category) {
            switch (activity.category) {
              case "Ponto Turístico":
                categoryCount.touristAttractions += 1;
                break;
              case "Gastronomia":
                categoryCount.restaurant += 1;
                break;
              case "Hospedagem":
                categoryCount.accomodation += 1;
                break;
              case "Vida Noturna":
                categoryCount.nightLife += 1;
                break;
              case "Parques":
                categoryCount.parks += 1;
                break;
              case "Shopping":
                categoryCount.shopping += 1;
                break;
              case "Cultura":
                categoryCount.culture += 1;
                break;
              case "Viagens":
                categoryCount.travel += 1;
                break;
            }
          }
        });
      }
    });

    setCategoriesCounter(categoryCount);
  }, [itineraryState]);

  useEffect(() => {
    if (setSelectedDay) {
      setSelectedDay(selectedDayIndex);
    }
  }, [selectedDayIndex, setSelectedDay]);

  useEffect(() => {
    if (!Array.isArray(itinerary)) return;
    const dayOne = itinerary.find((day: any) => day.day === 1);

    let firstLatitude: number | undefined;
    let firstLongitude: number | undefined;

    if (dayOne && dayOne.timeline && dayOne.timeline.length > 0) {
      const firstTimelineItem = dayOne.timeline[0];
      if (firstTimelineItem.coordinates) {
        const [lat, lng] = firstTimelineItem.coordinates.split(',').map(Number);
        firstLatitude = lat;
        firstLongitude = lng;
      }
    }

    if (typeof firstLatitude === "number" && typeof firstLongitude === "number") {
      setFirstLatitude(firstLatitude);
      setFirstLongitude(firstLongitude);
    }
  }, [itinerary]);

  const renderDetail = useCallback((rowData: TimelineItemTypes, index: number) => {
    return (
      <View flex={1} px={2}>
        <Text
          fontSize="$lg"
          fontWeight="$bold"
          color="#2752B7"
          mb={2}
        >
          { rowData.title || 'Atividade sem título' }
        </Text>

        { rowData.description && (
          <Text
            fontSize="$sm"
            color="#666"
            lineHeight="$sm"
            mb={rowData.coordinates ? 2 : 0}
          >
            { rowData.description }
          </Text>
        )}

        { rowData.coordinates && (
          <Text
            fontSize="$xs"
            color="#999"
            fontStyle="italic"
          >
            Coordenadas: { rowData.coordinates }
          </Text>
        )}

        <Button
          flexDirection="row"
          justifyContent="space-between"
          mt={10}
          bgColor="transparent"
          borderWidth={1}
          borderColor="lightgray"
          onPress={() => {
            setEditingTimelineIndex(index);
            setShowCategories(true);
          }}
        >
          <View flexDirection="row">
            <ButtonIcon as={ getCategoryIcon(rowData.category) } color="$black" mr={8} />
            <ButtonText color="$black">{ rowData.category ? rowData.category : "Definir Categoria" }</ButtonText>
          </View>
          <ButtonIcon as={ ChevronRight } color="$black" />
        </Button>
        <Button flexDirection="row" justifyContent="space-between" mt={10} bgColor="transparent" borderWidth={1} borderColor="lightgray">
          <View flexDirection="row">
            <ButtonIcon as={ HandCoins } color="$black" mr={8} />
            <ButtonText color="$black">Adicionar Custos</ButtonText>
          </View>
          <ButtonIcon as={ ChevronRight } color="$black" />
        </Button>
        <Button 
          flexDirection="row" 
          justifyContent="space-between" 
          mt={10} 
          bgColor="transparent" 
          borderWidth={1} 
          borderColor="lightgray"
          onPress={() => handleAddToFavorites(rowData, index)}
        >
          <View flexDirection="row">
            <ButtonIcon as={ Heart } color="$black" mr={8} />
            <ButtonText color="$black">Favoritar Local</ButtonText>
          </View>
          <ButtonIcon as={ ChevronRight } color="$black" />
        </Button>
        {
          isEditing
            ?
            <View>
              <Button flexDirection="row" justifyContent="space-between" mt={10} bgColor="transparent" borderWidth={1} borderColor="lightgray">
                <View flexDirection="row">
                  <ButtonIcon as={ ArrowUp } color="$black" mr={8} />
                  <ButtonText color="$black">Adicionar antes</ButtonText>
                </View>
                <ButtonIcon as={ ChevronRight } color="$black" />
              </Button>
              <Button flexDirection="row" justifyContent="space-between" mt={10} bgColor="transparent" borderWidth={1} borderColor="lightgray">
                <View flexDirection="row">
                  <ButtonIcon as={ ArrowDown } color="$black" mr={8} />
                  <ButtonText color="$black">Adicionar depois</ButtonText>
                </View>
                <ButtonIcon as={ ChevronRight } color="$black" />
              </Button>
              <Button flexDirection="row" justifyContent="space-between" mt={10} bgColor="transparent" borderWidth={1} borderColor="lightgray">
                <View flexDirection="row">
                  <ButtonIcon as={ CalendarX } color="$black" mr={8} />
                  <ButtonText color="$black">Excluir visita</ButtonText>
                </View>
                <ButtonIcon as={ ChevronRight } color="$black" />
              </Button>
            </View>
            : null
        }
      </View>
    );
  }, [isEditing]);

  const getTimelineDataForDay = (dayIndex: number) => {  
    if (!itineraryState || !Array.isArray(itineraryState)) {
      return [];
    }

    const dayData = itineraryState.find((day: DayItineraryTypes) => day.day === dayIndex + 1);
    
    const timelineData = dayData?.timeline || [];

    return timelineData;
  };

  const styles = StyleSheet.create({
    slider: {
      width: "100%",
      backgroundColor: '#FDFDFD',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: -2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    }
  });

  return (
    <GestureDetector gesture={Gesture.Exclusive(flingUpGesture, flingDownGesture)}>
      <Animated.View
        style={[animatedStyle, styles.slider]}
      >
        <View>
          <View
            style={{
              borderColor: "#BBB",
              borderWidth: .5,
              width: 65,
              height: 6,
              borderRadius: 20,
              backgroundColor: "#BBB",
              marginTop: 15,
              marginBottom: 10,
              margin: 'auto'
            }}
          />
        </View>

        <View flex={1} px={4}>
          { isLoading ? (
            <Box flex={1} justifyContent="center" alignItems="center">
              <Spinner size="large" color="#2752B7" />
              <Text mt={2} color="#666">Gerando seu itinerário...</Text>
            </Box>
          ) : (
            <View flex={1} px={8}>
              <View flexDirection="row" justifyContent="space-between" alignItems="center" mt={-5}>
                <View flex={1}>
                  <Text color="$black" fontSize="$2xl" fontWeight="$bold">{title}</Text>
                  {isEditing && (
                    <Text color="#2752B7" fontSize="$sm" fontWeight="$medium">
                      Modo de edição ativo
                    </Text>
                  )}
                </View>
                <View flexDirection="row" alignItems="center">
                  <Button
                    bgColor="lightgray"
                    borderRadius={100}
                    w={40}
                    h={40}
                    mr={10}
                    p={0}
                    onPress={() => navigation.navigate("AIChatMenu")}
                  >
                    <ButtonIcon color="#000" as={MessageCircle} size="lg" />
                  </Button>
                  <Button
                    bgColor={isEditing ? "#2752B7" : "lightgray"}
                    borderRadius={100}
                    w={40}
                    h={40}
                    p={0}
                    onPress={() => setIsEditing(!isEditing)}
                  >
                    <ButtonIcon color={isEditing ? "#fff" : "#000"} as={Pen} size="lg" />
                  </Button>
                </View>
              </View>

              { itinerary ? (
                <View flex={1} mt={15}>
                  <View>
                    <FlatList
                      data={allTripDays}
                      renderItem={({ item, index }) => (
                        <ItinerarySliderDateShow
                          nameOfWeekday={item.nameOfWeekday}
                          numberOfDay={item.numberOfDay}
                          isSelected={selectedDayIndex === index}
                          onPress={() => setSelectedDayIndex(index)}
                        />
                      )}
                      keyExtractor={item => item.id}
                      horizontal={true}
                      showsHorizontalScrollIndicator={false}
                    />
                  </View>
                  <View flex={1} mt={15} pt={10}>
                    {(() => {
                      const timelineData = getTimelineDataForDay(selectedDayIndex);
                      return timelineData.length > 0;
                    })() ? (
                      <Timeline
                        key={`timeline-${selectedDayIndex}-${isEditing}`}
                        data={getTimelineDataForDay(selectedDayIndex)}
                        renderDetail={renderDetail}
                        circleSize={24}
                        circleColor='#2752B7'
                        lineColor='#E0E0E0'
                        lineWidth={2}
                        timeContainerStyle={{
                          minWidth: 60,
                          marginTop: -8,
                          backgroundColor: '#F5F5F5',
                          borderRadius: 8,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                        }}
                        timeStyle={{
                          textAlign: 'center',
                          backgroundColor: 'transparent',
                          color: '#2752B7',
                          fontSize: 14,
                          fontWeight: '600'
                        }}
                        innerCircle={'dot'}
                        dotColor='white'
                        dotSize={12}
                        separatorStyle={{
                          backgroundColor: '#E0E0E0'
                        }}
                        rowContainerStyle={{
                          paddingTop: 5
                        }}
                        eventContainerStyle={{
                          marginLeft: 8,
                          flex: 1
                        }}
                        titleStyle={{ display: 'none' }}
                        descriptionStyle={{ display: 'none' }}
                        isUsingFlatlist={true}
                        options={{
                          showsVerticalScrollIndicator: false,
                          style: { paddingTop: 10 }
                        } as any}
                      />
                    ) : (
                      <View flex={1} justifyContent="center" alignItems="center">
                        <Text color="#666" fontSize="$md">
                          Nenhuma atividade programada para este dia
                        </Text>
                      </View>
                    )}</View>
                </View>
              ) : (
                <View flex={1} justifyContent="center" alignItems="center">
                  <Text color="#666">
                    Nenhum itinerário disponível
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        <ItineraryCategoriesDefine 
          showModal={ showCategories }
          setShowModal={ () => setShowCategories(false) }
          onSelectCategory={ handleSelectCategory }
        />
      </Animated.View>
    </GestureDetector>
  );
}