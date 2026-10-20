import test from 'node:test'
import assert from 'node:assert/strict'
import { demoHref, parseDemoRoute } from './demo-routes.ts'

test('homepage, category, cart, checkout, wishlist and order history have stable links', () => {
 for (const name of ['home','shop','cart','checkout','wishlist','orders','account','help']) {
  const page = { name }
  assert.deepEqual(parseDemoRoute(demoHref(page)), page)
 }
})
test('known product pages support direct links', () => {
 assert.deepEqual(parseDemoRoute('#/product/headphones'), { name: 'product', id: 'headphones' })
 assert.equal(demoHref({name:'product',id:'charger'}), '#/product/charger')
})
test('order detail pages validate mock order IDs', () => {
 const page = {name:'order',id:'JT-261020080000-123'}
 assert.deepEqual(parseDemoRoute(demoHref(page)), page)
 assert.deepEqual(parseDemoRoute('#/order/../../secrets'), { name: 'home' })
})
test('invalid or external links safely return home', () => {
 for (const hash of ['', '#', '#/nope', '#/product/unknown', '#/cart/extra', '#/order/not-an-order']) {
  assert.deepEqual(parseDemoRoute(hash), { name: 'home' })
 }
})
