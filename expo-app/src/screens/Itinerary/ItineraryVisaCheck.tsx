import { useState } from "react";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";

import { VisaModel } from "@components/Itinerary/VisalModel";

import { AuthNavigationProp } from "@routes/auth.routes";

import { utilsGetSelectedTags } from "@utils/selectedTagsStore";

import { CreatingItinerary } from "../../../@types/CreatingItinerary";

export function ItineraryVisaCheck(){
  const [isVisaNecessary, setIsVisaNecessary] = useState<boolean>(false);

  const navigation = useNavigation<AuthNavigationProp>();
  const route = useRoute<RouteProp<{ params: CreatingItinerary }, 'params'>>();
  const itineraryData = route.params;

  return (
    <VisaModel
      results="Positive"
      origin="BR"
      destination="PT"
      action={() => navigation.navigate("ItineraryMapMenu", { itineraryData: itineraryData, userPreferences: utilsGetSelectedTags(), visaIssue: isVisaNecessary })}
    />
  )
}