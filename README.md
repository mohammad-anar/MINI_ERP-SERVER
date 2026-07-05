# 🚀 Mongoose Template — Production-Ready Node.js Backend

A professional, feature-rich Node.js + Express + TypeScript + MongoDB backend template with JWT authentication, Socket.IO, modular architecture, and a generic query builder.

---

## ✨ Features

| Category | Implementation |
|---|---|
| **Auth** | JWT access + refresh tokens, OTP email verification, password reset |
| **Roles** | `SUPER_ADMIN`, `ADMIN`, `USER` — database-driven |
| **Validation** | Zod schema validation with reusable field builders |
| **Error Handling** | Global error handler covering 8+ error types |
| **Real-time** | Socket.IO with per-user multi-tab tracking and admin room |
| **Notifications** | Persist-then-emit pattern (DB + Socket.IO) |
| **Query Builder** | Generic search, filter, sort, paginate, field selection |
| **Email** | Nodemailer with modern dark-themed HTML templates |
| **Logging** | Winston daily-rotate with separate success/error log files |
| **File Upload** | Multer with image processing (Jimp) |

---

## 📋 Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 18.x |
| MongoDB | ≥ 6.x |
| npm / bun | Latest |

---

## ⚡ Quick Start

### 1. Clone the repository

```bash
git clone <repo-url>
cd mongoose-template
```

### 2. Install dependencies

```bash
npm install
# or
bun install
```

### 3. Configure environment

```bash
cp .demo.env .env
```

Edit `.env` with your actual values (see [Environment Variables](#-environment-variables) below).

### 4. Start the development server

```bash
npm run dev
```

The server will:
1. Connect to MongoDB
2. **Seed the Super Admin account** (idempotent — only runs once)
3. Start listening on the configured port
4. Initialise Socket.IO

---

## 🔐 Default Super Admin Credentials

> ⚠️ Change these in production via your `.env` file.

| Field | Value |
|---|---|
| Email | `admin@gmail.com` |
| Password | `12345678` |
| Name | `SuperAdmin` |
| Role | `SUPER_ADMIN` |

---

## 🌍 Environment Variables

Copy `.demo.env` → `.env` and fill in all values.

```bash
cp .demo.env .env
```

| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | Runtime environment | `development` |
| `PORT` | HTTP server port | `5000` |
| `IP_ADDRESS` | Bind address | `0.0.0.0` |
| `CLIENT_URL` | Frontend origin (for CORS) | `http://localhost:3000` |
| `DATABASE_URL` | MongoDB connection string | — |
| `BCRYPT_SALT_ROUNDS` | Password hashing rounds | `12` |
| `JWT_SECRET` | Access token secret | — |
| `JWT_EXPIRE_IN` | Access token TTL | `7d` |
| `JWT_REFRESH_SECRET` | Refresh token secret | — |
| `JWT_REFRESH_EXPIRE_IN` | Refresh token TTL | `30d` |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | SMTP username / email | — |
| `EMAIL_PASS` | SMTP app password | — |
| `EMAIL_FROM` | Sender address | — |
| `SUPER_ADMIN_NAME` | Seed admin display name | `SuperAdmin` |
| `SUPER_ADMIN_EMAIL` | Seed admin email | `admin@gmail.com` |
| `SUPER_ADMIN_PASSWORD` | Seed admin password | `12345678` |
| `SOCKET_PING_TIMEOUT` | Socket.IO ping timeout (ms) | `60000` |
| `SOCKET_CORS_ORIGIN` | Socket.IO CORS origin | `*` |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── builder/
│   │   └── QueryBuilder.ts          # Generic search/filter/sort/paginate
│   ├── middlewares/
│   │   ├── auth.ts                  # JWT role-guard middleware
│   │   ├── globalErrorHandler.ts    # Centralised error handler
│   │   ├── validateRequest.ts       # Zod validation middleware
│   │   └── fileUploadHandler.ts     # Multer + Jimp
│   └── modules/
│       ├── auth/                    # Login, OTP, password reset
│       ├── user/                    # User CRUD
│       └── notification/            # Notification model + interface
│
├── config/
│   └── index.ts                     # All env vars — single source of truth
│
├── DB/
│   └── seedAdmin.ts                 # Super Admin seed function
│
├── enums/
│   └── user.ts                      # USER_ROLES enum
│
├── errors/
│   ├── ApiError.ts                  # Custom operational error class
│   ├── handleCastError.ts           # MongoDB ObjectId cast errors
│   ├── handleDuplicateError.ts      # MongoDB 11000 duplicate key
│   ├── handleValidationError.ts     # Mongoose schema validation
│   └── handleZodError.ts            # Zod validation issues
│
├── helpers/
│   ├── emailHelper.ts               # Nodemailer transporter + send utility
│   ├── jwtHelper.ts                 # JWT sign/verify + refresh token support
│   ├── notificationHelper.ts        # Persist + emit notifications
│   ├── paginationHelper.ts          # Pagination calculator + meta builder
│   └── socketHelper.ts              # Socket.IO — init, rooms, emission helpers
│
├── shared/
│   ├── catchAsync.ts                # Async error wrapper for controllers
│   ├── emailTemplate.ts             # HTML email templates
│   ├── logger.ts                    # Winston loggers
│   ├── morgen.ts                    # Morgan HTTP request logger
│   ├── pick.ts                      # Type-safe object key picker
│   ├── sendResponse.ts              # Standardised JSON response
│   └── zodValidators.ts             # Reusable Zod field builders & wrappers
│
├── types/                           # Shared TypeScript types
├── util/
│   ├── cryptoToken.ts               # Random hex token generator
│   └── generateOTP.ts               # 6-digit OTP generator
│
├── routes/index.ts                  # Central route registry
├── app.ts                           # Express app setup
└── server.ts                        # Bootstrap: DB → seed → listen → socket
```

---

## 🛣️ API Reference

### Auth  (`/api/v1/auth`)

| Method | Endpoint | Body | Auth |
|---|---|---|---|
| `POST` | `/login` | `{ email, password }` | ❌ |
| `POST` | `/verify-email` | `{ email, oneTimeCode }` | ❌ |
| `POST` | `/forgot-password` | `{ email }` | ❌ |
| `POST` | `/reset-password?token=` | `{ newPassword, confirmPassword }` | ❌ |
| `PATCH` | `/change-password` | `{ currentPassword, newPassword, confirmPassword }` | ✅ |

### User  (`/api/v1/user`)

| Method | Endpoint | Auth | Roles |
|---|---|---|---|
| `GET` | `/profile` | ✅ | Any |
| `PATCH` | `/profile` | ✅ | Any |
| `GET` | `/` | ✅ | ADMIN, SUPER_ADMIN |

---

## ⚡ Socket.IO Events

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `register` | `{ userId: string, role: string }` | Register user; admins auto-join `admin` room |
| `join_room` | `roomName: string` | Join an arbitrary named room |
| `leave_room` | `roomName: string` | Leave a named room |

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `notification` | `{ _id, type, title, message, isRead, ... }` | Real-time notification delivery |

### Admin Room Events (emitted via `notificationHelper.notifyAdmins`)

| Event | Description |
|---|---|
| `NEW_SALE` | Broadcast sale data to all connected admins |
| `ADMIN_ALERT` | Generic admin alert |

---

## 🛠️ Reusable Utilities

### Zod Validators (`src/shared/zodValidators.ts`)

```typescript
import { zodEmail, zodPassword, zodObjectId, withBody } from '../shared/zodValidators';

// Use in a module validation file:
const createOrderSchema = withBody({
  productId: zodObjectId('Product ID'),
  email: zodEmail(),
  quantity: zodPositiveInt('Quantity'),
});
```

| Export | Purpose |
|---|---|
| `zodString(label)` | Trimmed, non-empty string |
| `zodEmail()` | Validated, lowercased email |
| `zodPassword(min?)` | Min-length password (default: 8) |
| `zodPhone()` | E.164 phone number |
| `zodObjectId(label?)` | 24-char hex MongoDB ObjectId |
| `zodOTP()` | 6-digit number |
| `zodEnum(values)` | Typed enum from array |
| `zodPositiveInt()` | Positive integer |
| `withBody(shape)` | Wraps in `{ body: z.object(shape) }` |
| `withParams(shape)` | Wraps in `{ params: z.object(shape) }` |
| `withQuery(shape)` | Wraps in `{ query: z.object(shape) }` |
| `withRequest({ body, params, query })` | Combined wrapper |
| `passwordMatch()` | Superrefine for password equality |

### Query Builder (`src/app/builder/QueryBuilder.ts`)

```typescript
const result = new QueryBuilder(Model.find(), req.query)
  .search(['name', 'email'])
  .filter()
  .sort()
  .paginate()
  .fields();

const data = await result.modelQuery;
const meta = await result.getPaginationInfo();
```

### Notification Helper

```typescript
// Send to a specific user (persisted + real-time)
await notificationHelper.send({
  userId: user._id,
  type: 'SALE',
  title: 'New Sale Created',
  message: `Sale #${sale.id} — $${sale.total}`,
  relatedId: sale._id,
  relatedType: 'Sale',
  meta: { amount: sale.total },
});

// Broadcast to all admins (Socket.IO only, not persisted)
notificationHelper.notifyAdmins('NEW_SALE', { saleId: sale._id });
```

---

## 🚨 Error Response Shape

All errors return a consistent JSON structure:

```json
{
  "success": false,
  "statusCode": 422,
  "message": "Validation Error",
  "errorType": "ZodValidationError",
  "errorMessages": [
    { "path": "email", "message": "Please enter a valid email address" }
  ],
  "stack": "..." 
}
```

> `stack` is only included in `development` mode.

### Handled Error Types

| `errorType` | HTTP Status | Trigger |
|---|---|---|
| `ZodValidationError` | 422 | Zod schema failure |
| `MongooseValidationError` | 400 | Mongoose schema failure |
| `CastError` | 400 | Invalid MongoDB ObjectId |
| `DuplicateKeyError` | 409 | Unique index violation |
| `TokenExpiredError` | 401 | JWT expired |
| `JsonWebTokenError` | 401 | Invalid JWT |
| `SyntaxError` | 400 | Malformed JSON body |
| `ApiError` | varies | Thrown by services |
| `Error` | 500 | Unexpected error |

---

## 🧪 Scripts

```bash
npm run dev          # Start with ts-node-dev (hot reload)
npm run lint:check   # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run prettier:fix # Prettier format
```

---

## 📜 License

ISC
