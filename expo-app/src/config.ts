import { DEV_API_URL } from '@env';
import Constants from 'expo-constants';
import type { EnvironmentChecker } from '../@types/EnvironmentTypes';

/**
 * URL da API de produção (Vercel)
 */
const PRODUCTION_API_URL = "https://guiaturisticoeztripai.vercel.app/api";

/**
 * Verifica se o app está rodando em ambiente de desenvolvimento
 * @returns true se estiver em desenvolvimento (Expo Go), false se estiver em build standalone
 */
const isDevelopment = (): boolean => {
  // No Expo Go, executionEnvironment é 'storeClient'
  // Em builds standalone/preview/production, é 'standalone'
  const isExpoGo = Constants.executionEnvironment === 'storeClient';
  
  // Só considera desenvolvimento se estiver no Expo Go E tiver DEV_API_URL
  return isExpoGo && !!DEV_API_URL;
};

/**
 * Retorna a URL da API apropriada baseada no ambiente
 * - Desenvolvimento (Expo Go): usa IP local configurado em .env.local
 * - Produção (Build/Standalone): usa URL do Vercel
 */
const getApiUrl = (): string => {
  const devMode = isDevelopment();
  
  if (devMode && DEV_API_URL) {
    console.log('[Environment] Modo DESENVOLVIMENTO (Expo Go) - usando IP local:', DEV_API_URL);
    return DEV_API_URL;
  }
  
  console.log('[Environment] Modo PRODUÇÃO (Build Standalone) - usando Vercel:', PRODUCTION_API_URL);
  return PRODUCTION_API_URL;
};

/**
 * Objeto de verificação de ambiente
 */
export const Environment: EnvironmentChecker = {
  isDevelopment: isDevelopment(),
  isProduction: !isDevelopment(),
  getApiUrl,
  environment: isDevelopment() ? 'development' : 'production'
};

/**
 * URL da API configurada automaticamente baseada no ambiente
 * @deprecated Use Environment.getApiUrl() para melhor rastreabilidade
 */
export const API_URL = getApiUrl();

// Log de inicialização detalhado
console.log(`
[Environment] ====== CONFIGURAÇÃO DE AMBIENTE ======
- Ambiente: ${Environment.environment.toUpperCase()}
- Execution Environment: ${Constants.executionEnvironment}
- API URL: ${API_URL}
- isDevelopment: ${Environment.isDevelopment}
- isProduction: ${Environment.isProduction}
===============================================
`);