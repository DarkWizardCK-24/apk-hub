'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { RiSearchLine, RiApps2Line, RiUpload2Line, RiAndroidLine } from 'react-icons/ri';
import { Toaster } from 'react-hot-toast';
import ApkCard from '@/components/apk/ApkCard';
import { getPublicApps, CATEGORIES, type ApkApp } from '@/lib/db';

const ALL_CATS = ['all', ...CATEGORIES] as const;

export default function BrowsePage() {
  const [apps, setApps] = useState<ApkApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      const data = await getPublicApps(search || undefined, category || undefined);
      setApps(data);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [search, category]);

  const totalDownloads = apps.reduce(
    (s, app) => s + (app.builds?.reduce((bs, b) => bs + b.download_count, 0) ?? 0), 0
  );

  return (
    <div className="container-app py-12">
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#0B1020', border: '1px solid rgba(0,229,255,0.15)', color: '#E6F1FF', fontFamily: 'var(--font-mono)', fontSize: '13px' } }} />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-12"
      >
        <div className="text-xs uppercase tracking-[0.25em] mb-2" style={{ color: '#FF6B2B' }}>
          $ ls /devapk/hub/
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          <span className="caret">Android builds</span>
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] max-w-xl leading-relaxed">
          Upload, manage, and share your Android APK files. Direct downloads, version tracking,
          build metadata — all in one terminal-styled hub.
        </p>

        {/* Stats */}
        <div className="mt-6 flex flex-wrap gap-6 text-xs text-[var(--color-text-dim)]">
          <span>
            <span className="text-[var(--color-text-muted)] font-semibold">{apps.length}</span> apps
          </span>
          <span>
            <span className="text-[var(--color-text-muted)] font-semibold">
              {apps.reduce((s, a) => s + (a.builds?.length ?? 0), 0)}
            </span> builds
          </span>
          <span>
            <span className="text-[var(--color-text-muted)] font-semibold">{totalDownloads.toLocaleString()}</span> downloads
          </span>
        </div>
      </motion.div>

      {/* Search + Upload CTA */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <RiSearchLine size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]" />
          <input
            className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:border-[var(--color-neon-orange)] transition-colors"
            placeholder="search apps…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Link
          href="/upload"
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm rounded border font-medium transition-all hover:bg-[rgba(255,107,43,0.08)] shrink-0"
          style={{ borderColor: '#FF6B2B', color: '#FF6B2B' }}
        >
          <RiUpload2Line size={14} /> upload apk
        </Link>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-8">
        {ALL_CATS.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className="px-3 py-1 text-xs rounded border capitalize transition-all"
            style={{
              borderColor: category === cat ? '#FF6B2B' : 'var(--color-border)',
              color: category === cat ? '#FF6B2B' : 'var(--color-text-dim)',
              background: category === cat ? 'rgba(255,107,43,0.08)' : 'transparent',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="term-card h-48 animate-pulse" />
          ))}
        </div>
      ) : apps.length === 0 ? (
        <div className="term-card text-center py-20">
          <div className="term-card-header">devapk — no results</div>
          <div className="term-card-body flex flex-col items-center gap-4">
            <RiAndroidLine size={40} className="text-[var(--color-text-dim)]" />
            <div>
              <p className="text-[var(--color-text-muted)] text-sm">No APKs found</p>
              <p className="text-[var(--color-text-dim)] text-xs mt-1">
                {search ? 'Try a different search term' : 'Be the first to upload one!'}
              </p>
            </div>
            <Link
              href="/upload"
              className="px-4 py-2 text-sm rounded border transition-colors"
              style={{ borderColor: '#FF6B2B', color: '#FF6B2B' }}
            >
              <RiUpload2Line size={13} className="inline mr-1" /> upload apk
            </Link>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {apps.map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <ApkCard app={app} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* DevEco callout */}
      <div className="mt-16 p-4 rounded border border-[var(--color-border)] bg-[rgba(255,107,43,0.03)] text-xs text-[var(--color-text-dim)]">
        <span style={{ color: '#FF6B2B' }}>$</span> devapk — part of the{' '}
        <span className="text-[var(--color-text-muted)]">DevEco ecosystem</span>
        <span className="ml-3">
          <RiApps2Line className="inline mr-1" size={11} />
          12 tools, one terminal aesthetic
        </span>
      </div>
    </div>
  );
}
