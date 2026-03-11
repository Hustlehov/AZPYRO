import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ShoppingCart, ClipboardList, Phone, Banknote, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { icon: ShoppingCart, label: "Add to Cart" },
  { icon: ClipboardList, label: "Submit Order" },
  { icon: Phone, label: "We'll Contact You" },
  { icon: Banknote, label: "Pay & Pickup" },
];

export default function HeroContent() {
  return (
    <div className="relative z-10 text-center px-4 max-w-5xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-5">
          <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
          <span className="text-orange-300 text-sm font-medium tracking-widest uppercase">
            Arizona's Premier Fireworks
          </span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black leading-[0.95] mb-6 tracking-tight">
          <span className="bg-gradient-to-r from-orange-300 via-orange-500 to-amber-500 bg-clip-text text-transparent">
            AZ INSTANT
          </span>
          <br />
          <span className="text-white">PYRO</span>
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-8">
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs md:text-sm text-gray-300">
                <step.icon className="w-3.5 h-3.5 text-orange-400" />
                {step.label}
              </div>
              {i < steps.length - 1 && (
                <span className="text-gray-600 text-xs">›</span>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={createPageUrl("Shop")}
            className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-full text-lg transition-all duration-300 shadow-[0_0_30px_rgba(249,115,22,0.35)] hover:shadow-[0_0_50px_rgba(249,115,22,0.55)]"
          >
            Shop Fireworks
          </Link>
          <button
            onClick={() => {
              const el = document.getElementById("how-it-works");
              if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 96, behavior: "smooth" });
            }}
            className="inline-flex items-center justify-center bg-transparent border-2 border-white/70 hover:border-white hover:bg-white/5 text-white font-bold px-10 py-4 rounded-full text-lg transition-all duration-300"
          >
            How It Works
          </button>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <ChevronDown className="w-6 h-6 text-gray-500 animate-bounce" />
      </motion.div>
    </div>
  );
}
