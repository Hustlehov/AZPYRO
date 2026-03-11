import React from "react";
import { Search } from "lucide-react";

const categories = [
  { value: "all", label: "All Products", emoji: "🎆" },
  { value: "cakes", label: "Cakes", emoji: "🎂" },
  { value: "shells", label: "Shells", emoji: "💥" },
  { value: "rockets", label: "Rockets", emoji: "🚀" },
  { value: "crackers", label: "Crackers", emoji: "🧨" },
  { value: "girandolas", label: "Girandolas", emoji: "🌀" },
  { value: "bundles", label: "Bundles", emoji: "📦" },
];

export default function ShopFilters({ search, setSearch, category, setCategory, minPrice, setMinPrice, maxPrice, setMaxPrice }) {
  return (
    <div className="space-y-6 mb-10">
      {/* Search */}
      <div className="max-w-md mx-auto relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/40 transition-colors"
        />
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              category === cat.value
                ? "bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Price range text inputs */}
      <div className="max-w-xs mx-auto">
        <p className="text-gray-500 text-sm text-center mb-2">Price Range</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
            <input
              type="number"
              min="0"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-7 pr-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/40 transition-colors"
            />
          </div>
          <span className="text-gray-600 text-sm">–</span>
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
            <input
              type="number"
              min="0"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-7 pr-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/40 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
