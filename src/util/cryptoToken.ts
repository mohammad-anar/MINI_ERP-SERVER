import crypto from 'crypto';

/**
 * Generates a cryptographically secure random hex token.
 * Default length: 32 bytes → 64-character hex string.
 * Used for password reset tokens, email verification links, etc.
 */
const cryptoToken = (bytes = 32): string =>
  crypto.randomBytes(bytes).toString('hex');

export default cryptoToken;
