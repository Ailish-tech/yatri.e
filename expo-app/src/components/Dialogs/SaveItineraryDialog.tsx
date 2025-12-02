import { useState } from "react";
import { TouchableOpacity, Image, Alert } from "react-native";
import * as ImagePicker from 'expo-image-picker';

import { 
  AlertDialog, 
  AlertDialogBackdrop, 
  AlertDialogBody, 
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  Button, 
  ButtonIcon,
  ButtonText,
  Text,
  View
} from "@gluestack-ui/themed";

import { X, ImagePlus } from "lucide-react-native";

type SaveItineraryDialogTypes = {
  showAlertDialog: boolean,
  onSave: (status: "Planejado" | "Rascunho", imageUri?: string) => void,
  handleClose: () => void
}

export function SaveItineraryDialog({ showAlertDialog, handleClose, onSave }: SaveItineraryDialogTypes){
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<"Planejado" | "Rascunho" | null>(null);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permissão Necessária", "É necessário permitir acesso à galeria para adicionar uma imagem");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!selectedStatus) {
      Alert.alert("Atenção", "Por favor, selecione se deseja salvar como Planejado ou Rascunho");
      return;
    }

    onSave(selectedStatus, selectedImage || undefined);
    handleClose();
  };

  return(
    <AlertDialog isOpen={ showAlertDialog } onClose={ handleClose } size="lg">
      <AlertDialogBackdrop />
      <AlertDialogContent>
        <AlertDialogHeader>
          <Text fontSize="$lg" fontWeight="$semibold" color="$black">Salvar Roteiro</Text>
          <Button bgColor="transparent" onPress={ handleClose }>
            <ButtonIcon as={ X } color="$black" size="xl" />
          </Button>
        </AlertDialogHeader>
        
        <AlertDialogBody mt={3}>
          <Text fontSize="$md" fontWeight="$medium" color="$black" mb={10}>
            Como deseja salvar este roteiro?
          </Text>

          <View flexDirection="row" gap={10} mb={15}>
            <Button 
              flex={1}
              bgColor={ selectedStatus === "Planejado" ? "#2752B7" : "lightgray" }
              onPress={ () => setSelectedStatus("Planejado") }
              borderRadius={10}
            >
              <ButtonText color={ selectedStatus === "Planejado" ? "#FFF" : "#000" }>
                Planejado
              </ButtonText>
            </Button>
            <Button 
              flex={1}
              bgColor={ selectedStatus === "Rascunho" ? "#2752B7" : "lightgray" }
              onPress={ () => setSelectedStatus("Rascunho") }
              borderRadius={10}
            >
              <ButtonText color={ selectedStatus === "Rascunho" ? "#FFF" : "#000" }>
                Rascunho
              </ButtonText>
            </Button>
          </View>

          <Text fontSize="$md" fontWeight="$medium" color="$black" mb={10}>
            Adicionar uma foto (opcional)
          </Text>

          <TouchableOpacity 
            onPress={ pickImage }
            style={{
              width: "100%",
              height: 200,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: "#2752B7",
              borderStyle: "dashed",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#f5f5f5"
            }}
          >
            {
              selectedImage ? (
                <Image 
                  source={{ uri: selectedImage }}
                  style={{ width: "100%", height: "100%", borderRadius: 8 }}
                  resizeMode="cover"
                />
              ) : (
                <View alignItems="center">
                  <ImagePlus size={48} color="#2752B7" />
                  <Text fontSize="$sm" color="#2752B7" mt={5}>
                    Toque para adicionar uma foto
                  </Text>
                </View>
              )
            }
          </TouchableOpacity>
        </AlertDialogBody>

        <AlertDialogFooter>
          <Button 
            variant="outline" 
            onPress={ handleClose }
            mr={10}
          >
            <ButtonText>Cancelar</ButtonText>
          </Button>
          <Button 
            bgColor="#2752B7"
            onPress={ handleSave }
          >
            <ButtonText color="#FFF">Salvar</ButtonText>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
