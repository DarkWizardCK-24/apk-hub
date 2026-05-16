import { createClient } from './supabase';

export type ApkApp = {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string;
  package_name: string;
  icon_url: string | null;
  category: string;
  tags: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
  author?: { username: string; display_name: string | null; avatar_url: string | null };
  builds?: ApkBuild[];
};

export type ApkBuild = {
  id: string;
  app_id: string;
  user_id: string;
  version_name: string;
  version_code: number;
  file_url: string;
  file_name: string;
  file_size: number;
  build_type: 'debug' | 'release';
  changelog: string;
  min_sdk: number;
  target_sdk: number;
  permissions: string[];
  download_count: number;
  sha256: string;
  created_at: string;
};

export const CATEGORIES = [
  'utility', 'game', 'productivity', 'social',
  'media', 'finance', 'education', 'other',
] as const;

// ── Apps ────────────────────────────────────────────────────────────

export async function getPublicApps(search?: string, category?: string): Promise<ApkApp[]> {
  const sb = createClient();
  let q = sb
    .from('apk_apps')
    .select(`
      *,
      author:profiles(username, display_name, avatar_url),
      builds:apk_builds(id, version_name, build_type, file_size, download_count, created_at)
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false });
  if (category && category !== 'all') q = q.eq('category', category);
  if (search) q = q.ilike('name', `%${search}%`);
  const { data } = await q;
  return (data as ApkApp[]) ?? [];
}

export async function getAppById(id: string): Promise<ApkApp | null> {
  const sb = createClient();
  const { data } = await sb
    .from('apk_apps')
    .select(`
      *,
      author:profiles(username, display_name, avatar_url),
      builds:apk_builds(*)
    `)
    .eq('id', id)
    .single();
  if (!data) return null;
  const app = data as ApkApp;
  if (app.builds) {
    app.builds = [...app.builds].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
  return app;
}

export async function getMyApps(): Promise<ApkApp[]> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return [];
  const { data } = await sb
    .from('apk_apps')
    .select(`
      *,
      builds:apk_builds(id, version_name, build_type, file_size, download_count, created_at)
    `)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });
  return (data as ApkApp[]) ?? [];
}

export async function createApp(payload: {
  name: string; slug: string; description: string;
  package_name: string; icon_url?: string;
  category: string; tags: string[]; is_public: boolean;
}): Promise<ApkApp> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await sb
    .from('apk_apps')
    .insert({ ...payload, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data as ApkApp;
}

export async function updateApp(
  id: string,
  patch: Partial<Pick<ApkApp, 'name' | 'description' | 'icon_url' | 'category' | 'tags' | 'is_public'>>
): Promise<void> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  await sb.from('apk_apps').update(patch).eq('id', id).eq('user_id', user.id);
}

export async function deleteApp(id: string): Promise<void> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  await sb.from('apk_apps').delete().eq('id', id).eq('user_id', user.id);
}

// ── Builds ──────────────────────────────────────────────────────────

export async function createBuild(payload: {
  app_id: string; version_name: string; version_code: number;
  file_url: string; file_name: string; file_size: number;
  build_type: 'debug' | 'release'; changelog: string;
  min_sdk: number; target_sdk: number; permissions: string[]; sha256: string;
}): Promise<ApkBuild> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await sb
    .from('apk_builds')
    .insert({ ...payload, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data as ApkBuild;
}

export async function deleteBuild(id: string): Promise<void> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  await sb.from('apk_builds').delete().eq('id', id).eq('user_id', user.id);
}

export async function incrementDownload(buildId: string): Promise<void> {
  const sb = createClient();
  await sb.rpc('increment_apk_download', { build_id: buildId });
}

// ── Storage ─────────────────────────────────────────────────────────

export async function uploadApkFile(
  file: File,
  userId: string,
  appSlug: string,
  versionName: string,
): Promise<{ url: string; path: string }> {
  const sb = createClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${userId}/${appSlug}/${versionName}/${Date.now()}_${safeName}`;
  const { error } = await sb.storage.from('apk-files').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: 'application/vnd.android.package-archive',
  });
  if (error) throw error;
  const { data: { publicUrl } } = sb.storage.from('apk-files').getPublicUrl(path);
  return { url: publicUrl, path };
}

export async function uploadIcon(
  file: File,
  userId: string,
  appSlug: string,
): Promise<string> {
  const sb = createClient();
  const ext = file.name.split('.').pop() ?? 'png';
  const path = `icons/${userId}/${appSlug}_${Date.now()}.${ext}`;
  const { error } = await sb.storage.from('apk-files').upload(path, file, {
    cacheControl: '86400',
    upsert: true,
  });
  if (error) throw error;
  const { data: { publicUrl } } = sb.storage.from('apk-files').getPublicUrl(path);
  return publicUrl;
}
