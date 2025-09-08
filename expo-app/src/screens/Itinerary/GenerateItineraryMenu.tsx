import { useEffect, useState, useRef } from "react";
import { Platform, SafeAreaView, StatusBar, Modal, Image, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";

import Constants from 'expo-constants';

let RewardedAd: any, RewardedAdEventType: any, TestIds: any;
const isExpoGo = Constants.appOwnership === 'expo';

if (!isExpoGo) {
  try {
    const admobModule = require('react-native-google-mobile-ads');
    RewardedAd = admobModule.RewardedAd;
    RewardedAdEventType = admobModule.RewardedAdEventType;
    TestIds = admobModule.TestIds;
  } catch (error) {
    console.log('AdMob module not available:', error);
  }
}

import { Button, ButtonText, ScrollView, Text, View } from "@gluestack-ui/themed";

import { ButtonIconLeft } from "@components/Buttons/ButtonIconLeft";
import { ItineraryCreateDialog } from "@components/Dialogs/ItineraryCreateDialog";
import { UnlockProgressModal } from "@components/Itinerary/UnlockProgressModal";
import { ItinerariesError } from "@components/Errors/ItinerariesError";
import { IconButton } from "@components/Buttons/IconButton";

import { AuthNavigationProp } from "@routes/auth.routes";

import { ArrowLeft, ChevronRight, Coins, Crown, Heart, Plus } from "lucide-react-native";

type MenuItineraryTypes = {
  dialog: boolean,
  filters: "Planejados" | "Rascunhos" | "Passados"
}

export function GenerateItineraryMenu(){
  const [showAlertDialog, setShowAlertDialog] = useState<MenuItineraryTypes["dialog"]>(false);
  const [selectedFilter, setSelectedFilter] = useState<MenuItineraryTypes["filters"]>("Planejados");
  const [adLoaded, setAdLoaded] = useState<boolean>(false);
  const [disableAdIsLoading, setDisableAdIsLoading] = useState<boolean>(false);
  const [showAdImage, setShowAdImage] = useState<boolean>(false);
  const [showAdProgressModal, setShowAdProgressModal] = useState<boolean>(false);
  const [watchedAdsCount, setWatchedAdsCount] = useState<number>(0);
  const [isAdPlaying, setIsAdPlaying] = useState<boolean>(false);

  const totalAdsRequired = 3;
  
  const navigation = useNavigation<AuthNavigationProp>();
  const rewardedRef = useRef<any>(null);

  // Configuração do AdMob
  const getCorrectIdForPlatform = () => {
    if(Platform.OS === "android"){
      return process.env.ADMOB_ANDROID_APP_ID;
    }
    return process.env.ADMOB_IOS_APP_ID;
  }

  const loadNewAd = () => {
    if (isExpoGo || !RewardedAd || !RewardedAdEventType || !TestIds) {
      setAdLoaded(true);
      return;
    }

    try {
      const adUnitId = __DEV__ ? TestIds.REWARDED : getCorrectIdForPlatform();
      const newRewarded = RewardedAd.createForAdRequest(adUnitId, {
        keywords: [
          "adventure travel",
          "airbnb",
          "bleisure travel",
          "booking",
          "car rental",
          "cheap flights",
          "destination dupes",
          "eco tourism",
          "family vacation",
          "fashion",
          "glamping",
          "hotels",
          "honeymoon packages",
          "luxury resorts",
          "solo travel",
          "sustainable travel",
          "tourism",
          "tourist attractions",
          "travel",
          "travel insurance",
          "wellness retreat",
          "wine tours"
        ],
      });

      rewardedRef.current = newRewarded;

      const unsubscribeLoaded = newRewarded.addAdEventListener(
        RewardedAdEventType.LOADED,
        () => {
          setAdLoaded(true);
        },
      );
      
      const unsubscribeEarned = newRewarded.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (reward: any) => {
          console.log('User watched another Rewarded AD', reward);
          setWatchedAdsCount(prev => prev + 1);
          setDisableAdIsLoading(false);
          setTimeout(() => {
            loadNewAd();
          }, 3000);
        },
      );

      const unsubscribeClosed = newRewarded.addAdEventListener(
        'onAdClosed',
        () => {
          console.log('Ad closed');
          setIsAdPlaying(false);
          setDisableAdIsLoading(false);
        },
      );

      newRewarded.load();

      return () => {
        unsubscribeLoaded();
        unsubscribeEarned();
        unsubscribeClosed();
      };
    } catch (error) {
      console.log('Error loading ad:', error);
      setAdLoaded(true);
    }
  };

  const handleNewItinerary = () => {
    if (watchedAdsCount === totalAdsRequired) {
      setDisableAdIsLoading(false);
      setWatchedAdsCount(0);
      setShowAlertDialog(true);
    } else {
      setShowAdProgressModal(true);
    }
  };

  const handleCloseAdProgressModal = () => {
    setShowAdProgressModal(false);
    setDisableAdIsLoading(false);
  };

  const handleContinueAfterAd = () => {
    if (watchedAdsCount < totalAdsRequired) {
      if (isExpoGo || !RewardedAd || !rewardedRef.current) {
        setShowAdImage(true);
        setShowAdProgressModal(false);
        setDisableAdIsLoading(false);
        setWatchedAdsCount(prev => prev + 1);
        return;
      } else {
        setDisableAdIsLoading(true);
        if (adLoaded && rewardedRef.current) {
          try {
            setIsAdPlaying(true);
            setShowAdProgressModal(false);
            rewardedRef.current.show();
          } catch (error) {
            console.log('Error showing ad:', error);
            setAdLoaded(false);
            setDisableAdIsLoading(false);
            setIsAdPlaying(false);
            setShowAdProgressModal(true);
          }
        } else {
          setDisableAdIsLoading(false);
        }
      }
    } else {
      setShowAdProgressModal(false);
      setDisableAdIsLoading(false);
      setShowAlertDialog(true);
    }
  };

  const handleUpgradeToPremium = () => {
    setShowAdProgressModal(false);
    setDisableAdIsLoading(false);
    navigation.navigate("PremiumPlans");
  };

  const handleCloseAdImage = () => {
    setShowAdImage(false);
    setDisableAdIsLoading(false);
    setIsAdPlaying(false);
    setShowAdProgressModal(true);
  };

  const handleOnFinishAdProgress = () => {
    setShowAdProgressModal(false);
    setShowAlertDialog(true);
  }

  useEffect(() => {
    loadNewAd();
  }, []);

  useEffect(() => {
    if (!showAdProgressModal && !showAdImage && !showAlertDialog && !isAdPlaying) {
      setDisableAdIsLoading(false);
    }
  }, [showAdProgressModal, showAdImage, showAlertDialog, isAdPlaying]);
  
  return(
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
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
            action={ handleNewItinerary }
            iconDimension={24}
            textColor="#FFF"
            disabled={ disableAdIsLoading }
            loading={ !adLoaded }
            iconStyles={{ marginRight: 5, color: '#FFF' }}
            buttonStyles={{ backgroundColor: '#2752B7', borderRadius: 20 }}
          />
        </View>

        <Text color='#2752B7' ml={25} mt={20} fontSize="$3xl" fontWeight="$bold">Itinerários</Text>

        { /* TODO: Precisa-se criar um itinerário de exemplo baseando-se nas informações de localização atual do usuário para colocar aqui nos Destaques */ }
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
              icon={ Plus }
              action={ handleNewItinerary }
              iconDimension={24}
              textColor="#FFF"
              disabled={ disableAdIsLoading }
              loading={ !adLoaded }
              iconStyles={{ marginRight: 5, color: '#FFF' }}
              buttonStyles={{ backgroundColor: '#2752B7', borderRadius: 20 }}
              styles={{ alignSelf: "center" }}
            />
          </View>
        </View>

        <Button
          bgColor="#ffffff"
          borderRadius={15}
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.2}
          shadowRadius={5}
          elevation={5}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          alignSelf="center"
          w="95%"
          minHeight={50}
          onPress={ () => {} }
          mt={20}
        >
          <View flexDirection="row" alignItems="center">
            <Heart size={25} color="#2752B7" style={{ marginRight: 8 }} />
            <View>
              <Text fontSize="$sm" fontWeight="$bold">Locais Favoritados</Text>
            </View>
          </View>
          <ChevronRight style={{ marginRight: 10 }} />
        </Button>
        <Button
          bgColor="#ffffff"
          borderRadius={15}
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.2}
          shadowRadius={5}
          elevation={5}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          alignSelf="center"
          w="95%"
          minHeight={50}
          onPress={ () => {} }
          mt={10}
        >
          <View flexDirection="row" alignItems="center">
            <Coins size={25} color="#2752B7" style={{ marginRight: 8 }} />
            <View>
              <Text fontSize="$sm" fontWeight="$bold">Controle de Gastos</Text>
            </View>
          </View>
          <ChevronRight style={{ marginRight: 10 }} />
        </Button>
        <Button
          bgColor="#ffffff"
          borderRadius={15}
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.2}
          shadowRadius={5}
          elevation={5}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          alignSelf="center"
          w="95%"
          minHeight={50}
          onPress={ () => navigation.navigate("PremiumPlans") }
          mt={10}
        >
          <View flexDirection="row" alignItems="center">
            <Crown size={25} color="#2752B7" style={{ marginRight: 8 }} />
            <View>
              <Text fontSize="$sm" fontWeight="$bold">Upgrade para o Premium</Text>
            </View>
          </View>
          <ChevronRight style={{ marginRight: 10 }} />
        </Button>

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
          mb={95}
        >
          <View>
            <ItinerariesError />
            <ButtonIconLeft
              textContent="Novo Itinerário"
              icon={Plus}
              action={ handleNewItinerary }
              iconDimension={24}
              textColor="#FFF"
              disabled={ disableAdIsLoading }
              loading={ !adLoaded }
              iconStyles={{ marginRight: 5, color: '#FFF' }}
              buttonStyles={{ backgroundColor: '#2752B7', borderRadius: 20 }}
              styles={{ alignSelf: "center" }}
            />
          </View>
        </View>
      </ScrollView>

      {
        showAlertDialog
          ? <ItineraryCreateDialog showAlertDialog={ showAlertDialog } setShowAlertDialog={ setShowAlertDialog } />
          : null
      }

      <UnlockProgressModal
        visible={showAdProgressModal}
        onClose={handleCloseAdProgressModal}
        onContinue={handleContinueAfterAd}
        showItineraryCreate={handleOnFinishAdProgress}
        onUpgradeToPremium={handleUpgradeToPremium}
        watchedAds={watchedAdsCount}
        totalAds={totalAdsRequired}
      />

      <Modal
        visible={showAdImage}
        animationType="fade"
        presentationStyle="fullScreen"
        onRequestClose={handleCloseAdImage}
      >
        <View flex={1} backgroundColor="#000000">
          <Image
            source={{ uri: 'https://developers.google.com/static/admob/images/ios-testad-0-admob.png' }}
            style={{
              width: Dimensions.get('window').width,
              height: Dimensions.get('window').height,
              resizeMode: 'cover'
            }}
          />
          <Button
            position="absolute"
            top={50}
            right={20}
            width={40}
            height={40}
            borderRadius={20}
            backgroundColor="#000000"
            opacity={0.7}
            onPress={handleCloseAdImage}
            justifyContent="center"
            alignItems="center"
          >
            <ButtonText color="#FFFFFF" fontSize={18} fontWeight="bold">✕</ButtonText>
          </Button>
        </View>
      </Modal>
    </SafeAreaView>
  )
}