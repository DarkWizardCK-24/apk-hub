"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { HiOutlineArrowRight } from "react-icons/hi";

export default function CTASection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary p-10 text-center text-white sm:p-16"
        >
          {/* Background Decorations */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
          </div>

          <div className="relative">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Ready to streamline your build sharing?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/80">
              Join thousands of developers who trust ApkHub for secure and
              instant distribution of their builds across teams.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/upload">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-primary shadow-lg transition-shadow hover:shadow-xl"
                >
                  Get Started Free
                  <HiOutlineArrowRight size={16} />
                </motion.button>
              </Link>
              <Link
                href="/explore"
                className="text-sm font-medium text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                Explore platform
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
