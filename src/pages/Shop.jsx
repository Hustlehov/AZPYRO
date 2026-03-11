import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import ShopFilters from "../components/shop/ShopFilters";
import ProductCard from "../components/shop/ProductCard";

export default function Shop() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => base44.entities.Product.list(),
    initialData: [],
  });

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "all" || p.category === category;
    const matchPrice = (!minPrice || p.price >= Number(minPrice)) && (!maxPrice || p.price <= Number(maxPrice));
    return matchSearch && matchCategory && matchPrice;
  });

  return (
    <div className="min-h-screen bg-black pt-28 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-orange-400 text-sm font-medium tracking-widest uppercase mb-3">
            Browse Our Collection
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Shop <span className="text-orange-500">Fireworks</span>
          </h1>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            Explore our full selection of professional-grade fireworks. From stunning cakes to powerful shells.
          </p>
        </div>

        <ShopFilters
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No products found matching your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
