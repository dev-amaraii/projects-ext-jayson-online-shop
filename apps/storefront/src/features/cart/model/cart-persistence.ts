import { products } from '../../../entities/product/model/catalog'

export const CART_STORAGE_KEY = 'jayson-cart-v1'
export const MAX_CART_QUANTITY = 99

const validIds = new Set(products.map((product) => product.id))

export function sanitizeCartItems(input: unknown): Record<string, number> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {}
  const result: Record<string, number> = {}
  for (const [id, quantity] of Object.entries(input)) {
    if (validIds.has(id) && typeof quantity === 'number' &&
        Number.isInteger(quantity) && quantity > 0 && quantity <= MAX_CART_QUANTITY) {
      Object.defineProperty(result, id, { value: quantity, enumerable: true, configurable: true, writable: true })
    }
  }
  return result
}

export function readCart(storage: Pick<Storage, 'getItem'>): Record<string, number> {
  try {
    const raw = storage.getItem(CART_STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const record = parsed as Record<string, unknown>
    if (record.version !== 1) return {}
    return sanitizeCartItems(record.items)
  } catch {
    return {}
  }
}

export function writeCart(storage: Pick<Storage, 'setItem'>, items: Record<string, number>): void {
  try {
    storage.setItem(CART_STORAGE_KEY, JSON.stringify({ version: 1, items: sanitizeCartItems(items) }))
  } catch {
    // Storage may be disabled or full; the in-memory cart remains usable.
  }
}
