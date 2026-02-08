export interface Product {
  name: string;
  image: string;
  price: number;
}

export interface Shop {
  id: string;
  shopName: string;
  products: Product[];
  aspectRatio: string;
}

export type SortOption = 'followers' | 'newest';
