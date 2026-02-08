import React, { useState } from 'react';
import { SlidersHorizontal, MapPin, X } from 'lucide-react';
import { MOCK_SHOPS, THEME_COLORS } from './constants';
import { ShopCard } from './components/ShopCard';
import { Navigation } from './components/Navigation';
import { Product } from './types';

const App: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Use mock data directly as requested
  const shops = MOCK_SHOPS;

  // Split into columns for Masonry layout
  const leftColumn = shops.filter((_, i) => i % 2 === 0);
  const rightColumn = shops.filter((_, i) => i % 2 !== 0);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleShopDoubleClick = (shopId: string) => {
    // In a real app, this would be: router.push(`/shop/${shopId}`)
    const shopName = shops.find(s => s.id === shopId)?.shopName;
    alert(`Navigating to shop page: ${shopName}`);
  };

  const closePopup = () => {
    setSelectedProduct(null);
  };

  return (
    <div 
      className="min-h-screen w-full flex justify-center"
      style={{ backgroundColor: '#E5E7EB' }} 
    >
      {/* Mobile Container wrapper */}
      <div 
        className="w-full max-w-md relative min-h-screen shadow-2xl pb-20 overflow-x-hidden"
        style={{ backgroundColor: THEME_COLORS.bg }}
      >
        
        {/* Header - Styled like a Boutique Street Entrance */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg px-6 py-5 border-b flex justify-between items-center" style={{borderColor: THEME_COLORS.light}}>
          <div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-black mb-1" style={{ color: THEME_COLORS.medium }}>
              <MapPin size={10} />
              <span>Daikanyama Shopping Street</span>
            </div>
            <h1 
              className="text-2xl font-serif-header font-bold tracking-tight flex items-center gap-3"
              style={{ color: THEME_COLORS.dark }}
            >
              Komichi <span className="h-1 w-8 rounded-full bg-red-400/30 mt-1"></span>
            </h1>
          </div>
          <button 
            className="p-3 rounded-2xl bg-gray-50 border border-gray-100 transition-all hover:shadow-md active:scale-95"
            style={{ color: THEME_COLORS.dark }}
          >
            <SlidersHorizontal size={20} />
          </button>
        </header>

        {/* Discovery Feed */}
        <main className="px-3 py-6">
          
          {/* Removed descriptive text area as requested */}
          <div className="mb-4"></div>

          {/* Masonry Grid */}
          <div className="flex gap-3">
            {/* Left Column */}
            <div className="flex-1 flex flex-col">
              {leftColumn.map((shop) => (
                <ShopCard 
                  key={shop.id} 
                  shop={shop} 
                  onProductClick={handleProductClick}
                  onShopDoubleClick={handleShopDoubleClick}
                />
              ))}
            </div>

            {/* Right Column */}
            <div className="flex-1 flex flex-col pt-12"> 
              {/* Staggered layout for organic boutique feel */}
              {rightColumn.map((shop) => (
                <ShopCard 
                  key={shop.id} 
                  shop={shop}
                  onProductClick={handleProductClick}
                  onShopDoubleClick={handleShopDoubleClick}
                />
              ))}
            </div>
          </div>
          
          {/* Footer Decoration */}
          <div className="mt-16 text-center pb-12 flex flex-col items-center gap-4">
            <div className="h-px w-16 bg-gray-300"></div>
            <span 
              className="text-[9px] uppercase tracking-[0.4em] font-bold opacity-30"
              style={{ color: THEME_COLORS.dark }}
            >
              The Street Continues
            </span>
          </div>
        </main>

        <Navigation />

        {/* Product Popup Modal */}
        {selectedProduct && (
          <div 
            className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={closePopup}
          >
            <div 
              className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-xs relative animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={closePopup}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-10 backdrop-blur-md"
              >
                <X size={16} />
              </button>
              
              <div className="aspect-square w-full relative">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-6 text-center">
                <h3 
                  className="text-lg font-serif font-bold mb-1"
                  style={{ color: THEME_COLORS.dark }}
                >
                  {selectedProduct.name}
                </h3>
                <div className="h-0.5 w-8 bg-gray-200 mx-auto my-3"></div>
                <p 
                  className="text-xl font-medium"
                  style={{ color: THEME_COLORS.medium }}
                >
                  ¥{selectedProduct.price.toLocaleString()}
                </p>
                <button className="mt-5 w-full py-3 rounded-xl bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">
                  View Item Details
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;
