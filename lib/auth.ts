import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'zelix-super-secret-jwt-key-change-in-prod'
);

const SESSION_COOKIE = 'zelix_session';

export type SessionPayload = {
  id: string;
  email: string;
  role: string;
  expiresAt: Date;
};

export async function createSession(payload: Omit<SessionPayload, 'expiresAt'>) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const sessionPayload: SessionPayload = { ...payload, expiresAt };

  const session = await new SignJWT(sessionPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  cookies().set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const session = cookies().get(SESSION_COOKIE)?.value;

  if (!session) return null;

  try {
    const { payload } = await jwtVerify(session, JWT_SECRET, {
      algorithms: ['HS256'],
    });

    return payload as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function clearSession() {
  cookies().delete(SESSION_COOKIE);
}
