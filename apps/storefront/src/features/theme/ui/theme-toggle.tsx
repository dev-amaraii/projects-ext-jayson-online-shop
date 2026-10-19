import { useEffect, useState } from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { resolveTheme, useTheme, type ThemePreference } from '../model/theme-store'
const choices: ThemePreference[] = ['light','dark','system']
export function ThemeToggle() {
 const { preference, setPreference } = useTheme()
 const [ready,setReady]=useState(false)
 useEffect(() => {
  const saved=window.localStorage.getItem('jayson-theme')
  if(saved && choices.includes(saved as ThemePreference)) setPreference(saved as ThemePreference)
  setReady(true)
 }, [setPreference])
 useEffect(() => {
  if(!ready) return
  const media=window.matchMedia('(prefers-color-scheme: dark)')
  const apply=()=>{ document.documentElement.dataset.theme=resolveTheme(preference); document.documentElement.style.colorScheme=resolveTheme(preference) }
  apply()
  media.addEventListener('change',apply)
  window.localStorage.setItem('jayson-theme',preference)
  return ()=>media.removeEventListener('change',apply)
 },[preference,ready])
 const next=()=>setPreference(choices[(choices.indexOf(preference)+1)%choices.length])
 return <button className="themeToggle" onClick={next} aria-label={`Theme: ${preference}. Switch theme`} title={`Theme: ${preference} (click to switch)`}>{preference==='dark'?<Moon size={19}/>:preference==='light'?<Sun size={19}/>:<Monitor size={19}/>}</button>
}
