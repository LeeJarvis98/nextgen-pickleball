import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!);
const COOKIE_NAME = 'admin_session';
const MAX_AGE = 60 * 60 * 8; // 8 hours

export async function signAdminToken(adminId: string): Promise<string> {
  return new SignJWT({ sub: adminId, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(JWT_SECRET);
}

export async function verifyAdminToken(token: string) {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload;
}

export { COOKIE_NAME, MAX_AGE };
