'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RiUpload2Line, RiAndroidLine, RiCloseLine, RiImageLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import { createApp, createBuild, uploadApkFile, uploadIcon, CATEGORIES } from '@/lib/db';
import { slugify, formatBytes } from '@/lib/utils';
import { createClient } from '@/lib/supabase';

type Step = 'app' | 'build';

export default function UploadForm() {
  const router = useRouter();
  const apkRef = useRef<HTMLInputElement>(null);
  const iconRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('app');
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  // App fields
  const [appName, setAppName] = useState('');
  const [description, setDescription] = useState('');
  const [packageName, setPackageName] = useState('');
  const [category, setCategory] = useState('utility');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  // Build fields
  const [apkFile, setApkFile] = useState<File | null>(null);
  const [versionName, setVersionName] = useState('1.0.0');
  const [versionCode, setVersionCode] = useState('1');
  const [buildType, setBuildType] = useState<'debug' | 'release'>('release');
  const [changelog, setChangelog] = useState('');
  const [minSdk, setMinSdk] = useState('21');
  const [targetSdk, setTargetSdk] = useState('34');
  const [permissions, setPermissions] = useState('');

  function handleIconChange(file: File) {
    setIconFile(file);
    setIconPreview(URL.createObjectURL(file));
  }

  function handleApkDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!file.name.endsWith('.apk') && !file.type.includes('android')) {
      toast.error('Please drop an .apk file'); return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('APK must be under 50 MB'); return;
    }
    setApkFile(file);
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'app') {
      if (!appName.trim() || !packageName.trim()) {
        toast.error('App name and package name are required');
        return;
      }
      setStep('build');
      return;
    }

    if (!apkFile) {
      toast.error('Please select an APK file');
      return;
    }

    setUploading(true);
    const t = toast.loading('Uploading…');

    try {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { toast.error('Sign in first', { id: t }); return; }

      // 1. Upload icon (optional)
      let iconUrl: string | undefined;
      if (iconFile) {
        toast.loading('Uploading icon…', { id: t });
        iconUrl = await uploadIcon(iconFile, user.id, slugify(appName));
      }

      // 2. Create app record
      toast.loading('Creating app…', { id: t });
      const app = await createApp({
        name: appName.trim(),
        slug: slugify(appName),
        description: description.trim(),
        package_name: packageName.trim(),
        icon_url: iconUrl,
        category,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        is_public: isPublic,
      });

      // 3. Upload APK file
      toast.loading('Uploading APK…', { id: t });
      const { url: fileUrl } = await uploadApkFile(
        apkFile, user.id, app.slug, versionName
      );

      // 4. Create build record
      toast.loading('Saving build…', { id: t });
      await createBuild({
        app_id: app.id,
        version_name: versionName.trim(),
        version_code: parseInt(versionCode) || 1,
        file_url: fileUrl,
        file_name: apkFile.name,
        file_size: apkFile.size,
        build_type: buildType,
        changelog: changelog.trim(),
        min_sdk: parseInt(minSdk) || 21,
        target_sdk: parseInt(targetSdk) || 34,
        permissions: permissions.split('\n').map(p => p.trim()).filter(Boolean),
        sha256: '',
      });

      toast.success('App uploaded!', { id: t });
      router.push(`/apps/${app.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      toast.error(msg, { id: t });
    } finally {
      setUploading(false);
    }
  }, [step, appName, packageName, description, category, tags, isPublic, iconFile, apkFile, versionName, versionCode, buildType, changelog, minSdk, targetSdk, permissions, router]);

  const inputCls = 'w-full px-3 py-2 text-sm bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:border-[var(--color-neon-orange)] transition-colors';
  const labelCls = 'block text-xs text-[var(--color-text-dim)] uppercase tracking-wider mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2 text-xs">
        <span className={step === 'app' ? 'text-[var(--color-neon-orange)]' : 'text-[var(--color-neon-green)]'}>
          {step === 'app' ? '→' : '✓'} 01 app info
        </span>
        <span className="text-[var(--color-text-dim)]">—</span>
        <span className={step === 'build' ? 'text-[var(--color-neon-orange)]' : 'text-[var(--color-text-dim)]'}>
          {step === 'build' ? '→' : '○'} 02 build & file
        </span>
      </div>

      {/* ── Step 1: App Info ── */}
      {step === 'app' && (
        <div className="space-y-4">
          {/* Icon upload */}
          <div>
            <label className={labelCls}>App Icon</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => iconRef.current?.click()}
                className="w-16 h-16 rounded-lg border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-neon-orange)] flex items-center justify-center transition-colors overflow-hidden"
              >
                {iconPreview ? (
                  <img src={iconPreview} alt="icon" className="w-full h-full object-cover" />
                ) : (
                  <RiImageLine size={20} className="text-[var(--color-text-dim)]" />
                )}
              </button>
              <div className="text-xs text-[var(--color-text-dim)]">
                <p>PNG, JPG, WebP</p>
                <p>512×512 recommended</p>
                {iconFile && (
                  <button type="button" onClick={() => { setIconFile(null); setIconPreview(null); }} className="text-[var(--color-neon-red)] mt-1 flex items-center gap-1">
                    <RiCloseLine size={11} /> remove
                  </button>
                )}
              </div>
              <input ref={iconRef} type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && handleIconChange(e.target.files[0])} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>App Name *</label>
              <input className={inputCls} placeholder="My Awesome App" value={appName}
                onChange={e => setAppName(e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>Package Name *</label>
              <input className={inputCls} placeholder="com.example.myapp" value={packageName}
                onChange={e => setPackageName(e.target.value)} required />
            </div>
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea className={inputCls} rows={3} placeholder="What does this app do?"
              value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Category</label>
              <select className={inputCls} value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Tags <span className="normal-case">(comma separated)</span></label>
              <input className={inputCls} placeholder="android, kotlin, open-source"
                value={tags} onChange={e => setTags(e.target.value)} />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              className={`w-10 h-5 rounded-full transition-colors relative ${isPublic ? 'bg-[rgba(255,107,43,0.3)]' : 'bg-[var(--color-surface-2)]'}`}
              onClick={() => setIsPublic(v => !v)}
            >
              <div className={`w-4 h-4 rounded-full absolute top-0.5 transition-all ${isPublic ? 'left-5 bg-[#FF6B2B]' : 'left-0.5 bg-[var(--color-text-dim)]'}`} />
            </div>
            <span className="text-sm text-[var(--color-text-muted)]">
              {isPublic ? 'Public — visible in gallery' : 'Private — only you can see'}
            </span>
          </label>

          <button
            type="submit"
            className="w-full py-2.5 text-sm rounded border font-medium transition-all hover:shadow-lg"
            style={{ borderColor: '#FF6B2B', color: '#FF6B2B', background: 'rgba(255,107,43,0.06)' }}
          >
            next → build info
          </button>
        </div>
      )}

      {/* ── Step 2: Build & File ── */}
      {step === 'build' && (
        <div className="space-y-4">
          <button type="button" onClick={() => setStep('app')} className="text-xs text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)] transition-colors">
            ← back to app info
          </button>

          {/* APK drop zone */}
          <div>
            <label className={labelCls}>APK File *</label>
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleApkDrop}
              onClick={() => apkRef.current?.click()}
              className="relative cursor-pointer rounded-lg border-2 border-dashed p-8 flex flex-col items-center gap-3 transition-all"
              style={{
                borderColor: dragging ? '#FF6B2B' : apkFile ? 'rgba(0,255,163,0.4)' : 'rgba(0,229,255,0.2)',
                background: dragging ? 'rgba(255,107,43,0.05)' : apkFile ? 'rgba(0,255,163,0.03)' : 'transparent',
              }}
            >
              {apkFile ? (
                <>
                  <RiAndroidLine size={32} style={{ color: '#00FFA3' }} />
                  <div className="text-center">
                    <p className="text-sm text-[var(--color-neon-green)]">{apkFile.name}</p>
                    <p className="text-xs text-[var(--color-text-dim)] mt-0.5">{formatBytes(apkFile.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setApkFile(null); }}
                    className="text-xs text-[var(--color-neon-red)] flex items-center gap-1"
                  >
                    <RiCloseLine size={12} /> remove
                  </button>
                </>
              ) : (
                <>
                  <RiUpload2Line size={32} className="text-[var(--color-text-dim)]" />
                  <div className="text-center">
                    <p className="text-sm text-[var(--color-text-muted)]">Drop your .apk here or click to browse</p>
                    <p className="text-xs text-[var(--color-text-dim)] mt-1">Max 50 MB</p>
                  </div>
                </>
              )}
            </div>
            <input ref={apkRef} type="file" accept=".apk,application/vnd.android.package-archive" className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (f.size > 50 * 1024 * 1024) { toast.error('APK must be under 50 MB'); return; }
                setApkFile(f);
              }} />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Version Name *</label>
              <input className={inputCls} placeholder="1.0.0" value={versionName}
                onChange={e => setVersionName(e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>Version Code</label>
              <input className={inputCls} type="number" placeholder="1" value={versionCode}
                onChange={e => setVersionCode(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Build Type</label>
              <select className={inputCls} value={buildType} onChange={e => setBuildType(e.target.value as 'debug' | 'release')}>
                <option value="release">Release</option>
                <option value="debug">Debug</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Min SDK</label>
              <input className={inputCls} type="number" placeholder="21" value={minSdk}
                onChange={e => setMinSdk(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Target SDK</label>
              <input className={inputCls} type="number" placeholder="34" value={targetSdk}
                onChange={e => setTargetSdk(e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Changelog</label>
            <textarea className={inputCls} rows={3} placeholder="What's new in this version?"
              value={changelog} onChange={e => setChangelog(e.target.value)} />
          </div>

          <div>
            <label className={labelCls}>Permissions <span className="normal-case">(one per line)</span></label>
            <textarea className={inputCls} rows={3}
              placeholder="android.permission.INTERNET&#10;android.permission.CAMERA"
              value={permissions} onChange={e => setPermissions(e.target.value)} />
          </div>

          <button
            type="submit"
            disabled={uploading || !apkFile}
            className="w-full py-2.5 text-sm rounded font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'rgba(255,107,43,0.12)', border: '1px solid #FF6B2B', color: '#FF6B2B' }}
          >
            <RiUpload2Line size={15} />
            {uploading ? 'uploading…' : 'publish app'}
          </button>
        </div>
      )}
    </form>
  );
}
