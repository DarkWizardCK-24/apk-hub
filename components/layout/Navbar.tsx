'use client';

import Link from 'next/link';
import { useState } from 'react';
import { RiApps2Line, RiUpload2Line, RiDashboardLine, RiMenu3Line, RiCloseLine } from 'react-icons/ri';
import AuthButton from '@/components/auth/AuthButton';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md border-b border-[var(--color-border)] bg-[rgba(5,7,15,0.75)]">
      <div className="container-app flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div
            className="w-7 h-7 rounded flex items-center justify-center text-sm"
            style={{ background: 'rgba(255,107,43,0.12)', border: '1px solid rgba(255,107,43,0.3)' }}
          >
            📦
          </div>
          <span className="font-bold text-sm">
            <span style={{ color: '#FF6B2B' }}>dev</span>
            <span className="text-[var(--color-neon-cyan)]">apk</span>
            <span className="text-[var(--color-text-dim)]">.hub</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-neon-orange)] rounded transition-colors">
            <RiApps2Line size={14} /> browse
          </Link>
          <Link href="/upload" className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded border border-[var(--color-neon-orange)] hover:bg-[rgba(255,107,43,0.08)] transition-colors" style={{ color: '#FF6B2B' }}>
            <RiUpload2Line size={14} /> upload
          </Link>
          <Link href="/dashboard" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-neon-cyan)] rounded transition-colors">
            <RiDashboardLine size={14} /> my apps
          </Link>
          <a
            href="https://dev-folio-two-rho.vercel.app/"
            className="ml-2 px-3 py-1.5 text-xs border border-[var(--color-border)] rounded hover:border-[var(--color-neon-cyan)] hover:text-[var(--color-neon-cyan)] text-[var(--color-text-muted)] transition-colors"
          >
            ↗ DevFolio
          </a>
          <AuthButton />
        </nav>

        {/* Mobile menu toggle */}
        <button className="md:hidden text-[var(--color-text-muted)]" onClick={() => setOpen(v => !v)}>
          {open ? <RiCloseLine size={22} /> : <RiMenu3Line size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-surface)] divide-y divide-[var(--color-border)]">
          <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2 px-6 py-3 text-sm text-[var(--color-text-muted)]">
            <RiApps2Line size={14} /> browse
          </Link>
          <Link href="/upload" onClick={() => setOpen(false)} className="flex items-center gap-2 px-6 py-3 text-sm" style={{ color: '#FF6B2B' }}>
            <RiUpload2Line size={14} /> upload apk
          </Link>
          <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2 px-6 py-3 text-sm text-[var(--color-text-muted)]">
            <RiDashboardLine size={14} /> my apps
          </Link>
          <a href="http://localhost:3000" onClick={() => setOpen(false)} className="flex items-center gap-2 px-6 py-3 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-neon-cyan)]">
            ↩ DevFolio
          </a>
          <div className="px-6 py-3">
            <AuthButton />
          </div>
        </nav>
      )}
    </header>
  );
}
