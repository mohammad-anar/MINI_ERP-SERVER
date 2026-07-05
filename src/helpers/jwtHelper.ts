import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';
import config from '../config';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type TokenPayload = {
  id: string;
  role: string;
  email: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Core functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Signs a JWT with the given payload, secret, and expiration.
 */
const createToken = (
  payload: object,
  secret: Secret,
  expiresIn: SignOptions['expiresIn']
): string => jwt.sign(payload, secret, { expiresIn });

/**
 * Verifies and decodes a JWT. Throws if invalid or expired.
 */
const verifyToken = (token: string, secret: Secret): JwtPayload =>
  jwt.verify(token, secret) as JwtPayload;

// ─────────────────────────────────────────────────────────────────────────────
// Convenience wrappers (use config directly)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a short-lived access token using the default JWT config.
 */
const createAccessToken = (payload: TokenPayload): string =>
  createToken(
    payload,
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as SignOptions['expiresIn']
  );

/**
 * Creates a long-lived refresh token using the refresh JWT config.
 */
const createRefreshToken = (payload: TokenPayload): string =>
  createToken(
    payload,
    config.jwt.jwt_refresh_secret as Secret,
    config.jwt.jwt_refresh_expire_in as SignOptions['expiresIn']
  );

/**
 * Verifies an access token using the default JWT secret.
 */
const verifyAccessToken = (token: string): JwtPayload =>
  verifyToken(token, config.jwt.jwt_secret as Secret);

/**
 * Verifies a refresh token using the refresh secret.
 */
const verifyRefreshToken = (token: string): JwtPayload =>
  verifyToken(token, config.jwt.jwt_refresh_secret as Secret);

/**
 * Extracts the raw token string from an `Authorization: Bearer <token>` header.
 * Returns `null` if the header is missing or malformed.
 */
const extractBearerToken = (authHeader: string | undefined): string | null => {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  return token || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export const jwtHelper = {
  createToken,
  verifyToken,
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  extractBearerToken,
};
