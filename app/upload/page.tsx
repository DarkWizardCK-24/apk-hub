'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { RiLockLine } from 'react-icons/ri';
import { createClient } from '@/lib/supabase';
import UploadForm from '@/components/apk/UploadForm';
import AuthButton from '@/components/auth/AuthButton';

export default function UploadPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      setAuthed(!!user);
    });
  }, []);

  return (
    <div className="container-app py-12 max-w-2xl">
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#0B1020', border: '1px solid rgba(0,229,255,0.15)', color: '#E6F1FF', fontFamily: 'var(--font-mono)', fontSize: '13px' } }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-xs uppercase tracking-[0.25em] mb-2" style={{ color: '#FF6B2B' }}>
          $ devapk upload
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">Upload APK</h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-8">
          Add a new Android app or build to the hub.
        </p>
      </motion.div>

      {authed === null ? (
        <div className="term-card h-40 animate-pulse" />
      ) : authed ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="term-card glow-orange"
        >
          <div className="term-card-header" style={{ color: '#FF6B2B' }}>
            devapk — new app
          </div>
          <div className="term-card-body">
            <UploadForm />
          </div>
        </motion.div>
      ) : (
        <div className="term-card text-center py-16 flex flex-col items-center gap-4">
          <div className="term-card-header w-full">devapk — auth required</div>
          <div className="term-card-body flex flex-col items-center gap-4 w-full">
            <RiLockLine size={36} className="text-[var(--color-text-dim)]" />
            <p className="text-sm text-[var(--color-text-muted)]">Sign in with GitHub to upload APKs</p>
            <AuthButton />
          </div>
        </div>
      )}
    </div>
  );
}
