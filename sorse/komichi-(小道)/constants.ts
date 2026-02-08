import { Shop } from './types';

export const THEME_COLORS = {
  bg: '#F8EDE3',     // Base Background
  light: '#BDD2B6',  // Light Accent
  medium: '#A2B29F', // Medium Accent
  dark: '#798777',   // Dark Accent / Text
  white: '#FFFFFF',
};

export const MOCK_SHOPS: Shop[] = [
  {
    id: '1',
    shopName: 'Atelier Bloom',
    aspectRatio: 'aspect-[3/4]',
    products: [
      { name: 'Seasonal Bouquet', image: 'https://picsum.photos/id/106/400/600', price: 5500 },
      { name: 'Dry Flower Set', image: 'https://picsum.photos/id/115/200/200', price: 3200 },
      { name: 'Vase Collection', image: 'https://picsum.photos/id/120/200/200', price: 1800 },
    ],
  },
  {
    id: '2',
    shopName: 'Komorebi Coffee',
    aspectRatio: 'aspect-square',
    products: [
      { name: 'House Blend', image: 'https://picsum.photos/id/425/400/400', price: 1200 },
      { name: 'Drip Bag', image: 'https://picsum.photos/id/431/200/200', price: 800 },
      { name: 'Ceramic Mug', image: 'https://picsum.photos/id/434/200/200', price: 2400 },
    ],
  },
  {
    id: '3',
    shopName: 'Clay & Soul',
    aspectRatio: 'aspect-[4/5]',
    products: [
      { name: 'Handmade Mug', image: 'https://picsum.photos/id/112/400/500', price: 3800 },
      { name: 'Glazed Plate', image: 'https://picsum.photos/id/113/200/200', price: 4200 },
      { name: 'Clay Vase', image: 'https://picsum.photos/id/114/200/200', price: 5600 },
    ],
  },
  {
    id: '4',
    shopName: 'Vintage Linen',
    aspectRatio: 'aspect-[2/3]',
    products: [
      { name: 'Linen Dress', image: 'https://picsum.photos/id/152/400/600', price: 12800 },
      { name: 'Fabric Swatch', image: 'https://picsum.photos/id/153/200/200', price: 500 },
      { name: 'Tote Bag', image: 'https://picsum.photos/id/154/200/200', price: 4500 },
    ],
  },
  {
    id: '5',
    shopName: 'Urban Baker',
    aspectRatio: 'aspect-[4/3]',
    products: [
      { name: 'Walnut Loaf', image: 'https://picsum.photos/id/292/400/300', price: 850 },
      { name: 'Baguette', image: 'https://picsum.photos/id/293/200/200', price: 420 },
      { name: 'Rye Bread', image: 'https://picsum.photos/id/294/200/200', price: 680 },
    ],
  },
  {
    id: '6',
    shopName: 'Nordic Wood',
    aspectRatio: 'aspect-[4/5]',
    products: [
      { name: 'Side Table', image: 'https://picsum.photos/id/366/400/500', price: 24000 },
      { name: 'Wood Tray', image: 'https://picsum.photos/id/367/200/200', price: 3500 },
      { name: 'Oak Stool', image: 'https://picsum.photos/id/368/200/200', price: 18000 },
    ],
  },
];
