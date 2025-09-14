import { StatusBar, FlatList } from "react-native";
import { ImageBackground } from "@assets/mountains.jpg";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  InputField,
  Icon,
  Avatar,
  AvatarImage,
  Pressable,
  ScrollView,
  Image,
  View,
  ButtonText,
  ButtonIcon
} from "@gluestack-ui/themed";
import { Search, Plane, Hotel, Gift, Tag, Menu, LucidePlane, Building, TentTree, Crown } from "lucide-react-native";
import { SafeAreaView } from "react-native";

const destinations = [
  { name: "Dubai", img: require("@assets/Cities/dubai.jpg") },
  { name: "Maldives", img: require("@assets/Cities/maldives.jpg") },
  { name: "Bali", img: require("@assets/Cities/bali.jpg") },
  { name: "Venice", img: require("@assets/Cities/venice.jpg") },
  { name: "London", img: require("@assets/Cities/london.jpg") },
];

const recommended = [
  { name: "Ankara", img: require("@assets/Cities/ankara.jpg") },
  { name: "Maldives", img: require("@assets/Cities/maldives.jpg") },
  { name: "Venice", img: require("@assets/Cities/venice.jpg") },
];

const popular = [
  { name: "Turkey", img: require("@assets/Cities/ankara.jpg") },
  { name: "Maldives", img: require("@assets/Cities/maldives.jpg") },
  { name: "Venice", img: require("@assets/Cities/venice.jpg") },
];

export function Home() {
  return (
    <SafeAreaView style={{flex:1}} >
      <StatusBar barStyle={"light-content"}/>
      <ScrollView bg="#fff">
      {/* Header with background image */}
      
      <Image
        source={require("@assets/mountains.jpg")}
        resizeMode="cover"
        alt=""
        position="absolute"
        top={0}
        left={0}
        right={0}
        w="100%"
        h={320}
      />
        <View justifyContent="space-between" mt={40} mx={10}>
          <View justifyContent="space-between" alignItems="center" flexDirection="row" mb={20}>
            <Icon as={Menu} color="#fff" size="xl" />
            <Avatar size="md" borderWidth={2} borderColor="#fff">
              <AvatarImage
                source={{
                  uri: "https://i.pravatar.cc/100",
                }}
              />
            </Avatar>
          </View>
          <View mt={-15}>
            <Text size="2xl" bold color="#fff">
              Hello! Mehdi
            </Text>
            <Text size="md" fontWeight="$semibold" color="#fff">
              Where would you like to go?
            </Text>
          </View>
          {/* Quick Action Buttons */}
          <View mt={20} px={20} flexDirection="row" gap={20} justifyContent="center">
            <Button w={80} h={100} borderRadius="$2xl" bg="rgba(151, 151, 151, 0.4)" borderWidth={2} borderColor="$blue400" flexDirection="column" alignItems="center" justifyContent="center">
              <ButtonIcon as={Plane} size="xl"/>
              <ButtonText w="180%" textAlign="center" fontWeight={"$medium"} >Flight</ButtonText>
            </Button>
            <Button w={80} h={100} borderRadius="$2xl" bg="rgba(151, 151, 151, 0.4)" borderWidth={2} borderColor="$blue400" flexDirection="column" alignItems="center" justifyContent="center">
              <ButtonIcon as={Building} size="xl"/>
              <ButtonText w="180%" textAlign="center" fontWeight={"$medium"}>Hotel</ButtonText>
            </Button>
            <Button w={80} h={100} borderRadius="$2xl" bg="rgba(151, 151, 151, 0.4)" borderWidth={2} borderColor="$blue400" flexDirection="column" alignItems="center" justifyContent="center">
              <ButtonIcon as={TentTree} size="xl"/>
              <ButtonText w="200%" textAlign="center" fontWeight={"$medium"}>Holiday</ButtonText>
            </Button>
            <Button w={80} h={100} borderRadius="$2xl" bg="rgba(151, 151, 151, 0.4)" borderWidth={2} borderColor="$blue400" flexDirection="column" alignItems="center" justifyContent="center">
              <ButtonIcon as={Crown} size="xl"/>
              <ButtonText w="200%" textAlign="center" fontWeight={"$medium"}>Premium</ButtonText>
            </Button>
          </View>
        </View>
        

        {/* Search Bar */}
        <View px="$4" bottom={-35} left={0} right={0}>
          <Input
            borderRadius="$full"
            bg="#fff"
            px="$4"
            py="$2"
            alignItems="center"
            shadowColor="#000"
            shadowOpacity={0.07}
            shadowRadius={8}
            elevation={2}
          >
            <Icon as={Search} mr="$2" color="#999" />
            <InputField placeholder="Where to go" />
          </Input>
        </View>
    

      {/* Destinations */}
      <View mt={60} px="$4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Box flexDirection="row">
            {destinations.map((item, index) => (
              <View key={index} alignItems="center" ml={index === 0 ? 0 : 16}>
                <Box
                  w={70}
                  h={70}
                  borderRadius="$full"
                  overflow="hidden"
                  borderWidth={2}
                  borderColor="#0A84FF"
                  bg="#fff"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Image
                    source={item.img}
                    style={{ width: 66, height: 66, borderRadius: 33 }}
                    alt=""
                  />
                </Box>
                <Text mt="$2" size="sm">
                  {item.name}
                </Text>
              </View>
            ))}
          </Box>
        </ScrollView>
      </View>

    
      {/* Recommended Section */}
      <Box mt="$6" px="$4">
        <View justifyContent="space-between" mb="$2" flexDirection="row" alignItems="center">
          <Text size="lg" bold>
            Recommended
          </Text>
          <Pressable>
            <Text size="sm" color="#0A84FF">
              View All
            </Text>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {recommended.map((item, index) => (
            <Box
              key={index}
              w={180}
              h={260}
              borderRadius="$3xl"
              overflow="hidden"
              bg="#f0f0f0"
              shadowColor="#000"
              shadowOpacity={0.1}
              shadowRadius={6}
              mr="$3"
            >
              <Image
                source={item.img}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
                alt=""
              />
              <Box
                position="absolute"
                bottom={0}
                w="100%"
                py="$2"
                bg="rgba(0,0,0,0.4)"
                alignItems="center"
              >
                <Text color="#fff" bold>
                  {item.name}
                </Text>
              </Box>
            </Box>
          ))}
        </ScrollView>
      </Box>

      {/* Popular Destination */}
      <Box mt="$6" px="$4">
        <Text size="lg" bold mb="$2">
          Popular Destination
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {popular.map((item, index) => (
            <Box
              key={index}
              w={180}
              h={260}
              borderRadius="$2xl"
              overflow="hidden"
              bg="#f0f0f0"
              shadowColor="#000"
              shadowOpacity={0.1}
              shadowRadius={6}
              mr="$3"
            >
              <Image
                source={item.img}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
                alt=""
              />
              <Box
                position="absolute"
                bottom={0}
                w="100%"
                py="$2"
                bg="rgba(0,0,0,0.4)"
                alignItems="center"
              >
                <Text color="#fff" bold>
                  {item.name}
                </Text>
              </Box>
            </Box>
            ))}
        </ScrollView>
      </Box>
    </ScrollView>
    </SafeAreaView>
  );
}