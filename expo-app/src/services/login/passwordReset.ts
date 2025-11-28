import { Alert } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../../firebase';
import { validateEmail, sanitizeInput } from '@utils/validators';
import { getAuthErrorMessage, shouldReportError } from './authErrors';

/**
 * Envia email de recuperação de senha
 * @param email - Email do usuário para recuperação
 * @returns Promise que resolve quando o email é enviado
 */
export async function sendPasswordReset(email: string): Promise<boolean> {
  try {
    // Sanitiza e valida email
    const sanitizedEmail = sanitizeInput(email);
    const emailValidation = validateEmail(sanitizedEmail);

    if (!emailValidation.isValid) {
      Alert.alert('Erro de Validação', emailValidation.error || 'Email inválido');
      return false;
    }

    // Envia email de recuperação
    await sendPasswordResetEmail(auth, sanitizedEmail);

    Alert.alert(
      'Email Enviado',
      'Verifique sua caixa de entrada para redefinir sua senha.',
      [{ text: 'OK' }]
    );

    return true;
  } catch (error: any) {
    const errorCode = error?.code || 'unknown';
    const errorMessage = getAuthErrorMessage(errorCode);

    // Log detalhado apenas em desenvolvimento
    if (__DEV__) {
      console.error('Erro ao enviar email de recuperação:', {
        code: errorCode,
        message: error?.message,
      });
    }

    // Reporta erro se necessário
    if (shouldReportError(errorCode)) {
      console.warn('Erro reportável:', errorCode);
    }

    Alert.alert('Erro', errorMessage);
    return false;
  }
}

/**
 * Verifica se um email está cadastrado (sem revelar se existe)
 * Por segurança, sempre retorna sucesso para não expor emails cadastrados
 * @param email - Email a verificar
 */
export async function checkEmailExists(email: string): Promise<void> {
  // Por questões de segurança, não revelamos se o email existe ou não
  // Sempre enviamos o email de recuperação se o formato for válido
  await sendPasswordReset(email);
}
