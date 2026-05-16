/**
 * DevAPK Hub — Database Migration Script
 * Run: node setup-db.mjs
 *
 * Creates the apk_apps + apk_builds tables and the increment_apk_download function
 * in the same Supabase project as DevFolio.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ddlrdizdluasfpvkrddl.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbHJkaXpkbHVhc2ZwdmtyZGRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODMxMjQzMSwiZXhwIjoyMDkzODg4NDMxfQ.7GQa7pd2JvsAi7P8f7XNrLkWp8Qro1jGWo7C_-SyPeU';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Try to run SQL via an existing postgres function, then fall back to instructions
async function runSQL(sql, label) {
  console.log(`\n⏳ ${label}…`);

  // Try calling exec_sql if it was just created
  const { error } = await supabase.rpc('exec_sql', { sql });
  if (!error) {
    console.log(`✅ ${label} — done`);
    return true;
  }
  console.log(`   (rpc unavailable — ${error.message})`);
  return false;
}

async function checkTable(name) {
  const { error } = await supabase.from(name).select('id').limit(1);
  return !error || !error.message.includes('does not exist');
}

async function main() {
  console.log('\n🔌 DevAPK Hub — Database Setup');
  console.log('================================\n');

  // 1. Check which tables already exist
  const appsExists = await checkTable('apk_apps');
  const buildsExists = await checkTable('apk_builds');

  if (appsExists && buildsExists) {
    console.log('✅ apk_apps — already exists');
    console.log('✅ apk_builds — already exists');
    console.log('\n🎉 Schema is ready! Run: npm run dev\n');
    return;
  }

  console.log(`${appsExists ? '✅' : '❌'} apk_apps ${appsExists ? '(exists)' : '(missing)'}`);
  console.log(`${buildsExists ? '✅' : '❌'} apk_builds ${buildsExists ? '(exists)' : '(missing)'}`);

  // 2. Try bootstrap via rpc
  const bootstrapSQL = `
    -- Enable extension if missing
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Ensure set_updated_at trigger function exists
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
    $$ LANGUAGE plpgsql;

    -- APK Apps table
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

    -- APK Builds table
    CREATE TABLE IF NOT EXISTS apk_builds (
      id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      app_id          UUID NOT NULL REFERENCES apk_apps(id) ON DELETE CASCADE,
      user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      version_name    TEXT NOT NULL,
      version_code    INTEGER NOT NULL DEFAULT 1,
      file_url        TEXT NOT NULL,
      file_name       TEXT NOT NULL,
      file_size       BIGINT NOT NULL DEFAULT 0,
      build_type      TEXT NOT NULL DEFAULT 'release' CHECK (build_type IN ('debug','release')),
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

    -- Download counter function
    CREATE OR REPLACE FUNCTION increment_apk_download(build_id UUID)
    RETURNS void AS $$
    BEGIN
      UPDATE apk_builds SET download_count = download_count + 1 WHERE id = build_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- RLS
    ALTER TABLE apk_apps   ENABLE ROW LEVEL SECURITY;
    ALTER TABLE apk_builds ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "apk_apps_public_read"
      ON apk_apps FOR SELECT USING (is_public = true OR auth.uid() = user_id);
    CREATE POLICY "apk_apps_owner_insert"
      ON apk_apps FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "apk_apps_owner_update"
      ON apk_apps FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "apk_apps_owner_delete"
      ON apk_apps FOR DELETE USING (auth.uid() = user_id);

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
  `;

  const rpcWorked = await runSQL(bootstrapSQL, 'Creating apk_apps + apk_builds');

  if (!rpcWorked) {
    console.log('\n─────────────────────────────────────────────────────');
    console.log('📋 MANUAL STEP REQUIRED — paste this in Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/ddlrdizdluasfpvkrddl/sql/new');
    console.log('─────────────────────────────────────────────────────');
    console.log('\nCopy the contents of:');
    console.log('  apk-hub/supabase/schema.sql');
    console.log('\nPaste and click ▶ Run\n');
    console.log('─────────────────────────────────────────────────────');
    console.log('\nStorage bucket "apk-files": ✅ Already created via API');
    console.log('GitHub OAuth callback: add http://localhost:3010/api/auth/callback');
    console.log('\nAfter SQL runs → npm run dev\n');
  }
}

main().catch(console.error);