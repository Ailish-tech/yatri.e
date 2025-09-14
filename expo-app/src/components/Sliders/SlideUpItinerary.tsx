import { useEffect, useState } from "react";
import { StyleSheet, Dimensions, FlatList } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";

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

import { Box, Spinner, View, Text, Button, ButtonIcon } from "@gluestack-ui/themed";

import Timeline from 'react-native-timeline-flatlist';

import { ItinerarySliderDateShow } from "@components/Itinerary/ItinerarySliderDateShow";

import { User } from "lucide-react-native";

import { CreatingItinerary } from "../../../@types/CreatingItinerary";

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
  coordinates?: string
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
  const [allTripDays, setAllTripDays] = useState<CalendarDaysTypes[]>([]); 
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

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
    const expandedHeight = screenHeight * 0.82; // Reduzindo para 82%
    
    return {
      height: withTiming(
        isExpanded ? expandedHeight : collapsedHeight,
        { duration: 300 }
      ),
      bottom: 0,
      transform: [
        { 
          translateY: withTiming(
            isExpanded ? -75 : 0, // Reduzindo o movimento para -75px
            { duration: 300 }
          ) 
        }
      ],
    };
  });

  function weekDaysCalendarConstruction (dateStart: Date | string) {
    const currentSelectedDate = new Date(dateStart);
    const weekdays = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

    return weekdays[currentSelectedDate.getDay()];
  }

  function getDatesBetween(startDate: Date | string, endDate: Date | string): Date[] {
    const start = typeof startDate === "string" ? new Date(startDate) : new Date(startDate);
    const end = typeof endDate === "string" ? new Date(endDate) : new Date(endDate);
    const dates: Date[] = [];

    let current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  function loadAllDayElements () {
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

  const renderDetail = (rowData: TimelineItemTypes, sectionID: any, rowID: any) => {
    const title = (
      <Text 
        fontSize="$lg" 
        fontWeight="$bold" 
        color="#2752B7" 
        mb={2}
      >
        {rowData.title || 'Título não disponível'}
      </Text>
    );

    const description = rowData.description ? (
      <Text 
        fontSize="$sm" 
        color="#666" 
        lineHeight="$sm"
        mb={rowData.coordinates ? 2 : 0}
      >
        {rowData.description}
      </Text>
    ) : null;

    const coordinates = rowData.coordinates ? (
      <Text 
        fontSize="$xs" 
        color="#999" 
        fontStyle="italic"
      >
        Coordenadas: {rowData.coordinates}
      </Text>
    ) : null;

    return (
      <View flex={1} px={2}>
        {title}
        {description}
        {coordinates}
      </View>
    );
  };

  const getTimelineDataForDay = (dayIndex: number) => {
    if (!itinerary || !Array.isArray(itinerary)) return [];
    
    const dayData = itinerary.find((day: DayItineraryTypes) => day.day === dayIndex + 1);
    
    return dayData?.timeline || [];
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
                <Text color="$black" fontSize="$2xl" fontWeight="$bold">{ title }</Text>
                <Button bgColor="lightgray" borderRadius={100} w={25} h={40}><ButtonIcon color="#000" as={ User } /></Button>
              </View>
              
              { itinerary ? (
                <View flex={1} mt={15}>
                  <View>
                    <FlatList 
                      data={ allTripDays }
                      renderItem={ ({ item, index }) => (
                        <ItinerarySliderDateShow 
                          nameOfWeekday={ item.nameOfWeekday } 
                          numberOfDay={ item.numberOfDay } 
                          isSelected={ selectedDayIndex === index }
                          onPress={ () => setSelectedDayIndex(index) }
                        />
                      )}
                      keyExtractor={ item => item.id }
                      horizontal={ true }
                      showsHorizontalScrollIndicator={ false }
                    />
                  </View>
                  <View flex={1} mt={15} pt={10}>
                    {getTimelineDataForDay(selectedDayIndex).length > 0 ? (
                      <Timeline
                        data={ getTimelineDataForDay(selectedDayIndex) }
                        renderDetail={ renderDetail }
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
                          paddingVertical: 4
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
                          marginLeft: 8
                        }}
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
                    )}
                  </View>
                </View>
              ) : (
                <View flex={1} justifyContent="center" alignItems="center">
                  <Text color="#666">
                    Nenhum itinerário disponível
                  </Text>
                </View>
              ) }
            </View>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}