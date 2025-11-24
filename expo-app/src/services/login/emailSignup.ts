import { Alert } from 'react-native';
import Constants from 'expo-constants';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../../firebase';
import { NoAuthNavigationProp } from '@routes/noauth.routes';

export async function signUpUser(
  name: string,
  email: string,
  password: string,
  navigation: NoAuthNavigationProp,
  setIsAuthenticating?: (status: boolean) => void
): Promise<void> {
  try {
    const isExpoGo = Constants.appOwnership === 'expo';

    if (isExpoGo) {
      Alert.alert("Modo Expo Go", "Cadastro simulado com sucesso!");
      navigation.navigate("Welcome", {
        name: name || "Usuário Expo",
        email: email || "expo@example.com",
        photo: "https://cdn.pixabay.com/photo/2022/07/16/04/19/biker-7324421_640.jpg"
      });
      if (setIsAuthenticating) setIsAuthenticating(false);
      return;
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Atualizar o perfil do usuário com o nome
    if (name) {
      await updateProfile(user, {
        displayName: name
      });
    }
    
    navigation.navigate("Welcome", {
      name: name || "Usuário",
      email: user.email || "",
      photo: user.photoURL || "https://cdn.pixabay.com/photo/2022/07/16/04/19/biker-7324421_640.jpg"
    });
    
    if (setIsAuthenticating) setIsAuthenticating(false);
  } catch (error: any) {
    console.error('Error signing up:', error.message);
    
    let errorMessage = "Não foi possível criar a conta.";
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = "Este email já está em uso.";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "Email inválido.";
    } else if (error.code === 'auth/weak-password') {
      errorMessage = "A senha deve ter pelo menos 6 caracteres.";
    }
    
    Alert.alert("Erro no Cadastro", errorMessage);
    if (setIsAuthenticating) setIsAuthenticating(false);
  }
}