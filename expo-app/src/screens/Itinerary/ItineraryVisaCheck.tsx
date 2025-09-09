import { useEffect, useState } from "react";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";

import { VisaModel } from "@components/Itinerary/VisalModel";

import { AuthNavigationProp } from "@routes/auth.routes";

import { utilsGetSelectedTags } from "@utils/selectedTagsStore";

import { CreatingItinerary } from "../../../@types/CreatingItinerary";
import { VisaModelTypes } from "../../../@types/VisaModelTypes";

export function ItineraryVisaCheck(){
  const [isVisaNecessary, setIsVisaNecessary] = useState<VisaModelTypes["results"]>();

  const navigation = useNavigation<AuthNavigationProp>();
  const route = useRoute<RouteProp<{ params: CreatingItinerary }, 'params'>>();
  const itineraryData = route.params;

  useEffect(() => {
    const checkVisaInformation = async () => {
      try{
        const response = await fetch(`http://SEU-IP-AQUI:3000/api/passportVisa/${itineraryData}/${itineraryData}`);

        if(!response.ok){
          throw new Error("Failed to fetch Visa Information");
        }

        const data = await response.json();

        if(data.code === "VOA" || data.code === "EV" || data.code === "VR"){
          setIsVisaNecessary("Negative");
        }else if(data.code === "VF"){
          setIsVisaNecessary("Positive");
        }else {
          setIsVisaNecessary("Unknown");
        }
      }catch(error){
        console.log("Erro encontrado ao fazer este fetch de informações de visto: ", error);
      }
    }

    checkVisaInformation();
  }, []);

  return (
    <VisaModel
      results="Unknown"
      origin="BR"
      destination="PT"
      action={() => navigation.navigate("ItineraryMapMenu", { itineraryData: itineraryData, userPreferences: utilsGetSelectedTags(), visaIssue: isVisaNecessary })}
    />
  )
}