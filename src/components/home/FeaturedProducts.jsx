import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import ProductCard from "../shop/ProductCard";

export default function FeaturedProducts() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["featuredProducts"],
    queryFn: () => base44.entities.Product.filter({ featured: true }, "-created_date", 4),
    initialData: [],
  });

  return (
    <section className="relative py-24 px-4 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Featured <span className="text-orange-500">Fireworks</span>
            </h2>
          </div>
          <Link
            to={createPageUrl("Shop")}
            className="hidden sm:flex items-center gap-2 text-orange-400 hover:text-orange-300 font-medium text-sm transition-colors"
          >
            View All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <Link
          to={createPageUrl("Shop")}
          className="sm:hidden flex items-center justify-center gap-2 text-orange-400 hover:text-orange-300 font-medium text-sm transition-colors mt-8"
        >
          View All Products <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
