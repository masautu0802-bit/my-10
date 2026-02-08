import React from 'react';
import { Home, Search, Heart, User } from 'lucide-react';
import { THEME_COLORS } from '../constants';

export const Navigation: React.FC = () => {
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 h-16 border-t z-50 px-6 flex justify-between items-center bg-white/90 backdrop-blur-md max-w-md mx-auto w-full"
      style={{ borderColor: THEME_COLORS.light }}
    >
      <NavItem icon={<Home size={24} />} active />
      <NavItem icon={<Search size={24} />} />
      <NavItem icon={<Heart size={24} />} />
      <NavItem icon={<User size={24} />} />
    </nav>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode; active?: boolean }> = ({ icon, active }) => (
  <button 
    className={`p-2 rounded-full transition-colors duration-200 ${
      active ? 'bg-opacity-20' : 'hover:bg-gray-100'
    }`}
    style={{ 
      color: active ? THEME_COLORS.dark : '#A0A0A0',
      backgroundColor: active ? THEME_COLORS.light : 'transparent' 
    }}
  >
    {icon}
  </button>
);
