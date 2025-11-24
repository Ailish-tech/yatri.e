import { Alert } from 'react-native';
import Constants from 'expo-constants';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../firebase';
import { NoAuthNavigationProp } from '@routes/noauth.routes';

export async function signInUser(
  email: string,
  password: string,
  navigation: NoAuthNavigationProp,
  setIsAuthenticating?: (status: boolean) => void
): Promise<void> {
  try {
    const isExpoGo = Constants.appOwnership === 'expo';

    if (isExpoGo) {
      Alert.alert("Modo Expo Go", "Login simulado com sucesso!");
      navigation.navigate("Welcome", {
        name: "Usuário Expo",
        email: email || "expo@example.com",
        photo: "https://cdn.pixabay.com/photo/2022/07/16/04/19/biker-7324421_640.jpg"
      });
      if (setIsAuthenticating) setIsAuthenticating(false);
      return;
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    navigation.navigate("Welcome", {
      name: user.displayName || "Usuário",
      email: user.email || "",
      photo: user.photoURL || "https://cdn.pixabay.com/photo/2022/07/16/04/19/biker-7324421_640.jpg"
    });
    
    if (setIsAuthenticating) setIsAuthenticating(false);
  } catch (error: any) {
    console.error('Error signing in:', error.message);
    Alert.alert("Erro no Login", "Email ou senha incorretos.");
    if (setIsAuthenticating) setIsAuthenticating(false);
  }
}