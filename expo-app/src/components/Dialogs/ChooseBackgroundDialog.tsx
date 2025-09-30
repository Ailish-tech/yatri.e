import { Image } from "react-native";

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
  imageUri: string[],
  handleClose: () => void
}

export function ChooseBackgroundDialog({ showAlertDialog, handleClose, imageUri }: ChooseBackgroundDialogTypes){
  const bgImages: ChooseBackgroundDialogTypes["imageUri"] = [
    ""
  ]

  function handleNewBackgroundImage (index: number) {
    return bgImages[index];
  }

  return(
    <AlertDialog isOpen={ showAlertDialog } onClose={ handleClose } size="lg">
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Text fontSize="$lg" fontWeight="$semibold" color="$black">Selecionar novo Background</Text>
            <Button bgColor="transparent" onPress={ handleClose }>
              <ButtonIcon as={ X } color="$black" size="lg" />
            </Button>
          </AlertDialogHeader>
          <AlertDialogBody mt={3} mb={4} minHeight={500}>
            <View>
              {
                bgImages.map((index) => (
                  <View key={ index }>
                    <Image />
                  </View>
                ))
              }
            </View>
          </AlertDialogBody>
        </AlertDialogContent>
      </AlertDialog>
  )
}