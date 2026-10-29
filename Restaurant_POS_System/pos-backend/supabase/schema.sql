-- ============================================================
-- Restaurant POS - Supabase / PostgreSQL schema
-- Run this once in the Supabase SQL Editor to create all tables.
-- Covers every table the backend (app.js) queries.
-- ============================================================

CREATE TABLE IF NOT EXISTS "Shop" (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  "ownerName" TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  phone      TEXT NOT NULL,
  address    TEXT NOT NULL,
  password   TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'pending', -- pending | approved | disabled
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "SuperAdmin" (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "User" (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  phone      TEXT NOT NULL,
  password   TEXT NOT NULL,
  role       TEXT NOT NULL,          -- Admin | staff | Rider etc.
  "shopId"   INTEGER,
  salary     DOUBLE PRECISION DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Category" (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  "shopId"   INTEGER NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Product" (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  price      DOUBLE PRECISION NOT NULL,
  category   TEXT NOT NULL,
  image      TEXT,
  "shopId"   INTEGER NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Table" (
  id            SERIAL PRIMARY KEY,
  "tableNo"     INTEGER NOT NULL,
  status        TEXT NOT NULL DEFAULT 'Available',
  seats         INTEGER NOT NULL,
  "shopId"      INTEGER NOT NULL,
  "currentOrder" INTEGER,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Order" (
  id              SERIAL PRIMARY KEY,
  "customerDetails" TEXT NOT NULL,
  "orderStatus"   TEXT NOT NULL,
  "orderDate"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  bills           TEXT NOT NULL,
  items           TEXT NOT NULL,
  "tableId"       INTEGER,
  "shopId"        INTEGER NOT NULL,
  "paymentMethod" TEXT,
  "paymentData"   TEXT,
  "paymentStatus" TEXT,
  note            TEXT,
  "staffId"       INTEGER,
  "staffName"     TEXT,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Payment" (
  id         SERIAL PRIMARY KEY,
  "paymentId" TEXT NOT NULL,
  "orderId"  TEXT NOT NULL,
  amount     DOUBLE PRECISION NOT NULL,
  currency   TEXT NOT NULL,
  status     TEXT NOT NULL,
  method     TEXT NOT NULL,
  email      TEXT NOT NULL,
  contact    TEXT NOT NULL,
  "shopId"   INTEGER NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Expense" (
  id          SERIAL PRIMARY KEY,
  category    TEXT NOT NULL,
  description TEXT,
  amount      DOUBLE PRECISION NOT NULL,
  "date"      TEXT NOT NULL,
  "shopId"    INTEGER NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Customer" (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  phone      TEXT,
  email      TEXT,
  address    TEXT,
  "shopId"   INTEGER NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tables that existed only in the live DB (not in Prisma schema) --

CREATE TABLE IF NOT EXISTS "Stock" (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  quantity   DOUBLE PRECISION NOT NULL DEFAULT 0,
  unit       TEXT,
  "minLevel" DOUBLE PRECISION DEFAULT 0,
  price      DOUBLE PRECISION DEFAULT 0,
  "shopId"   INTEGER NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Delivery" (
  id             SERIAL PRIMARY KEY,
  "customerName" TEXT,
  phone          TEXT,
  address        TEXT,
  items          TEXT,
  "itemsData"    TEXT,
  total          DOUBLE PRECISION DEFAULT 0,
  status         TEXT,
  "shopId"       INTEGER NOT NULL,
  note           TEXT,
  "riderId"      INTEGER,
  "riderName"    TEXT,
  "customerId"   INTEGER,
  "paymentStatus" TEXT,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Ledger" (
  id            SERIAL PRIMARY KEY,
  "shopId"      INTEGER NOT NULL,
  "customerId"  INTEGER,
  "customerName" TEXT,
  "staffId"     INTEGER,
  type          TEXT,
  amount        DOUBLE PRECISION DEFAULT 0,
  description   TEXT,
  "orderId"     INTEGER,
  "deliveryId"  INTEGER,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
