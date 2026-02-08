import React from 'react';
import { Shop, Product } from '../types';
import { THEME_COLORS } from '../constants';

interface ShopCardProps {
  shop: Shop;
  onProductClick: (product: Product) => void;
  onShopDoubleClick: (shopId: string) => void;
}

export const ShopCard: React.FC<ShopCardProps> = ({ shop, onProductClick, onShopDoubleClick }) => {
  return (
    <div 
      className="group break-inside-avoid mb-8 relative flex flex-col rounded-3xl overflow-hidden transition-all duration-500 ease-out cursor-pointer hover:-translate-y-1 hover:shadow-2xl select-none"
      style={{ 
        backgroundColor: THEME_COLORS.white,
        boxShadow: '0 20px 40px -20px rgba(0,0,0,0.1)'
      }}
      onDoubleClick={() => onShopDoubleClick(shop.id)}
    >
      {/* 1. Shop Signage (Minimalist) */}
      <div className="px-5 py-4 bg-white/50 backdrop-blur-md">
        <h3 
          className="font-serif font-bold text-lg tracking-tight"
          style={{ color: THEME_COLORS.dark }}
        >
          {shop.shopName}
        </h3>
      </div>

      {/* 2. Showcase Window (Triptych Image Layout) */}
      <div className="px-2 pb-2">
        <div className="relative w-full overflow-hidden rounded-2xl group/window">
          {/* Glass Window Frame Effect */}
          <div className="absolute inset-0 border-[8px] border-white/20 z-20 pointer-events-none rounded-2xl"></div>
          <div className="absolute inset-0 border border-white/10 z-20 pointer-events-none rounded-2xl"></div>
          
          {/* Products Layout: 1 Large + 2 Small stacked */}
          <div className={`grid grid-cols-3 gap-1 ${shop.aspectRatio}`}>
            {/* Main Product */}
            <div 
              className="col-span-2 relative overflow-hidden active:scale-95 transition-transform"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering other clicks immediately
                onProductClick(shop.products[0]);
              }}
            >
              <img
                src={shop.products[0].image}
                alt={shop.products[0].name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                loading="lazy"
              />
              {/* Individual Product Glass Label */}
              <div className="absolute bottom-2 left-2 p-1.5 bg-black/10 backdrop-blur-md rounded border border-white/20">
                <span className="text-[8px] text-white font-medium uppercase tracking-widest">{shop.products[0].name}</span>
              </div>
            </div>

            {/* Side Products Column */}
            <div className="col-span-1 grid grid-rows-2 gap-1">
              {shop.products.slice(1, 3).map((product, idx) => (
                <div 
                  key={idx} 
                  className="relative overflow-hidden active:scale-95 transition-transform"
                  onClick={(e) => {
                    e.stopPropagation();
                    onProductClick(product);
                  }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute bottom-1.5 left-1.5 p-1 bg-black/10 backdrop-blur-md rounded border border-white/10">
                    <span className="text-[7px] text-white font-medium uppercase truncate block max-w-[40px]">{product.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overall Glass Reflection Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/10 opacity-30 mix-blend-overlay z-10 pointer-events-none"></div>
        </div>
      </div>
      
      {/* Decorative accent at bottom */}
      <div className="h-1 w-full opacity-10" style={{ backgroundColor: THEME_COLORS.medium }}></div>
    </div>
  );
};
