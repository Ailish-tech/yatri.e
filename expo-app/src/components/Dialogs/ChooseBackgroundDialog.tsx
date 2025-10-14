import { Image, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useState } from "react";

import { 
  AlertDialog, 
  AlertDialogBackdrop, 
  AlertDialogBody, 
  AlertDialogContent,
  AlertDialogHeader, 
  Button, 
  ButtonIcon,
  Text,
  View
} from "@gluestack-ui/themed";

import { X } from "lucide-react-native";

type ChooseBackgroundDialogTypes = {
  showAlertDialog: boolean,
  imageUri: (imagePath: any) => void,
  handleClose: () => void
}

export function ChooseBackgroundDialog({ showAlertDialog, handleClose, imageUri }: ChooseBackgroundDialogTypes){
  const [loadingImages, setLoadingImages] = useState<{ [key: number]: boolean }>({});
  
  const bgImages = [
    require("@assets/CredentialsBackgrounds/gaztelugatxe-4377342_640.png"),
    require("@assets/CredentialsBackgrounds/italy-2725346_640.png"),
    require("@assets/CredentialsBackgrounds/river-7447346_640.png"),
    require("@assets/CredentialsBackgrounds/waterfall-6574302_640.jpg"),
    require("@assets/cachoeira.png"),
    require("@assets/culturas.png"),
    require("@assets/evento.png"),
    require("@assets/monumentoshistoricos.png"),
    require("@assets/park.png"),
    require("@assets/santiago_farellones.jpg"),
  ]

  function handleSelectImage(imagePath: any) {
    imageUri(imagePath);
    handleClose();
  }

  function handleImageLoadStart(index: number) {
    setLoadingImages(prev => ({ ...prev, [index]: true }));
  }

  function handleImageLoadEnd(index: number) {
    setLoadingImages(prev => ({ ...prev, [index]: false }));
  }

  return(
    <AlertDialog isOpen={ showAlertDialog } onClose={ handleClose } size="lg">
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Text fontSize="$lg" fontWeight="$semibold" color="$black">Selecionar novo Background</Text>
            <Button bgColor="transparent" onPress={() => { handleClose() }}>
              <ButtonIcon as={ X } color="$black" size="xl" />
            </Button>
          </AlertDialogHeader>
          <AlertDialogBody mt={3} mb={4} maxHeight={500}>
            <ScrollView 
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingHorizontal: 10 }}
            >
              <View flexDirection="row" flexWrap="wrap" gap={6} justifyContent="space-between">
                {
                  bgImages.map((image, index) => (
                    <TouchableOpacity 
                      key={ index } 
                      onPress={() => handleSelectImage(image)}
                      style={{ position: 'relative', width: 145, height: 195 }}
                    >
                      <Image 
                        source={ image }
                        onLoadStart={() => handleImageLoadStart(index)}
                        onLoadEnd={() => handleImageLoadEnd(index)}
                        style={{ 
                          width: 145, 
                          height: 195, 
                          borderRadius: 10,
                          opacity: loadingImages[index] ? 0.5 : 1
                        }} 
                      />
                      { loadingImages[index] && (
                        <View style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: 'rgba(0,0,0,0.3)',
                          borderRadius: 10
                        }}>
                          <ActivityIndicator size="large" color="#fff" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))
                }
              </View>
            </ScrollView>
          </AlertDialogBody>
        </AlertDialogContent>
      </AlertDialog>
  )
}