import { createClient } from '@insforge/sdk';

// Default to the connected InsForge backend for this project
const insforgeUrl = (import.meta as any).env?.VITE_INSFORGE_URL || 'https://vy3qe8cs.ap-southeast.insforge.app';
const insforgeAnonKey = (import.meta as any).env?.VITE_INSFORGE_ANON_KEY || 'ik_6142f9b35ad0ec3d7bd962181122a6f4';

export const insforge = createClient({
  baseUrl: insforgeUrl,
  anonKey: insforgeAnonKey,
});
