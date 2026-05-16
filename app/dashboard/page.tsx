'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
  RiDashboardLine, RiAndroidLine, RiDownloadLine, RiDeleteBinLine,
  RiExternalLinkLine, RiUpload2Line, RiLockLine, RiGlobalLine, RiCodeLine,
} from 'react-icons/ri';
import { getMyApps, deleteApp, type ApkApp } from '@/lib/db';
import { formatDate, categoryColor } from '@/lib/utils';
import AuthButton from '@/components/auth/AuthButton';
import { createClient } from '@/lib/supabase';

export default function DashboardPage() {
  const [apps, setApps] = useState<ApkApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      setAuthed(!!user);
      if (user) {
        getMyApps().then(data => { setApps(data); setLoading(false); });
      } else {
        setLoading(false);
      }
    });
  }, []);

  async function handleDeleteApp(id: string, name: string) {
    if (!confirm(`Delete "${name}" and all its builds?`)) return;
    try {
      await deleteApp(id);
      setApps(prev => prev.filter(a => a.id !== id));
      toast.success('App deleted');
    } catch {
      toast.error('Failed to delete');
    }
  }

  const totalBuilds = apps.reduce((s, a) => s + (a.builds?.length ?? 0), 0);
  const totalDownloads = apps.reduce((s, a) => s + (a.builds?.reduce((bs, b) => bs + b.download_count, 0) ?? 0), 0);

  if (!authed && authed !== null) {
    return (
      <div className="container-app py-12 max-w-2xl">
        <div className="term-card text-center py-16 flex flex-col items-center gap-4">
          <div className="term-card-header w-full">dashboard — auth required</div>
          <div className="term-card-body flex flex-col items-center gap-4 w-full">
            <RiLockLine size={36} className="text-[var(--color-text-dim)]" />
            <p className="text-sm text-[var(--color-text-muted)]">Sign in with GitHub to manage your APKs</p>
            <AuthButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-12">
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#0B1020', border: '1px solid rgba(0,229,255,0.15)', color: '#E6F1FF', fontFamily: 'var(--font-mono)', fontSize: '13px' } }} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="text-xs uppercase tracking-[0.25em] mb-2" style={{ color: '#FF6B2B' }}>
          $ devapk --my-apps
        </div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <RiDashboardLine style={{ color: '#FF6B2B' }} />
              My Apps
            </h1>
            <p className="text-xs text-[var(--color-text-dim)] mt-1">
              {apps.length} apps · {totalBuilds} builds · {totalDownloads.toLocaleString()} downloads
            </p>
          </div>
          <Link
            href="/upload"
            className="flex items-center gap-2 px-4 py-2 text-sm rounded border font-medium transition-all hover:bg-[rgba(255,107,43,0.08)] shrink-0"
            style={{ borderColor: '#FF6B2B', color: '#FF6B2B' }}
          >
            <RiUpload2Line size={14} /> upload new
          </Link>
        </div>
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="term-card h-24 animate-pulse" />
          ))}
        </div>
      ) : apps.length === 0 ? (
        <div className="term-card text-center py-20 flex flex-col items-center gap-4">
          <div className="term-card-header w-full">devapk — empty</div>
          <div className="term-card-body flex flex-col items-center gap-4 w-full">
            <RiAndroidLine size={40} className="text-[var(--color-text-dim)]" />
            <p className="text-sm text-[var(--color-text-muted)]">No apps yet. Upload your first APK!</p>
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
        <div className="space-y-3">
          {apps.map((app, i) => {
            const color = categoryColor(app.category);
            const latestBuild = app.builds?.[0];
            const totalDl = app.builds?.reduce((s, b) => s + b.download_count, 0) ?? 0;

            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="term-card hover:border-[rgba(255,107,43,0.2)] transition-all"
              >
                <div className="flex items-center gap-4 px-5 py-5 flex-wrap sm:flex-nowrap">
                  {/* Icon */}
                  <div
                    className="shrink-0 w-12 h-12 rounded-lg flex items-center justify-center border"
                    style={{ background: `${color}10`, borderColor: `${color}25` }}
                  >
                    {app.icon_url ? (
                      <img src={app.icon_url} alt={app.name} className="w-9 h-9 rounded object-cover" />
                    ) : (
                      <RiAndroidLine style={{ color }} size={22} />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm" style={{ color }}>{app.name}</span>
                      <span className="text-[10px] capitalize px-1.5 py-0.5 rounded border" style={{ borderColor: `${color}30`, color, background: `${color}08` }}>
                        {app.category}
                      </span>
                      <span className="flex items-center gap-0.5 text-[10px] text-[var(--color-text-dim)]">
                        {app.is_public ? <RiGlobalLine size={10} /> : <RiLockLine size={10} />}
                        {app.is_public ? 'public' : 'private'}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-dim)] mt-0.5">{app.package_name}</p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-5 text-xs text-[var(--color-text-dim)] shrink-0 flex-wrap sm:flex-nowrap">
                    <span className="flex items-center gap-1">
                      <RiCodeLine size={11} />
                      {app.builds?.length ?? 0} builds
                      {latestBuild && ` · v${latestBuild.version_name}`}
                    </span>
                    <span className="flex items-center gap-1">
                      <RiDownloadLine size={11} />
                      {totalDl.toLocaleString()}
                    </span>
                    <span>{formatDate(app.updated_at)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/apps/${app.id}`}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-[var(--color-border)] rounded hover:border-[var(--color-neon-cyan)] hover:text-[var(--color-neon-cyan)] text-[var(--color-text-dim)] transition-colors"
                    >
                      <RiExternalLinkLine size={11} /> view
                    </Link>
                    <button
                      onClick={() => handleDeleteApp(app.id, app.name)}
                      className="p-1.5 text-[var(--color-text-dim)] hover:text-[var(--color-neon-red)] transition-colors rounded"
                      title="Delete app"
                    >
                      <RiDeleteBinLine size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
