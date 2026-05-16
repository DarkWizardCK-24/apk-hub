-- ============================================================
-- DevAPK Hub — Supabase Schema
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- IMPORTANT: Run DevFolio schema.sql first (creates profiles table + set_updated_at trigger)
-- ============================================================

-- ============================================================
-- APK APPS (one record per app/project)
-- ============================================================
CREATE TABLE IF NOT EXISTS apk_apps (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL,
  description     TEXT DEFAULT '',
  package_name    TEXT NOT NULL DEFAULT '',
  icon_url        TEXT,
  category        TEXT NOT NULL DEFAULT 'other'
                    CHECK (category IN ('utility','game','productivity','social','media','finance','education','other')),
  tags            TEXT[] DEFAULT '{}',
  is_public       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, slug)
);

CREATE TRIGGER trg_apk_apps_updated_at
  BEFORE UPDATE ON apk_apps
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_apk_apps_user     ON apk_apps(user_id);
CREATE INDEX IF NOT EXISTS idx_apk_apps_public   ON apk_apps(is_public, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_apk_apps_category ON apk_apps(category, is_public);

-- ============================================================
-- APK BUILDS (one record per uploaded .apk file / version)
-- ============================================================
CREATE TABLE IF NOT EXISTS apk_builds (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id          UUID NOT NULL REFERENCES apk_apps(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  version_name    TEXT NOT NULL,
  version_code    INTEGER NOT NULL DEFAULT 1,
  file_url        TEXT NOT NULL,
  file_name       TEXT NOT NULL,
  file_size       BIGINT NOT NULL DEFAULT 0,
  build_type      TEXT NOT NULL DEFAULT 'release'
                    CHECK (build_type IN ('debug','release')),
  changelog       TEXT DEFAULT '',
  min_sdk         INTEGER DEFAULT 21,
  target_sdk      INTEGER DEFAULT 34,
  permissions     TEXT[] DEFAULT '{}',
  download_count  INTEGER NOT NULL DEFAULT 0,
  sha256          TEXT DEFAULT '',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_apk_builds_app  ON apk_builds(app_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_apk_builds_user ON apk_builds(user_id);

-- ============================================================
-- DOWNLOAD COUNT INCREMENT (safe atomic update)
-- ============================================================
CREATE OR REPLACE FUNCTION increment_apk_download(build_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE apk_builds SET download_count = download_count + 1 WHERE id = build_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE apk_apps   ENABLE ROW LEVEL SECURITY;
ALTER TABLE apk_builds ENABLE ROW LEVEL SECURITY;

-- APK APPS: public can read public apps; owners manage all their apps
CREATE POLICY "apk_apps_public_read"
  ON apk_apps FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "apk_apps_owner_insert"
  ON apk_apps FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "apk_apps_owner_update"
  ON apk_apps FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "apk_apps_owner_delete"
  ON apk_apps FOR DELETE USING (auth.uid() = user_id);

-- APK BUILDS: readable if the parent app is public or user owns it
CREATE POLICY "apk_builds_public_read"
  ON apk_builds FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM apk_apps
    WHERE id = apk_builds.app_id AND (is_public = true OR user_id = auth.uid())
  ));

CREATE POLICY "apk_builds_owner_insert"
  ON apk_builds FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "apk_builds_owner_delete"
  ON apk_builds FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKET (run once in Supabase Dashboard → Storage)
-- ============================================================
-- Create a PUBLIC bucket named "apk-files" with:
--   - Max file size: 100 MB
--   - Allowed MIME types: application/vnd.android.package-archive, image/*
--
-- Or run via SQL:
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES ('apk-files', 'apk-files', true, 104857600,
--   ARRAY['application/vnd.android.package-archive','image/png','image/jpeg','image/webp'])
-- ON CONFLICT (id) DO NOTHING;

-- Storage RLS (already applied to storage.objects by Supabase, but this locks it down):
-- Public read all objects in apk-files bucket
-- Authenticated users can upload to their own folder: {user_id}/...
-- Owners can delete their own objects
