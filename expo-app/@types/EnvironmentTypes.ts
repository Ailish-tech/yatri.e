/**
 * Tipo para configuração de ambiente
 */
export type Environment = 'development' | 'production';

/**
 * Tipo para configuração de API URLs
 */
export interface ApiConfig {
  baseUrl: string;
  environment: Environment;
}

/**
 * Tipo para verificação de ambiente
 */
export interface EnvironmentChecker {
  isDevelopment: boolean;
  isProduction: boolean;
  getApiUrl: () => string;
  environment: Environment;
}