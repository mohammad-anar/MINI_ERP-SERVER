/* eslint-disable no-undef */
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  // ─── Server ───────────────────────────────────────────
  node_env: process.env.NODE_ENV as 'development' | 'production' | 'test',
  port: process.env.PORT || '5000',
  ip_address: process.env.IP_ADDRESS || '0.0.0.0',
  client_url: process.env.CLIENT_URL || 'http://localhost:3000',

  // ─── Database ─────────────────────────────────────────
  database_url: process.env.DATABASE_URL as string,

  // ─── Security ─────────────────────────────────────────
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS || '12',

  // ─── JWT ──────────────────────────────────────────────
  jwt: {
    jwt_secret: process.env.JWT_SECRET as string,
    jwt_expire_in: process.env.JWT_EXPIRE_IN || '7d',
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET as string,
    jwt_refresh_expire_in: process.env.JWT_REFRESH_EXPIRE_IN || '30d',
  },

  // ─── Email ────────────────────────────────────────────
  email: {
    from: process.env.EMAIL_FROM as string,
    user: process.env.EMAIL_USER as string,
    pass: process.env.EMAIL_PASS as string,
    port: process.env.EMAIL_PORT || '587',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  },

  // ─── Super Admin Seed ─────────────────────────────────
  super_admin: {
    name: process.env.SUPER_ADMIN_NAME || 'SuperAdmin',
    email: process.env.SUPER_ADMIN_EMAIL as string,
    password: process.env.SUPER_ADMIN_PASSWORD as string,
  },

  // ─── Socket.IO ────────────────────────────────────────
  socket: {
    ping_timeout: Number(process.env.SOCKET_PING_TIMEOUT) || 60000,
    cors_origin: process.env.SOCKET_CORS_ORIGIN || '*',
  },
};
