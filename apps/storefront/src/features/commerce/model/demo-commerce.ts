import { products } from '../../../entities/product/model/catalog.ts'
import { sanitizeCartItems } from '../../cart/model/cart-persistence.ts'

export const DEMO_PROMO = 'JAYSON10'
export const WISHLIST_KEY = 'jayson-wishlist-v1'
export const ORDERS_KEY = 'jayson-demo-orders-v1'
export type Destination = 'Abuja' | 'Lagos' | 'Port Harcourt' | 'Other cities'
export type DeliveryMode = 'pickup' | 'standard' | 'express'
export type PaymentMethod = 'card' | 'transfer' | 'delivery'
export type DemoOrder = {
 id: string
 createdAt: string
 items: Record<string, number>
 subtotal: number
 discount: number
 delivery: number
 total: number
 destination: Destination
 deliveryMode: DeliveryMode
 paymentMethod: PaymentMethod
}

const ids = new Set(products.map(product => product.id))
const destinations: Destination[] = ['Abuja', 'Lagos', 'Port Harcourt', 'Other cities']
const deliveries: DeliveryMode[] = ['pickup', 'standard', 'express']
const payments: PaymentMethod[] = ['card', 'transfer', 'delivery']

export function promoApplies(code: string): boolean {
 return code.trim().toUpperCase() === DEMO_PROMO
}

export function calculateDemoTotals(items: Record<string, number>, code = '', destination: Destination = 'Abuja', mode: DeliveryMode = 'standard') {
 const safeItems = sanitizeCartItems(items)
 const subtotal = products.reduce((sum, product) => sum + product.price * (safeItems[product.id] || 0), 0)
 const discount = promoApplies(code) ? Math.min(50000, Math.round(subtotal * 0.1)) : 0
 const cityBase = destination === 'Abuja' ? 2500 : destination === 'Lagos' ? 4000 : destination === 'Port Harcourt' ? 5000 : 6500
 const delivery = subtotal === 0 || mode === 'pickup' ? 0 : mode === 'express' ? cityBase * 2 : cityBase
 return { subtotal, discount, delivery, total: Math.max(0, subtotal - discount + delivery) }
}

export function sanitizeWishlist(input: unknown): string[] {
 if (!Array.isArray(input)) return []
 return Array.from(new Set(input.filter((id): id is string => typeof id === 'string' && ids.has(id)))).slice(0, 30)
}

export function readWishlist(storage: Pick<Storage, 'getItem'>): string[] {
 try {
  const raw = storage.getItem(WISHLIST_KEY)
  if (!raw) return []
  const parsed: unknown = JSON.parse(raw)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return []
  const data = parsed as Record<string, unknown>
  return data.version === 1 ? sanitizeWishlist(data.items) : []
 } catch { return [] }
}

export function writeWishlist(storage: Pick<Storage, 'setItem'>, value: string[]): void {
 try { storage.setItem(WISHLIST_KEY, JSON.stringify({ version: 1, items: sanitizeWishlist(value) })) }
 catch { /* Storage access is optional for this local-only demo. */ }
}

export function createDemoOrder(
 items: Record<string, number>,
 destination: Destination,
 deliveryMode: DeliveryMode,
 paymentMethod: PaymentMethod,
 promoCode = '',
 now = new Date(),
 suffix = Math.floor(Math.random() * 900 + 100).toString(),
): DemoOrder {
 const safe = sanitizeCartItems(items)
 if (Object.keys(safe).length === 0) throw new Error('Your demo cart is empty.')
 if (!destinations.includes(destination) || !deliveries.includes(deliveryMode) || !payments.includes(paymentMethod)) {
  throw new Error('Invalid preview checkout options.')
 }
 const totals = calculateDemoTotals(safe, promoCode, destination, deliveryMode)
 return {
  id: 'JT-' + now.toISOString().replace(/\D/g, '').slice(2, 14) + '-' + suffix,
  createdAt: now.toISOString(),
  items: safe,
  ...totals,
  destination,
  deliveryMode,
  paymentMethod,
 }
}

// Only simulated order metadata is retained; customer name, email, phone and
// delivery address are intentionally NEVER stored or transmitted.
export function sanitizeOrders(input: unknown): DemoOrder[] {
 if (!Array.isArray(input)) return []
 const result: DemoOrder[] = []
 const seen = new Set<string>()
 for (const candidate of input.slice(0, 50)) {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) continue
  const item = candidate as Record<string, unknown>
  if (typeof item.id !== 'string' || !/^JT-[0-9]{12}-[0-9]{3}$/.test(item.id) || seen.has(item.id)) continue
  if (typeof item.createdAt !== 'string' || !Number.isFinite(Date.parse(item.createdAt))) continue
  if (!destinations.includes(item.destination as Destination) ||
      !deliveries.includes(item.deliveryMode as DeliveryMode) ||
      !payments.includes(item.paymentMethod as PaymentMethod)) continue
  const safeItems = sanitizeCartItems(item.items)
  if (!Object.keys(safeItems).length) continue
  const amounts = [item.subtotal, item.discount, item.delivery, item.total]
  if (!amounts.every(value => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0)) continue
  const [subtotal, discount, delivery, total] = amounts as number[]
  if (total !== subtotal - discount + delivery || discount > subtotal) continue
  seen.add(item.id)
  result.push({
   id: item.id, createdAt: item.createdAt, items: safeItems,
   subtotal: item.subtotal as number, discount: item.discount as number,
   delivery: item.delivery as number, total: item.total as number,
   destination: item.destination as Destination,
   deliveryMode: item.deliveryMode as DeliveryMode,
   paymentMethod: item.paymentMethod as PaymentMethod,
  })
  if (result.length >= 20) break
 }
 return result
}

export function readDemoOrders(storage: Pick<Storage, 'getItem'>): DemoOrder[] {
 try {
  const raw = storage.getItem(ORDERS_KEY)
  if (!raw) return []
  const parsed: unknown = JSON.parse(raw)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return []
  const data = parsed as Record<string, unknown>
  return data.version === 1 ? sanitizeOrders(data.orders) : []
 } catch { return [] }
}

export function writeDemoOrders(storage: Pick<Storage, 'setItem'>, orders: DemoOrder[]): void {
 try { storage.setItem(ORDERS_KEY, JSON.stringify({ version: 1, orders: sanitizeOrders(orders) })) }
 catch { /* Demo orders remain available in memory while this tab stays open. */ }
}

export function isDemoContactValid(email: string, phone: string): boolean {
 return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && /^[+\d()\s-]{8,20}$/.test(phone.trim())
}
