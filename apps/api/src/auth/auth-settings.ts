export interface AuthSettings {
  secret: string;
  expiresIn: number;
  issuer: string;
  audience: string;
}

export const AUTH_SETTINGS = Symbol('AUTH_SETTINGS');

export function readAuthSettings(
  env: Record<string, string | undefined>,
): AuthSettings {
  const secret = env.JWT_SECRET;
  if (!secret || new TextEncoder().encode(secret).length < 32) {
    throw new Error('JWT_SECRET debe contener al menos 32 bytes aleatorios.');
  }
  const raw = env.JWT_EXPIRES_IN ?? '900';
  const expiresIn = Number(raw);
  return {
    secret,
    expiresIn,
    issuer: 'taller-ordenes-api',
    audience: 'taller-ordenes-web',
  };
}