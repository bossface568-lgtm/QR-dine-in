import { createClient } from '@insforge/sdk';

// Default to the connected InsForge backend for this project
const insforgeUrl = (import.meta as any).env?.VITE_INSFORGE_URL || 'https://vy3qe8cs.ap-southeast.insforge.app';
const insforgeAnonKey = (import.meta as any).env?.VITE_INSFORGE_ANON_KEY || 'ik_ff24b896cd9673c01da166b1a427b48dc18acbe6db410028a90d18ccca6bbf17';

console.log('[InsForge Client] URL:', insforgeUrl, '| AnonKey:', insforgeAnonKey?.substring(0, 10) + '...');

export const insforge = createClient({
  baseUrl: insforgeUrl,
  anonKey: insforgeAnonKey,
});
