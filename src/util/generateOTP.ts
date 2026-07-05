/**
 * Generates a 6-digit numeric OTP (One-Time Password).
 * Range: 100000–999999 (inclusive).
 */
const generateOTP = (): number =>
  Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);

export default generateOTP;
