import type { AppConfig } from './types'

/**
 * Simulates fetching app config. Short delay so we can see render/fetch order.
 */
export async function fetchAppConfig(): Promise<AppConfig> {
  await new Promise((r) => setTimeout(r, 400))
  return {
    theme: 'dark',
    apiBase: 'https://api.example.com',
    version: '1.0.0',
  }
}
