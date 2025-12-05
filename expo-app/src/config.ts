import { DEV_API_URL } from '@env';
import type { EnvironmentChecker } from '../@types/EnvironmentTypes';

/**
 * URL da API de produção (Vercel)
 */
const PRODUCTION_API_URL = "https://guiaturisticoeztripai.vercel.app/api";

/**
 * Verifica se o app está rodando em ambiente de desenvolvimento (ExpoGo)
 * @returns true se estiver em desenvolvimento, false se estiver em produção
 */
const isDevelopment = (): boolean => {
  // Verifica se há DEV_API_URL configurado (desenvolvimento local)
  return !!DEV_API_URL;
};

/**
 * Retorna a URL da API apropriada baseada no ambiente
 * - Desenvolvimento (ExpoGo): usa IP local configurado em .env.local
 * - Produção (Build/Standalone): usa URL do Vercel
 */
const getApiUrl = (): string => {
  if (isDevelopment() && DEV_API_URL) {
    console.log('[Environment] Modo DESENVOLVIMENTO - usando IP local:', DEV_API_URL);
    return DEV_API_URL;
  }
  
  console.log('[Environment] Modo PRODUÇÃO - usando Vercel:', PRODUCTION_API_URL);
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

// Log de inicialização
console.log(`[Environment] Ambiente inicializado: ${Environment.environment.toUpperCase()}`);