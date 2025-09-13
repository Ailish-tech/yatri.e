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

export function SlideUpItinerary({ isLoading, hideBackButton }: ItinerarySliderProps) {
  const [allTripDays, setAllTripDays] = useState<CalendarDaysTypes[]>([]); 

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

  const animatedStyle = useAnimatedStyle(() => ({
    height: withTiming(
      position.value === 0 
        ? 200
        : screenHeight - 100,
      { duration: 300 }
    ),
    transform: [{ translateY: position.value }],
  }));

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

  const styles = StyleSheet.create({
    slider: {
      width: "100%",
      backgroundColor: '#FDFDFD',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      position: 'absolute',
      bottom: 0,
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
                  <FlatList 
                    data={ allTripDays }
                    renderItem={ ({ item }) => (
                      <ItinerarySliderDateShow 
                        nameOfWeekday={ item.nameOfWeekday } 
                        numberOfDay={ item.numberOfDay } 
                      />
                    )}
                    keyExtractor={ item => item.id }
                    horizontal={ true }
                    showsHorizontalScrollIndicator={ false }
                  />
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