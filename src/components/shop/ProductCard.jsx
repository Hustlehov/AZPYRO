import React from "react";
import { ShoppingCart, Flame, Clock, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function ProductCard({ product }) {
  const queryClient = useQueryClient();

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    const existingItems = queryClient.getQueryData(["cartItems"]) || [];
    const existing = existingItems.find((item) => item.product_id === product.id);

    if (existing) {
      await base44.entities.CartItem.update(existing.id, {
        quantity: (existing.quantity || 1) + 1,
      });
    } else {
      await base44.entities.CartItem.create({
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        product_image: product.image_url,
        quantity: 1,
      });
    }
    queryClient.invalidateQueries({ queryKey: ["cartItems"] });
    toast.success(`${product.name} added to cart`);
  };

  const categoryEmojis = {
    cakes: "🎂",
    shells: "💥",
    rockets: "🚀",
    crackers: "🧨",
    girandolas: "🌀",
    bundles: "📦",
  };

  return (
    <div className="group relative bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-orange-500/20 transition-all duration-500">
      {product.featured && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-orange-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
          <Sparkles className="w-3 h-3" /> Featured
        </div>
      )}

      <div className="relative h-48 bg-gradient-to-b from-white/[0.02] to-transparent overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            {categoryEmojis[product.category] || "🎆"}
          </div>
        )}

        <button
          onClick={handleAddToCart}
          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
        >
          <span className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold">
            <ShoppingCart className="w-4 h-4" /> Add to Cart
          </span>
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-white font-bold text-sm uppercase leading-tight">
            {product.name}
          </h3>
          <span className="text-orange-400 font-bold text-lg whitespace-nowrap">
            ${product.price}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-400 text-[10px] font-medium capitalize">
            {product.category}
          </span>
          {product.shots && (
            <span className="px-2 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-medium flex items-center gap-1">
              <Flame className="w-2.5 h-2.5" /> {product.shots} shots
            </span>
          )}
          {product.duration && (
            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-400 text-[10px] font-medium flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" /> {product.duration}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
