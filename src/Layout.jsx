import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Sparkles, ShoppingCart, Menu, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import CartDrawer from "./components/cart/CartDrawer";

export default function Layout({ children, currentPageName }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: cartItems = [] } = useQuery({
    queryKey: ["cartItems"],
    queryFn: () => base44.entities.CartItem.list(),
    initialData: [],
  });

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const updateQty = useMutation({
    mutationFn: ({ id, quantity }) => base44.entities.CartItem.update(id, { quantity }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cartItems"] }),
  });

  const removeItem = useMutation({
    mutationFn: (id) => base44.entities.CartItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartItems"] });
      toast.success("Item removed");
    },
  });

  const handleUpdateQuantity = (id, quantity) => {
    if (quantity < 1) {
      removeItem.mutate(id);
    } else {
      updateQty.mutate({ id, quantity });
    }
  };

  // Normalize CartItem shape for the drawer
  const drawerItems = cartItems.map((item) => ({
    id: item.id,
    name: item.product_name,
    price: item.product_price,
    image_url: item.product_image,
    quantity: item.quantity || 1,
  }));

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", page: "Home" },
    { name: "Shop", page: "Shop" },
    { name: "Contact", page: "Contact" },
  ];

  return (
    <div className="min-h-screen bg-black">
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-black/80 backdrop-blur-xl border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link
              to={createPageUrl("Home")}
              className="flex items-center gap-2 group"
            >
              <Sparkles className="w-6 h-6 text-orange-500 group-hover:text-orange-400 transition-colors" />
              <span className="text-lg font-bold tracking-tight">
                <span className="text-white">AZ </span>
                <span className="text-orange-500">PYRO</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.page}
                  to={createPageUrl(link.page)}
                  className={`text-sm font-medium transition-colors ${
                    currentPageName === link.page
                      ? "text-orange-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDrawerOpen(true)}
                className="relative flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-sm text-white"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-orange-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                className="md:hidden text-white p-2"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/5">
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.page}
                  to={createPageUrl(link.page)}
                  onClick={() => setMobileOpen(false)}
                  className={`block text-sm font-medium py-2 ${
                    currentPageName === link.page
                      ? "text-orange-400"
                      : "text-gray-400"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <main>{children}</main>

      <CartDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        items={drawerItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={(id) => removeItem.mutate(id)}
        onCheckout={() => {
          setDrawerOpen(false);
          navigate(createPageUrl("Cart"));
        }}
      />
    </div>
  );
}
