export interface Product {
  id: string
  name: string
  category: string
  price: number
}

export interface ProductFilters {
  category: string
  minPrice: number
}

export interface ApiProductResponse {
  products: Product[]
}
