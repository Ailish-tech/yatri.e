import { useEffect, useState } from "react";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";

import { VisaModel } from "@components/Itinerary/VisalModel";

import { AuthNavigationProp } from "@routes/auth.routes";

import { getCountryCode } from '@data/countryCodes';

import { utilsGetSelectedTags } from "@utils/selectedTagsStore";

import { CreatingItinerary } from "../../../@types/CreatingItinerary";
import { VisaModelTypes } from "../../../@types/VisaModelTypes";

export function ItineraryVisaCheck(){
  const [isVisaNecessary, setIsVisaNecessary] = useState<VisaModelTypes["results"]>();
  const [hasVisaIssueFound, setHasVisaIssueFound] = useState<boolean>(false);

  const navigation = useNavigation<AuthNavigationProp>();
  const route = useRoute<RouteProp<{ params: CreatingItinerary }, 'params'>>();
  const itineraryData = route.params;

  useEffect(() => {
    const checkVisaInformation = async (currentCountry: string) => {
      try{
        const originCode = getCountryCode(itineraryData.originCountry);
        const response = await fetch(`http://SEU-IP-AQUI:3000/api/passportVisa/${originCode}/${currentCountry}`);

        if(!response.ok){
          throw new Error("Failed to fetch Visa Information");
        }

        const data = await response.json();

        if(data.code === "VOA" || data.code === "EV" || data.code === "VR"){
          setIsVisaNecessary("Negative");
          setHasVisaIssueFound(true);
          return true;
        }else if(data.code === "VF"){
          setIsVisaNecessary("Positive");
          return false;
        }else {
          setIsVisaNecessary("Unknown");
          setHasVisaIssueFound(true);
          return true;
        }
      }catch(error){
        console.log("Erro encontrado ao fazer este fetch de informações de visto: ", error);
        setIsVisaNecessary("Unknown");
        setHasVisaIssueFound(true);
        return true;
      }
    }

    const checkAllCountries = async () => {
      if (hasVisaIssueFound) {
        return;
      }

      for (const country of itineraryData.countries) {
        const currentCountryCode = getCountryCode(country);
        if (currentCountryCode) {
          const hasIssue = await checkVisaInformation(currentCountryCode);
          if (hasIssue) {
            break;
          }
        }
      }
    };

    checkAllCountries();
  }, [hasVisaIssueFound]);

  return (
    <VisaModel
      results={ isVisaNecessary || "Unknown" }
      origin={ getCountryCode(itineraryData.originCountry) }
      destination={ itineraryData.countries.map(getCountryCode) }
      action={ () => navigation.navigate("ItineraryMapMenu", { itineraryData: itineraryData, userPreferences: utilsGetSelectedTags(), visaIssue: isVisaNecessary }) }
    />
  )
}