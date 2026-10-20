// Hash routes keep direct links and refreshes working on the static Pages preview
// while the main TanStack Start application continues to render at /.
import { products } from '../../../entities/product/model/catalog.ts'

export type DemoPage =
 | { name: 'home' }
 | { name: 'shop' }
 | { name: 'product'; id: string }
 | { name: 'cart' }
 | { name: 'checkout' }
 | { name: 'wishlist' }
 | { name: 'orders' }
 | { name: 'order'; id: string }
 | { name: 'account' }
 | { name: 'help' }

const fixed = new Set(['home', 'shop', 'cart', 'checkout', 'wishlist', 'orders', 'account', 'help'])
const productIds = new Set(products.map(product => product.id))

export function parseDemoRoute(hash: string): DemoPage {
 const raw = hash.replace(/^#\/?/, '').replace(/\/$/, '')
 const parts = raw.split('/')
 if (parts.length === 1 && fixed.has(parts[0])) {
  return { name: parts[0] as Extract<DemoPage, { id?: never }>['name'] }
 }
 if (parts.length === 2 && parts[0] === 'product' && productIds.has(parts[1])) return { name: 'product', id: parts[1] }
 if (parts.length === 2 && parts[0] === 'order' && /^JT-[0-9]{12}-[0-9]{3}$/.test(parts[1])) return { name: 'order', id: parts[1] }
 return { name: 'home' }
}

export function demoHref(page: DemoPage): string {
 return '#/' + page.name + ('id' in page ? '/' + encodeURIComponent(page.id) : '')
}
