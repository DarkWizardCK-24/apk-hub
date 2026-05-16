"use client";

import { motion } from "framer-motion";

export default function Card({ children, className = "", hover = true, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : {}}
      className={`rounded-2xl border border-card-border bg-card-bg p-6 transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/5 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
