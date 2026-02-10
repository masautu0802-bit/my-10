"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  icon: string;
  iconFilled?: string;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/", icon: "home", iconFilled: "home", label: "ホーム" },
  { href: "/search", icon: "search", label: "さがす" },
  { href: "/shop", icon: "storefront", label: "ショップ" },
  { href: "/my/keep", icon: "bookmark", iconFilled: "bookmark", label: "キープ" },
  { href: "/my", icon: "person", iconFilled: "person", label: "マイページ" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bgwarm border-t border-sage/10 pt-2 px-2 max-w-md mx-auto rounded-t-[2rem] shadow-[0_-5px_20px_rgba(162,178,159,0.08)]">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive =
            item.href === "/my"
              ? pathname === "/my" || (pathname.startsWith("/my") && !pathname.startsWith("/my/keep"))
              : pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 w-16 transition-colors group ${
                isActive ? "text-sage" : "text-gray-400 hover:text-sage"
              }`}
            >
              {isActive && (
                <span className="absolute -top-0 w-8 h-1 bg-sage rounded-full" />
              )}
              <span
                className="material-symbols-outlined text-[24px]"
                style={
                  isActive
                    ? { fontVariationSettings: "'FILL' 1" }
                    : undefined
                }
              >
                {item.icon}
              </span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
