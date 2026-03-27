import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { signAdminToken, COOKIE_NAME, MAX_AGE } from '@/lib/admin-auth';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(1).max(60),
  password: z.string().min(1).max(128),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
  }

  const { username, password } = parsed.data;
  const supabase = createServerSupabaseClient();

  const { data: admin, error } = await supabase
    .from('admin_users')
    .select('id, password_hash')
    .eq('username', username)
    .single();

  // Constant-time failure to prevent username enumeration
  const dummyHash = '';
  const hashToCheck = admin?.password_hash ?? dummyHash;
  const valid = await bcrypt.compare(password, hashToCheck);

  if (error || !admin || !valid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = await signAdminToken(admin.id);
  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  });
  return res;
}
