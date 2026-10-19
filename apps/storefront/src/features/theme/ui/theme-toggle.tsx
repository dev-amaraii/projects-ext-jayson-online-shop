import { useEffect, useState } from 'react'
import { Moon, Sun, Monitor, Check } from 'lucide-react'
import { resolveTheme, useTheme, type ThemePreference } from '../model/theme-store'

const choices: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
 { value: 'light', label: 'Light', Icon: Sun },
 { value: 'dark', label: 'Dark', Icon: Moon },
 { value: 'system', label: 'System', Icon: Monitor },
]
function applyTheme(preference: ThemePreference) {
 const resolved = resolveTheme(preference)
 document.documentElement.dataset.theme = resolved
 document.documentElement.style.colorScheme = resolved
}
export function ThemeToggle() {
 const { preference, setPreference } = useTheme()
 const [open, setOpen] = useState(false)
 useEffect(() => {
  const saved = window.localStorage.getItem('jayson-theme')
  const initial = choices.some(c => c.value === saved) ? saved as ThemePreference : 'system'
  setPreference(initial)
  applyTheme(initial)
 }, [setPreference])
 useEffect(() => {
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  const onChange = () => { if (useTheme.getState().preference === 'system') applyTheme('system') }
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
 }, [])
 const select = (value: ThemePreference) => {
  setPreference(value)
  applyTheme(value)
  window.localStorage.setItem('jayson-theme', value)
  setOpen(false)
 }
 const active = choices.find(c => c.value === preference) ?? choices[2]
 return <div className="themeControl">
  <button type="button" className="themeToggle" onClick={() => setOpen(v => !v)} aria-label={`Appearance: ${active.label}. Choose appearance`} aria-haspopup="menu" aria-expanded={open} title="Choose appearance"><active.Icon size={19}/></button>
  {open && <div className="themeMenu" role="menu" aria-label="Appearance">
   {choices.map(({value,label,Icon}) => <button type="button" role="menuitemradio" aria-checked={preference===value} key={value} onClick={() => select(value)}><Icon size={17}/><span>{label}</span>{preference===value && <Check size={15}/>}</button>)}
  </div>}
 </div>
}
