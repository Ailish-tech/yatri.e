import { useState } from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Image } from '@gluestack-ui/themed';

import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from '@expo-google-fonts/libre-bodoni/useFonts';
import { LibreBodoni_700Bold } from '@expo-google-fonts/libre-bodoni/700Bold';

import { 
  Button, 
  ButtonText,
  View, 
  Text, 
  FormControl, 
  FormControlLabel, 
  FormControlLabelText, 
  Input,
  InputField,
  FormControlHelper,
  FormControlHelperText,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText
} from "@gluestack-ui/themed";

import { IconButton } from '@components/Buttons/IconButton';
import { Loading } from '@components/Loading/Loading';
import { ButtonIconImageLeft } from '@components/Buttons/ButtonIconImageLeft';

import { ArrowLeft, CircleAlert } from 'lucide-react-native';

import GoogleLogo from '@assets/Enterprises/Google/google-icon.svg';

import { NoAuthNavigationProp } from '@routes/noauth.routes';

export function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isInvalid, setIsInvalid] = useState(false);

  const navigation = useNavigation<NoAuthNavigationProp>();
  const fontsLoaded = useFonts({ LibreBodoni_700Bold });

  const possibleBakcgrkounds = [
    require("@assets/CredentialsBackgrounds/gaztelugatxe-4377342_640.png"),
    require("@assets/CredentialsBackgrounds/italy-2725346_640.png"),
    require("@assets/CredentialsBackgrounds/waterfall-6574302_640.jpg"),
    require("@assets/CredentialsBackgrounds/river-7447346_640.png")
  ]

  function getRandomImageBackground() {
    const randomIndex = Math.floor(Math.random() * possibleBakcgrkounds.length);
    return possibleBakcgrkounds[randomIndex];
  }

  const handleSubmit = () => {
    if (password.length < 8) {
      setIsInvalid(true);
    } else {
      setIsInvalid(false);
      navigation.navigate("Welcome", {
        name: "Usuário Expo",
        email: "expo@example.com",
        photo: "https://cdn.pixabay.com/photo/2022/07/16/04/19/biker-7324421_640.jpg"
      });
    }
  }

  if(fontsLoaded){
    return (
      <View flex={1}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <Image
          source={ getRandomImageBackground() }
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%'
          }} 
          alt=''
        />
        <View style={{ flex: 1 }}>
          <SafeAreaView>
            <View flexDirection='row' alignItems='center' justifyContent='space-between' p={15}>
              <IconButton buttonBgColor='transparent' icon={ ArrowLeft } iconColor='white' iconSize='xl' buttonFunctionality={() => navigation.goBack()} />
              <View flexDirection='row' alignItems='center'>
                <Text color='$white' mr={10} size='sm' fontWeight="$semibold">Já possui uma conta?</Text>
                <Button bgColor='#8a8a9db1' size='sm' onPress={ () => navigation.navigate('Login') }>
                  <ButtonText>Entrar</ButtonText>
                </Button>
              </View>
            </View>
          </SafeAreaView>
          <Text textAlign='center' color='$white' fontFamily='LibreBodoni_700Bold' fontSize="$4xl" my={40}>EZ TRIP AI</Text>
          <View
            bgColor='#ffffffae'
            w="90%"
            h={14}
            alignSelf='center'
            borderTopLeftRadius={20}
            borderTopRightRadius={20}
            zIndex={2}
          />
          <View
            bgColor='#ffffffd5'
            borderTopLeftRadius={20}
            borderTopRightRadius={20}
            flex={1}
            flexDirection='column'
            justifyContent='center'
            alignItems='center'
            p={20}
            zIndex={1}
          >
            <Text fontSize="$2xl" fontWeight="$bold" color='$black' my={15}>Comece Gratuitamente!</Text>
            <FormControl
              isInvalid={isInvalid}
              size="lg"
              isDisabled={false}
              isReadOnly={false}
              isRequired={false}
              w="85%"
            >
              <FormControlLabel>
                <FormControlLabelText>Nome</FormControlLabelText>
              </FormControlLabel>
              <Input my={1} borderColor='#8a8a8a'>
                <InputField
                  type="text"
                  placeholder="Insira Seu Nome"
                  value={ name }
                  onChangeText={ (name) => setName(name) }
                />
              </Input>
              <FormControlHelper>
              </FormControlHelper>
              <FormControlError>
                <FormControlErrorIcon as={ CircleAlert } />
                <FormControlErrorText>
                  Insira um nome válido
                </FormControlErrorText>
              </FormControlError>
              <FormControlLabel>
                <FormControlLabelText>Email</FormControlLabelText>
              </FormControlLabel>
              <Input my={1} borderColor='#8a8a8a'>
                <InputField
                  type="text"
                  placeholder="Insira seu melhor Email"
                  value={ email }
                  onChangeText={ (mail) => setEmail(mail) }
                />
              </Input>
              <FormControlHelper>
              </FormControlHelper>
              <FormControlError>
                <FormControlErrorIcon as={CircleAlert} />
                <FormControlErrorText>
                  Insira um email válido
                </FormControlErrorText>
              </FormControlError>
              <FormControlLabel>
                <FormControlLabelText mt={10}>Senha</FormControlLabelText>
              </FormControlLabel>
              <Input my={1} borderColor='#8a8a8a'>
                <InputField
                  type="password"
                  placeholder="Memorize sua Senha"
                  value={ password }
                  onChangeText={ (pass) => setPassword(pass) }
                />
              </Input>
              <FormControlHelper>
                <FormControlHelperText>
                  Mínimo 8 caracteres
                </FormControlHelperText>
              </FormControlHelper>
              <FormControlError>
                <FormControlErrorIcon as={CircleAlert} />
                <FormControlErrorText>
                  Mínimo 8 caracteres!
                </FormControlErrorText>
              </FormControlError>
              <View alignItems='center' mt={30} mb={15}>
                <Button
                  bgColor="#336df6"
                  w="100%"
                  borderRadius={25}
                  size="xl"
                  onPress={handleSubmit}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 0.8,
                    shadowRadius: 2,
                    elevation: 4,
                  }}
                >
                  <ButtonText color="#FFF">Fazer Cadastro</ButtonText>
                </Button>
              </View>
            </FormControl>
            <View flexDirection='row' justifyContent='space-evenly' mt={15} mb={25} alignItems='center'>
              <View borderBottomWidth={.7} borderColor='$gray' w="22.5%"></View>
              <Text mx={10}>Faça login com</Text>
              <View borderBottomWidth={.7} borderColor='$gray' w="22.5%"></View>
            </View>
            <View width="100%" alignItems="center" mt={10}>
              <ButtonIconImageLeft
                icon={GoogleLogo}
                iconWidth={30}
                iconHeight={30}
                textContent='Google'
                buttonSize='xl'
                action={ () => navigation.navigate("Welcome", {
                  name: "Usuário Expo",
                  email: "expo@example.com",
                  photo: "https://cdn.pixabay.com/photo/2022/07/16/04/19/biker-7324421_640.jpg"
                }) }
                iconStyles={{
                  marginRight: 15
                }}
                styles={{
                  borderWidth: .6,
                  borderRadius: 10,
                  width: '80%',
                  textAlign: 'center',
                  alignSelf: 'center',
                  borderColor: "black",
                  marginBottom: 20
                }}
              />
            </View>
          </View>
        </View>
      </View>
    );
  }else{
    return (
      <View flex={1}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <LinearGradient
          colors={['rgba(1, 0, 66, 1)', 'rgba(0, 0, 179, 1)', 'rgba(0, 212, 255, 1)']}
          start={{ x: 1, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        >
          <SafeAreaView>
            <Loading />
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }
}