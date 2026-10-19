import { create } from 'zustand'
import { MAX_CART_QUANTITY, readCart, writeCart } from './cart-persistence'

type CartState = {
  items: Record<string, number>
  add: (id: string) => void
  change: (id: string, delta: number) => void
  clear: () => void
}

export const useCart = create<CartState>((set) => ({
  items: {},
  add: (id) => set((state) => ({
    items: { ...state.items, [id]: Math.min(MAX_CART_QUANTITY, (state.items[id] || 0) + 1) },
  })),
  change: (id, delta) => set((state) => {
    const items = { ...state.items }
    const next = Math.max(0, Math.min(MAX_CART_QUANTITY, (items[id] || 0) + delta))
    if (next) items[id] = next
    else delete items[id]
    return { items }
  }),
  clear: () => set({ items: {} }),
}))

/** Call only after client mount; never touch browser storage during SSR. */
export function connectCartPersistence(storage: Pick<Storage, 'getItem' | 'setItem'>): () => void {
  useCart.setState({ items: readCart(storage) })
  return useCart.subscribe((state) => writeCart(storage, state.items))
}
