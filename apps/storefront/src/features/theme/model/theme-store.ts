import { create } from 'zustand'
export type ThemePreference = 'light' | 'dark' | 'system'
type ThemeState = { preference: ThemePreference; setPreference: (preference: ThemePreference) => void }
export const useTheme = create<ThemeState>((set) => ({ preference: 'system', setPreference: (preference) => set({ preference }) }))
export function resolveTheme(preference: ThemePreference): 'light'|'dark' {
 if (preference !== 'system') return preference
 return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
