"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  HiOutlineUpload,
  HiOutlineShieldCheck,
  HiOutlineLightningBolt,
} from "react-icons/hi";
import { SiAndroid } from "react-icons/si";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute -right-40 top-20 h-80 w-80 rounded-full bg-secondary/20 blur-[100px]" />
        <div className="absolute -bottom-40 left-1/2 h-80 w-80 rounded-full bg-accent/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary"
            >
              <HiOutlineLightningBolt size={14} />
              Secure Developer Build Sharing
            </motion.div>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Share builds{" "}
              <span className="gradient-text">securely</span>{" "}
              with your team
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-text-muted">
              The fastest way to distribute APKs, web builds, and app bundles.
              Version control, access management, and instant sharing for
              developer teams.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/upload">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-shadow hover:shadow-xl hover:shadow-primary/30 sm:w-auto"
                >
                  <HiOutlineUpload size={18} />
                  Start Sharing
                </motion.button>
              </Link>
              <Link href="/explore">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-card-border px-7 py-3.5 text-sm font-semibold transition-colors hover:border-primary hover:text-primary sm:w-auto"
                >
                  Explore Builds
                </motion.button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 flex gap-8">
              {[
                { value: "10K+", label: "Builds Shared" },
                { value: "2K+", label: "Developers" },
                { value: "99.9%", label: "Uptime" },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-2xl font-bold gradient-text">{stat.value}</p>
                  <p className="text-xs text-text-muted">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - Floating Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="animate-float">
              <div className="rounded-3xl border border-card-border bg-card-bg p-8 shadow-2xl shadow-primary/10">
                {/* Mock Upload Card */}
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white">
                    <SiAndroid size={24} />
                  </div>
                  <div>
                    <p className="font-semibold">MyApp-v2.4.1.apk</p>
                    <p className="text-xs text-text-muted">Release Build - 24.5 MB</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Version</span>
                    <span className="rounded-full bg-success/10 px-3 py-0.5 text-xs font-medium text-success">
                      v2.4.1
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Platform</span>
                    <span>Android</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Build Type</span>
                    <span>Release</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Security</span>
                    <span className="flex items-center gap-1 text-success">
                      <HiOutlineShieldCheck size={16} />
                      Verified
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-text-muted">Upload Progress</span>
                    <span className="font-medium text-primary">100%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-primary/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2, delay: 1 }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
