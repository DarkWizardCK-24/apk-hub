'use client';

import { useState } from 'react';
import { RiDownloadLine, RiDeleteBinLine, RiShieldCheckLine, RiCodeLine } from 'react-icons/ri';
import type { ApkBuild } from '@/lib/db';
import { incrementDownload } from '@/lib/db';
import { formatBytes, formatDate } from '@/lib/utils';

interface Props {
  build: ApkBuild;
  isOwner?: boolean;
  onDelete?: (id: string) => void;
}

export default function BuildRow({ build, isOwner, onDelete }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      await incrementDownload(build.id);
      window.open(build.file_url, '_blank');
    } finally {
      setDownloading(false);
    }
  }

  const buildColor = build.build_type === 'release' ? '#00FFA3' : '#FFB547';

  return (
    <div className="border border-[var(--color-border)] rounded bg-[rgba(11,16,32,0.5)] hover:bg-[rgba(15,20,40,0.7)] transition-all">
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3 flex-wrap sm:flex-nowrap">
        {/* Version + build type */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="font-semibold text-sm text-[var(--color-text)]">
            v{build.version_name}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border"
            style={{ color: buildColor, borderColor: `${buildColor}40`, background: `${buildColor}10` }}
          >
            {build.build_type}
          </span>
          <span className="text-[10px] text-[var(--color-text-dim)] hidden sm:block">
            code: {build.version_code}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-[var(--color-text-dim)] shrink-0">
          <span>{formatBytes(build.file_size)}</span>
          <span className="flex items-center gap-1">
            <RiDownloadLine size={11} />
            {build.download_count.toLocaleString()}
          </span>
          <span className="hidden sm:block">{formatDate(build.created_at)}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setExpanded(v => !v)}
            className="px-2 py-1 text-[10px] text-[var(--color-text-dim)] border border-[var(--color-border)] rounded hover:text-[var(--color-text-muted)] transition-colors"
          >
            {expanded ? 'hide' : 'details'}
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded border transition-all"
            style={{
              borderColor: 'rgba(255,107,43,0.4)',
              color: '#FF6B2B',
              background: downloading ? 'rgba(255,107,43,0.06)' : 'transparent',
            }}
          >
            <RiDownloadLine size={12} />
            {downloading ? '...' : 'download'}
          </button>
          {isOwner && onDelete && (
            <button
              onClick={() => onDelete(build.id)}
              className="p-1.5 text-[var(--color-text-dim)] hover:text-[var(--color-neon-red)] transition-colors rounded"
              title="Delete build"
            >
              <RiDeleteBinLine size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-[var(--color-border)] px-4 py-3 space-y-2 text-xs">
          {build.changelog && (
            <div>
              <span className="text-[var(--color-neon-orange)] text-[10px] uppercase tracking-wider">changelog</span>
              <p className="mt-1 text-[var(--color-text-muted)] leading-relaxed whitespace-pre-wrap">{build.changelog}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-[var(--color-text-dim)]">
            <span className="flex items-center gap-1"><RiCodeLine size={11} /> SDK {build.min_sdk}–{build.target_sdk}</span>
            {build.sha256 && (
              <span className="flex items-center gap-1 min-w-0">
                <RiShieldCheckLine size={11} className="shrink-0" />
                <span className="truncate font-mono" title={build.sha256}>{build.sha256.slice(0, 16)}…</span>
              </span>
            )}
            <span>{build.file_name}</span>
          </div>
          {build.permissions.length > 0 && (
            <div>
              <span className="text-[var(--color-text-dim)] text-[10px] uppercase tracking-wider">permissions</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {build.permissions.map(p => (
                  <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] text-[var(--color-text-dim)]">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
