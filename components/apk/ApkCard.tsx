'use client';

import Link from 'next/link';
import { RiDownloadLine, RiAndroidLine, RiTimeLine } from 'react-icons/ri';
import type { ApkApp } from '@/lib/db';
import { formatBytes, formatDate, categoryColor } from '@/lib/utils';

interface Props { app: ApkApp; }

export default function ApkCard({ app }: Props) {
  const latestBuild = app.builds?.[0];
  const totalDownloads = app.builds?.reduce((s, b) => s + b.download_count, 0) ?? 0;
  const color = categoryColor(app.category);

  return (
    <Link
      href={`/apps/${app.id}`}
      className="group block term-card hover:scale-[1.01] transition-all duration-200"
      style={{ ['--hover-glow' as string]: `0 0 0 1px ${color}30` }}
    >
      {/* Card header bar */}
      <div
        className="term-card-header"
        style={{ color }}
      >
        {app.package_name || 'com.example.app'}
        <span
          className="text-[10px] px-2 py-0.5 rounded-full border capitalize"
          style={{ borderColor: `${color}40`, color, background: `${color}10` }}
        >
          {app.category}
        </span>
      </div>

      <div className="term-card-body flex gap-4">
        {/* Icon */}
        <div
          className="shrink-0 w-14 h-14 rounded-lg flex items-center justify-center text-2xl border"
          style={{ background: `${color}10`, borderColor: `${color}25` }}
        >
          {app.icon_url ? (
            <img src={app.icon_url} alt={app.name} className="w-10 h-10 rounded object-cover" />
          ) : (
            <RiAndroidLine style={{ color }} size={26} />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold text-sm truncate group-hover:opacity-90 transition-opacity"
            style={{ color }}
          >
            {app.name}
          </h3>
          <p className="text-xs text-[var(--color-text-dim)] mt-0.5 mb-2 truncate">
            {app.author?.display_name ?? app.author?.username ?? 'unknown'}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed line-clamp-2">
            {app.description || 'No description.'}
          </p>
        </div>
      </div>

      {/* Footer stats */}
      <div className="px-5 pb-4 pt-1 flex items-center justify-between text-[10px] text-[var(--color-text-dim)]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <RiDownloadLine size={11} />
            {totalDownloads.toLocaleString()}
          </span>
          {latestBuild && (
            <span className="text-[var(--color-text-dim)]">
              v{latestBuild.version_name}
              {' · '}
              {formatBytes(latestBuild.file_size)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <RiTimeLine size={10} />
          {formatDate(app.created_at)}
        </div>
      </div>

      {/* Tags */}
      {app.tags.length > 0 && (
        <div className="px-5 pb-4 flex flex-wrap gap-1">
          {app.tags.slice(0, 4).map(tag => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--color-border)] text-[var(--color-text-dim)]"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
