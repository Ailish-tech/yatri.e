import { useEffect, useState, useCallback } from "react";
import { StyleSheet, Dimensions, FlatList } from "react-native";
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

import { ArrowDown, ArrowUp, CalendarX, ChevronRight, Compass, HandCoins, MessageCircle, Pen, SquarePlus, UtensilsCrossed, Bed, PartyPopper, TreePine, ShoppingBag, Landmark, Plane } from "lucide-react-native";

import { CreatingItinerary } from "../../../@types/CreatingItinerary";
import { AuthNavigationProp } from "@routes/auth.routes";

type ItinerarySliderProps = {
  isLoading: boolean,
  hideBackButton: (hide: boolean) => void
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

export function SlideUpItinerary({ isLoading, hideBackButton }: ItinerarySliderProps) {
  const navigation = useNavigation<AuthNavigationProp>();
  const route = useRoute<RouteProp<{ params: { itineraryData: CreatingItinerary, userPreferences: string[], visaIssue: any } }, 'params'>>();
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
    contacts,
    itinerary,
    pixabayTags,
    images
  } = route.params.itineraryData;

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
      numberOfDay: index + 1,
      nameOfWeekday: weekDaysCalendarConstruction(date)
    }));

    setAllTripDays(daysArray);
  }

  useEffect(() => {
    loadAllDayElements();
  }, [dateBegin, dateEnd]);

  // Atualiza itineraryState quando itinerary muda
  useEffect(() => {
    console.log("itinerary recebido via params:", itinerary);
    if (Array.isArray(itinerary)) {
      console.log("Atualizando itineraryState com:", itinerary);
      setItineraryState(itinerary);
    }
  }, [itinerary]);

  // Debug: Log do estado atual
  useEffect(() => {
    console.log("itineraryState atual:", itineraryState);
  }, [itineraryState]);

  const renderDetail = useCallback((rowData: TimelineItemTypes, index: number) => {
    return (
      <View flex={1} px={2}>
        <Text
          fontSize="$lg"
          fontWeight="$bold"
          color="#2752B7"
          mb={2}
        >
          {rowData.title || 'Atividade sem título'}
        </Text>

        { rowData.description && (
          <Text
            fontSize="$sm"
            color="#666"
            lineHeight="$sm"
            mb={rowData.coordinates ? 2 : 0}
          >
            {rowData.description}
          </Text>
        )}

        {rowData.coordinates && (
          <Text
            fontSize="$xs"
            color="#999"
            fontStyle="italic"
          >
            Coordenadas: {rowData.coordinates}
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
            <ButtonIcon as={HandCoins} color="$black" mr={8} />
            <ButtonText color="$black">Adicionar Custos</ButtonText>
          </View>
          <ButtonIcon as={ChevronRight} color="$black" />
        </Button>
        {
          isEditing
            ?
            <View>
              <Button flexDirection="row" justifyContent="space-between" mt={10} bgColor="transparent" borderWidth={1} borderColor="lightgray">
                <View flexDirection="row">
                  <ButtonIcon as={ArrowUp} color="$black" mr={8} />
                  <ButtonText color="$black">Adicionar antes</ButtonText>
                </View>
                <ButtonIcon as={ChevronRight} color="$black" />
              </Button>
              <Button flexDirection="row" justifyContent="space-between" mt={10} bgColor="transparent" borderWidth={1} borderColor="lightgray">
                <View flexDirection="row">
                  <ButtonIcon as={ArrowDown} color="$black" mr={8} />
                  <ButtonText color="$black">Adicionar depois</ButtonText>
                </View>
                <ButtonIcon as={ChevronRight} color="$black" />
              </Button>
              <Button flexDirection="row" justifyContent="space-between" mt={10} bgColor="transparent" borderWidth={1} borderColor="lightgray">
                <View flexDirection="row">
                  <ButtonIcon as={CalendarX} color="$black" mr={8} />
                  <ButtonText color="$black">Excluir visita</ButtonText>
                </View>
                <ButtonIcon as={ChevronRight} color="$black" />
              </Button>
            </View>
            : null
        }
      </View>
    );
  }, [isEditing]);

  const getTimelineDataForDay = (dayIndex: number) => {
    console.log(`getTimelineDataForDay chamado com dayIndex: ${dayIndex}`);
    console.log("itineraryState disponível:", itineraryState);
    
    if (!itineraryState || !Array.isArray(itineraryState)) {
      console.log("itineraryState não é um array válido");
      return [];
    }

    const dayData = itineraryState.find((day: DayItineraryTypes) => day.day === dayIndex + 1);
    console.log(`Procurando dia ${dayIndex + 1}, encontrado:`, dayData);
    
    const timelineData = dayData?.timeline || [];
    console.log(`Timeline data para o dia ${dayIndex + 1}:`, timelineData);

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
          {isLoading ? (
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

              {itinerary ? (
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
                      console.log(`Renderização: selectedDayIndex=${selectedDayIndex}, timelineData.length=${timelineData.length}`);
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