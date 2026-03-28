import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { verifyAdminToken, COOKIE_NAME } from '@/lib/admin-auth';

const ALLOWED_KEYS = new Set(['bank_name', 'bank_account', 'account_holder', 'qr_url']);

export async function GET() {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from('site_settings').select('key, value');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const settings: Record<string, string> = {};
  for (const row of data ?? []) settings[row.key] = row.value;
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await verifyAdminToken(token);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const updates = Object.entries(body as Record<string, string>)
    .filter(([k]) => ALLOWED_KEYS.has(k))
    .map(([key, value]) => ({ key, value: String(value) }));

  if (updates.length === 0) {
    return NextResponse.json({ error: 'No valid keys provided' }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from('site_settings')
    .upsert(updates, { onConflict: 'key' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
