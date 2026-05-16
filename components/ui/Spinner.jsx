"use client";

import { motion } from "framer-motion";

export function Spinner({ size = "md", className = "" }) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div
      className={`${sizes[size]} animate-spin rounded-full border-primary/30 border-t-primary ${className}`}
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin-slow rounded-full border-4 border-secondary/20 border-t-secondary" style={{ animationDirection: "reverse" }} />
          </div>
        </div>
        <p className="text-sm font-medium text-text-muted">Loading...</p>
      </motion.div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-card-border bg-card-bg p-5">
      <div className="animate-pulse space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-primary/10" />
            <div className="h-3 w-1/2 rounded bg-primary/5" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-primary/5" />
          <div className="h-3 w-5/6 rounded bg-primary/5" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-full bg-primary/10" />
          <div className="h-6 w-20 rounded-full bg-primary/10" />
        </div>
      </div>
    </div>
  );
}
