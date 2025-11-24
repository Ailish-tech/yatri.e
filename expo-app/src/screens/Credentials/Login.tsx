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
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText
} from "@gluestack-ui/themed";

import { IconButton } from '@components/Buttons/IconButton';
import { Loading } from '@components/Loading/Loading';
import { ButtonIconImageLeft } from '@components/Buttons/ButtonIconImageLeft';

import { ArrowLeft, CircleAlert } from 'lucide-react-native';

import GoogleLogo from '@assets/Enterprises/Google/google-icon.svg';

import { handleGoogleSignIn } from '@services/login/googleLogin';

import { useAuth } from '@contexts/AuthContext';

import { NoAuthNavigationProp } from '@routes/noauth.routes';
import { signInUser } from '@services/login/emailLogin';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isInvalid, setIsInvalid] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  const { login } = useAuth();
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
    try{
      setIsAuthenticating(true);
      signInUser(email, password, navigation, setIsAuthenticating);
    }catch(error){
      console.log("Error found while trying to log you in");
      setIsAuthenticating(false);
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
              <IconButton buttonBgColor='transparent' icon={ArrowLeft} iconColor='white' iconSize='xl' buttonFunctionality={() => navigation.goBack()} />
              <View flexDirection='row' alignItems='center'>
                <Text color='$white' mr={10} size='sm'>Novo por aqui?</Text>
                <Button bgColor='#8a8a9d72' size='sm' onPress={() => navigation.navigate('SignUp')}>
                  <ButtonText>Criar Conta</ButtonText>
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
            <Text fontSize="$2xl" fontWeight="$bold" color='$black' my={15}>Bem-Vindo de Volta!</Text>
            <Text fontSize="$lg" color='$black' mb={20}>Insira suas credenciais para continuar</Text>
            <FormControl
              isInvalid={isInvalid}
              size="lg"
              isDisabled={false}
              isReadOnly={false}
              isRequired={false}
              w="85%"
            >
              <FormControlLabel>
                <FormControlLabelText>Email</FormControlLabelText>
              </FormControlLabel>
              <Input my={1} borderColor='#8a8a8a'>
                <InputField
                  type="text"
                  placeholder="Email"
                  value={ email }
                  onChangeText={ (mail) => setEmail(mail) }
                />
              </Input>
              <FormControlHelper>
              </FormControlHelper>
              <FormControlError>
                <FormControlErrorIcon as={ CircleAlert } />
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
                  placeholder="Senha"
                  value={ password }
                  onChangeText={ (pass) => setPassword(pass) }
                />
              </Input>
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
                  onPress={ handleSubmit }
                  disabled={ isAuthenticating ? true : false }
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
                  <ButtonText color="#FFF">Continuar</ButtonText>
                </Button>
              </View>
            </FormControl>
            <Button
              bgColor="transparent"
              size="lg"
              onPress={ login }
              disabled={ isAuthenticating ? true : false }
            >
              <ButtonText fontWeight="$medium" color="#000">Esqueceu sua senha?</ButtonText>
            </Button>
            <View flexDirection='row' justifyContent='space-evenly' mt={15} mb={25} alignItems='center'>
              <View borderBottomWidth={.7} borderColor='$gray' w="22.5%"></View>
              <Text mx={10}>Faça login com</Text>
              <View borderBottomWidth={.7} borderColor='$gray' w="22.5%"></View>
            </View>
            <View width="100%" alignItems="center" mt={10}>
              <ButtonIconImageLeft
                icon={ GoogleLogo }
                iconWidth={30}
                iconHeight={30}
                textContent='Google'
                buttonSize='xl'
                action={ () => handleGoogleSignIn(setIsAuthenticating, navigation) }
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