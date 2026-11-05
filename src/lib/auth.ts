import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export const PRIMARY_JWT_SECRET =
  process.env.JWT_SECRET || "cafe-super-secret-qr-menu-admin-jwt-key-2026-production";

const KNOWN_SECRETS = [
  PRIMARY_JWT_SECRET,
  "cafe-super-secret-qr-menu-admin-jwt-key-2026-production",
  "cafe-super-secret-qr-menu-admin-jwt-key-2026-fallback",
  "kafe-pro-qr-menu-admin-secret-2026-secure-key",
].filter(Boolean) as string[];

const JWT_SECRET_BYTES = new TextEncoder().encode(PRIMARY_JWT_SECRET);

const COOKIE_NAME = "cafe_admin_session";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
}

// JWT Token Oluşturma
export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET_BYTES);
}

// JWT Token Doğrulama (Tüm bilinen anahtarlarla sağlam kontrol)
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  for (const secret of KNOWN_SECRETS) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
      if (payload && (payload as any).email) {
        return payload as unknown as SessionPayload;
      }
    } catch {
      // Bir sonraki anahtarı dene
    }
  }
  return null;
}

// Oturumu çerezlere kaydet
export async function setAdminSession(payload: SessionPayload) {
  const token = await signSessionToken(payload);
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 gün
  });
}

// Mevcut admin oturumunu oku
export async function getAdminSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

// Oturumu sonlandır (Çıkış yap)
export async function clearAdminSession() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Şifre hashleme ve kontrol yardımcıları
export async function hashPassword(plainText: string): Promise<string> {
  return await bcrypt.hash(plainText, 10);
}

export async function comparePassword(plainText: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(plainText, hash);
}
