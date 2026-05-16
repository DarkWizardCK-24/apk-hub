'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import {
  RiAndroidLine, RiDownloadLine, RiGithubFill,
  RiTimeLine, RiCodeLine, RiArrowLeftLine, RiUpload2Line,
} from 'react-icons/ri';
import { getAppById, deleteBuild, type ApkApp } from '@/lib/db';
import BuildRow from '@/components/apk/BuildRow';
import { formatDate, categoryColor } from '@/lib/utils';
import { createClient } from '@/lib/supabase';

export default function AppDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<ApkApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null));
  }, []);

  useEffect(() => {
    if (!id) return;
    getAppById(id).then(data => { setApp(data); setLoading(false); });
  }, [id]);

  async function handleDeleteBuild(buildId: string) {
    if (!confirm('Delete this build?')) return;
    try {
      await deleteBuild(buildId);
      setApp(prev => prev ? {
        ...prev,
        builds: prev.builds?.filter(b => b.id !== buildId),
      } : prev);
      toast.success('Build deleted');
    } catch {
      toast.error('Failed to delete');
    }
  }

  if (loading) {
    return (
      <div className="container-app py-12 max-w-3xl">
        <div className="term-card h-64 animate-pulse" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="container-app py-12 max-w-3xl">
        <div className="term-card text-center py-16">
          <div className="term-card-header">404 — not found</div>
          <div className="term-card-body">
            <p className="text-[var(--color-text-muted)] text-sm mb-4">App not found or private.</p>
            <Link href="/" className="text-[var(--color-neon-cyan)] text-sm hover:underline">← back to browse</Link>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = userId === app.user_id;
  const color = categoryColor(app.category);
  const totalDownloads = app.builds?.reduce((s, b) => s + b.download_count, 0) ?? 0;
  const latestBuild = app.builds?.[0];

  return (
    <div className="container-app py-12 max-w-3xl">
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#0B1020', border: '1px solid rgba(0,229,255,0.15)', color: '#E6F1FF', fontFamily: 'var(--font-mono)', fontSize: '13px' } }} />

      <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)] mb-6 transition-colors">
        <RiArrowLeftLine size={12} /> back to browse
      </Link>

      {/* App header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="term-card mb-6 glow-orange">
        <div className="term-card-header" style={{ color }}>
          {app.package_name}
          <span className="capitalize text-[10px] px-2 py-0.5 rounded-full border" style={{ borderColor: `${color}40`, color, background: `${color}10` }}>
            {app.category}
          </span>
        </div>
        <div className="term-card-body">
          <div className="flex gap-4 flex-wrap sm:flex-nowrap">
            {/* Icon */}
            <div
              className="shrink-0 w-20 h-20 rounded-xl flex items-center justify-center text-3xl border"
              style={{ background: `${color}10`, borderColor: `${color}25` }}
            >
              {app.icon_url ? (
                <img src={app.icon_url} alt={app.name} className="w-16 h-16 rounded-lg object-cover" />
              ) : (
                <RiAndroidLine style={{ color }} size={36} />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold" style={{ color }}>{app.name}</h1>
              <div className="flex items-center gap-2 mt-1 text-xs text-[var(--color-text-dim)]">
                {app.author?.avatar_url && (
                  <img src={app.author.avatar_url} alt="" className="w-4 h-4 rounded-full" />
                )}
                <span>{app.author?.display_name ?? app.author?.username ?? 'unknown'}</span>
                <span>·</span>
                <RiTimeLine size={10} />
                <span>{formatDate(app.created_at)}</span>
              </div>
              {app.description && (
                <p className="mt-2 text-sm text-[var(--color-text-muted)] leading-relaxed">{app.description}</p>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex flex-wrap gap-6 text-xs">
            <div>
              <span className="text-[var(--color-text-dim)]">downloads</span>
              <span className="ml-2 font-semibold text-[var(--color-text)]">{totalDownloads.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-dim)]">builds</span>
              <span className="ml-2 font-semibold text-[var(--color-text)]">{app.builds?.length ?? 0}</span>
            </div>
            {latestBuild && (
              <div>
                <span className="text-[var(--color-text-dim)]">latest</span>
                <span className="ml-2 font-semibold" style={{ color }}>v{latestBuild.version_name}</span>
              </div>
            )}
            <div>
              <span className="text-[var(--color-text-dim)]">visibility</span>
              <span className={`ml-2 font-semibold ${app.is_public ? 'text-[var(--color-neon-green)]' : 'text-[var(--color-text-dim)]'}`}>
                {app.is_public ? 'public' : 'private'}
              </span>
            </div>
          </div>

          {/* Tags */}
          {app.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {app.tags.map(tag => (
                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--color-border)] text-[var(--color-text-dim)]">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick download CTA */}
      {latestBuild && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 p-4 rounded border flex items-center justify-between gap-4 flex-wrap"
          style={{ borderColor: 'rgba(255,107,43,0.25)', background: 'rgba(255,107,43,0.04)' }}
        >
          <div className="text-xs text-[var(--color-text-muted)]">
            <span className="font-semibold text-sm text-[var(--color-text)]">Latest: v{latestBuild.version_name}</span>
            <span className="ml-2 text-[var(--color-text-dim)]">({latestBuild.build_type})</span>
          </div>
          <a
            href={latestBuild.file_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm rounded font-medium transition-all"
            style={{ background: 'rgba(255,107,43,0.15)', border: '1px solid #FF6B2B', color: '#FF6B2B' }}
          >
            <RiDownloadLine size={15} /> Download APK
          </a>
        </motion.div>
      )}

      {/* Builds list */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-2">
            <RiCodeLine size={14} /> Builds ({app.builds?.length ?? 0})
          </h2>
          {isOwner && (
            <Link
              href="/upload"
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded border border-[var(--color-border)] text-[var(--color-text-dim)] hover:border-[var(--color-neon-orange)] hover:text-[var(--color-neon-orange)] transition-colors"
            >
              <RiUpload2Line size={11} /> new build
            </Link>
          )}
        </div>

        {!app.builds?.length ? (
          <div className="text-center py-8 text-[var(--color-text-dim)] text-sm border border-[var(--color-border)] rounded">
            No builds yet.
          </div>
        ) : (
          <div className="space-y-2">
            {app.builds.map(build => (
              <BuildRow
                key={build.id}
                build={build}
                isOwner={isOwner}
                onDelete={handleDeleteBuild}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Author info */}
      {app.author && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-8 p-4 rounded border border-[var(--color-border)] flex items-center gap-3">
          {app.author.avatar_url && (
            <img src={app.author.avatar_url} alt="" className="w-10 h-10 rounded-full border border-[var(--color-border)]" />
          )}
          <div className="flex-1">
            <span className="text-sm font-medium text-[var(--color-text)]">{app.author.display_name ?? app.author.username}</span>
            <p className="text-xs text-[var(--color-text-dim)]">@{app.author.username}</p>
          </div>
          <a
            href={`https://github.com/${app.author.username}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)] transition-colors"
          >
            <RiGithubFill size={14} /> GitHub
          </a>
        </motion.div>
      )}
    </div>
  );
}
