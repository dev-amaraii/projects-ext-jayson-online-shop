import { create } from 'zustand'
type CartState={items:Record<string,number>;add:(id:string)=>void;change:(id:string,delta:number)=>void;clear:()=>void}
export const useCart=create<CartState>((set)=>({items:{},add:(id)=>set(s=>({items:{...s.items,[id]:(s.items[id]||0)+1}})),change:(id,delta)=>set(s=>{const items={...s.items};items[id]=Math.max(0,(items[id]||0)+delta);if(!items[id])delete items[id];return {items}}),clear:()=>set({items:{}})}))
