import { Button, ButtonText, View } from "@gluestack-ui/themed";
import { Modal, Image, Dimensions } from "react-native";

type SimulatedAdTypes = {
  showAdImage: boolean,
  handleCloseAdImage: () => void
}

export function SimulatedAd({ showAdImage, handleCloseAdImage }: SimulatedAdTypes) {
  return(
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
  )
}