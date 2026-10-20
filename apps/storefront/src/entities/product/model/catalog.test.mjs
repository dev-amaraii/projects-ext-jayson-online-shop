import test from 'node:test'
import assert from 'node:assert/strict'
import { categories, filterProducts, products } from './catalog.ts'

test('catalogue contains unique IDs and valid demo data', () => {
 assert.equal(new Set(products.map(p=>p.id)).size, products.length)
 for (const product of products) {
  assert.ok(product.id && product.name && product.description)
  assert.ok(Number.isFinite(product.price) && product.price > 0)
  assert.ok(categories.some(c=>c.name===product.category))
 }
})

test('empty query returns all products', () => {
 assert.equal(filterProducts('All', '').length, products.length)
 assert.equal(filterProducts('All', '  ').length, products.length)
})

test('category filter is exact', () => {
 const audio = filterProducts('Audio', '')
 assert.ok(audio.length > 0)
 assert.ok(audio.every(p=>p.category==='Audio'))
})

test('search ignores case and surrounding whitespace', () => {
 assert.deepEqual(filterProducts('All','  HEADPHONES  ').map(p=>p.id), ['headphones'])
})

test('search includes descriptions and category', () => {
 assert.ok(filterProducts('All','all-day comfort').some(p=>p.id==='headphones'))
 assert.ok(filterProducts('All','power').some(p=>p.id==='powerbank'))
})

test('category and query filters are combined', () => {
 assert.deepEqual(filterProducts('Phones','headphones'),[])
 assert.ok(filterProducts('Audio','wireless').length > 0)
})

test('unknown search term returns an empty result', () => {
 assert.deepEqual(filterProducts('All','nonexistent-product-xyz'),[])
})
