import test from 'node:test'
import assert from 'node:assert/strict'
import { CART_STORAGE_KEY, readCart, sanitizeCartItems, writeCart } from './cart-persistence.ts'

test('fresh cart is empty', () => {
  assert.deepEqual(readCart({ getItem: () => null }), {})
})

test('valid known product quantities are restored', () => {
  const storage = { getItem: () => JSON.stringify({ version: 1, items: { headphones: 2, charger: 1 } }) }
  assert.deepEqual(readCart(storage), { headphones: 2, charger: 1 })
})

test('malformed and wrong-version payloads are ignored', () => {
  assert.deepEqual(readCart({ getItem: () => '{broken' }), {})
  assert.deepEqual(readCart({ getItem: () => JSON.stringify({ version: 2, items: { headphones: 1 } }) }), {})
})

test('unknown IDs and invalid quantities are rejected', () => {
  assert.deepEqual(sanitizeCartItems({ headphones: 1, unknown: 3, charger: -1, buds: 1.5, case: 100, wireless: '2', cable: 0 }), { headphones: 1 })
})

test('storage read failures do not throw', () => {
  assert.deepEqual(readCart({ getItem: () => { throw Error('blocked') } }), {})
})

test('write persists versioned validated state', () => {
  let key = '', value = ''
  writeCart({ setItem: (k, v) => { key = k; value = v } }, { headphones: 3, bogus: 2 })
  assert.equal(key, CART_STORAGE_KEY)
  assert.deepEqual(JSON.parse(value), { version: 1, items: { headphones: 3 } })
})

test('storage write failures do not throw', () => {
  assert.doesNotThrow(() => writeCart({ setItem: () => { throw Error('quota') } }, { headphones: 1 }))
})

test('prototype-like keys are ignored', () => {
  assert.deepEqual(sanitizeCartItems(JSON.parse('{"__proto__":1,"constructor":2,"headphones":1}')), { headphones: 1 })
})
