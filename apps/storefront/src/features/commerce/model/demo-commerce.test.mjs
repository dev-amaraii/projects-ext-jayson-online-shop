import test from 'node:test'
import assert from 'node:assert/strict'
import {
 DEMO_PROMO, WISHLIST_KEY, ORDERS_KEY, calculateDemoTotals, promoApplies,
 sanitizeWishlist, readWishlist, writeWishlist, createDemoOrder,
 sanitizeOrders, readDemoOrders, writeDemoOrders, isDemoContactValid,
} from './demo-commerce.ts'

test('demo cart totals use only known products and positive quantities', () => {
 const totals = calculateDemoTotals({ headphones: 2, unknown: 5 }, '', 'Abuja', 'standard')
 assert.deepEqual(totals, { subtotal: 150000, discount: 0, delivery: 2500, total: 152500 })
})

test('pickup is free, delivery depends on destination and speed', () => {
 assert.equal(calculateDemoTotals({ buds: 1 }, '', 'Other cities', 'pickup').delivery, 0)
 assert.equal(calculateDemoTotals({ buds: 1 }, '', 'Other cities', 'standard').delivery, 6500)
 assert.equal(calculateDemoTotals({ buds: 1 }, '', 'Other cities', 'express').delivery, 13000)
 assert.equal(calculateDemoTotals({}, '', 'Lagos', 'standard').delivery, 0)
})

test('JAYSON10 is a bounded illustrative discount', () => {
 assert.equal(promoApplies('  jayson10 '), true)
 assert.equal(promoApplies('real-card-charge'), false)
 assert.equal(DEMO_PROMO, 'JAYSON10')
 assert.equal(calculateDemoTotals({ headphones: 1 }, 'jayson10').discount, 7500)
 assert.equal(calculateDemoTotals({ galaxy: 1 }, 'JAYSON10').discount, 50000)
})

test('wishlist validates IDs, deduplicates and rejects malformed payloads', () => {
 assert.deepEqual(sanitizeWishlist(['headphones','headphones','unknown','charger',1]), ['headphones','charger'])
 assert.deepEqual(readWishlist({getItem:()=>'{not json'}), [])
 assert.deepEqual(readWishlist({getItem:()=>JSON.stringify({version:8,items:['headphones']})}), [])
})

test('wishlist reads and writes versioned browser-only state safely', () => {
 const values = new Map()
 const storage = {getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)}
 writeWishlist(storage, ['charger','headphones','bad'])
 assert.equal(values.has(WISHLIST_KEY), true)
 assert.deepEqual(readWishlist(storage), ['charger','headphones'])
 assert.doesNotThrow(()=>writeWishlist({setItem:()=>{throw Error('blocked')}},['charger']))
})

test('mock order creation is deterministic with seeded time and records no customer details', () => {
 const created = createDemoOrder(
  {headphones:2}, 'Abuja', 'standard', 'transfer', 'JAYSON10',
  new Date('2026-10-20T08:00:00.000Z'), '123',
 )
 assert.match(created.id, /^JT-[0-9]{12}-123$/)
 assert.equal(created.total, 137500)
 assert.equal(created.items.headphones, 2)
 assert.deepEqual(Object.keys(created).sort(), [
  'createdAt','delivery','deliveryMode','destination','discount','id','items',
  'paymentMethod','subtotal','total',
 ].sort())
 assert.throws(()=>createDemoOrder({}, 'Abuja','standard','card'), /empty/)
})

test('local order history rejects corrupted and forged data', () => {
 const one = createDemoOrder({buds:1},'Lagos','standard','card','',new Date('2026-10-20T08:00:00Z'),'222')
 assert.deepEqual(sanitizeOrders([one,one]),[one])
 assert.deepEqual(sanitizeOrders([{...one,total:-1},{...one,items:{unknown:1}}]),[])
 assert.deepEqual(readDemoOrders({getItem:()=>'{broken'}),[])
 assert.deepEqual(readDemoOrders({getItem:()=>JSON.stringify({version:5,orders:[one]})}),[])
})

test('order storage is resilient to unavailability', () => {
 const order = createDemoOrder({charger:1},'Abuja','pickup','delivery','',new Date('2026-10-20T08:00:00Z'),'333')
 const values = new Map()
 const storage = {getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)}
 writeDemoOrders(storage,[order])
 assert.equal(values.has(ORDERS_KEY), true)
 assert.deepEqual(readDemoOrders(storage),[order])
 assert.doesNotThrow(()=>writeDemoOrders({setItem:()=>{throw Error('blocked')}},[order]))
})

test('demo checkout contact details are validated but never persisted', () => {
 assert.equal(isDemoContactValid('preview@example.com','08000000000'),true)
 assert.equal(isDemoContactValid('bad','08000000000'),false)
 assert.equal(isDemoContactValid('preview@example.com','bad'),false)
})
