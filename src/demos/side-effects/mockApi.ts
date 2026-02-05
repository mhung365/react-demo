import type { Product, ProductFilters, ApiProductResponse } from './types'

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Widget A', category: 'electronics', price: 29.99 },
  { id: '2', name: 'Gadget B', category: 'electronics', price: 89.5 },
  { id: '3', name: 'Tool C', category: 'tools', price: 19.99 },
  { id: '4', name: 'Gizmo D', category: 'electronics', price: 149 },
  { id: '5', name: 'Hammer E', category: 'tools', price: 12.99 },
  { id: '6', name: 'Cable F', category: 'electronics', price: 9.99 },
]

/**
 * Simulates API: fetch products with optional filter.
 * In production this would be fetch/axios; delay simulates network.
 */
export async function fetchProducts(filters: ProductFilters): Promise<ApiProductResponse> {
  await new Promise((r) => setTimeout(r, 500))
  const filtered = MOCK_PRODUCTS.filter(
    (p) =>
      (filters.category === 'all' || p.category === filters.category) &&
      p.price >= filters.minPrice
  )
  return { products: filtered }
}
