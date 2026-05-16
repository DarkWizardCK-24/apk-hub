import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

// Receives the handoff ticket from DevFolio after cross-app auth,
// exchanges it for real Supabase session tokens, and sets the session.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const ticket = searchParams.get('ticket');
  const state = searchParams.get('state') ?? '/dashboard';
  const redirectPath = state.startsWith('/') ? state : `/${state}`;

  if (!ticket) {
    return NextResponse.redirect(`${origin}/login?error=missing_ticket`);
  }

  const devfolioUrl = process.env.NEXT_PUBLIC_DEVFOLIO_URL || 'http://localhost:3000';

  let tokens: { access_token: string; refresh_token: string } | null = null;
  try {
    const res = await fetch(`${devfolioUrl}/api/cross-app/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ ticket }),
    });

    if (res.ok) {
      tokens = await res.json();
    }
  } catch {
    // DevFolio unreachable
  }

  if (!tokens?.access_token || !tokens?.refresh_token) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  const cookieStore = await cookies();
  const pending: { name: string; value: string; options: CookieOptions }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          pending.push(...cookiesToSet);
        },
      },
    },
  );

  const { error } = await supabase.auth.setSession({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  });

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=session_failed`);
  }

  const response = NextResponse.redirect(`${origin}${redirectPath}`);
  pending.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  return response;
}
