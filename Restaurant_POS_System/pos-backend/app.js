const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { Pool } = require("pg");
const app = express();

// Initialize PostgreSQL connection pool for serverless
let db = null;
let dbError = null;

if (process.env.DATABASE_URL) {
  try {
    db = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    db.on('error', (err) => {
      console.error('DB connection error:', err);
      db = null;
    });
    console.log("✅ Database connection pool initialized");
  } catch (error) {
    dbError = error.message;
    console.error("❌ Database initialization error:", dbError);
    db = null;
  }
} else {
  console.error("❌ DATABASE_URL not set - Database connection required!");
  db = null;
}

const config = require("./config/config");
const globalErrorHandler = require("./middlewares/globalErrorHandler");

const PORT = config.port;

// Middlewares
app.use(cors({
    credentials: true,
    origin: ['http://localhost:5173', 'https://pos-frontend-omega-ten.vercel.app', 'https://pos-frontend-7tszy1so6-softtech1.vercel.app', 'https://pos-frontend-5l6m8asbn-softtech1.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json());
app.use(cookieParser())

// Root Endpoint
app.get("/", (req,res) => {
    res.json({message : "POS Backend - Connected to Neon Database"});
})

// Health Check
app.get("/api/health", async (req, res) => {
  if (!db) {
    return res.status(503).json({ success: false, message: "Database not connected" });
  }
  try {
    await db.query('SELECT 1');
    res.json({ success: true, message: "Database connected", database: "Neon PostgreSQL" });
  } catch (e) {
    res.status(503).json({ success: false, message: "Database error: " + e.message });
  }
});

// ==================== SUPERADMIN ROUTES ====================

// SuperAdmin Login
app.post("/api/superadmin/login", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    // Query Neon database for SuperAdmin
    const result = await db.query(
      'SELECT id, name, email FROM "SuperAdmin" WHERE email = $1 AND password = $2',
      [email, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const superAdmin = result.rows[0];
    res.cookie('accessToken', 'superadmin-' + superAdmin.id, { httpOnly: true });
    res.status(200).json({
      success: true,
      message: "SuperAdmin login successful",
      data: {
        id: superAdmin.id,
        name: superAdmin.name,
        email: superAdmin.email,
        role: "SuperAdmin"
      }
    });
  } catch (error) {
    console.error("SuperAdmin login error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// SuperAdmin Register (Only if none exist)
app.post("/api/superadmin/register", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    // Check if SuperAdmin already exists
    const existing = await db.query('SELECT id FROM "SuperAdmin" LIMIT 1');
    if (existing.rows.length > 0) {
      return res.status(403).json({ success: false, message: "SuperAdmin already exists" });
    }

    // Create SuperAdmin
    const result = await db.query(
      'INSERT INTO "SuperAdmin" (name, email, password, "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id, name, email',
      [name, email, password]
    );

    res.status(201).json({
      success: true,
      message: "SuperAdmin created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("SuperAdmin register error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== SHOP ROUTES ====================

app.get("/api/shop", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const result = await db.query('SELECT * FROM "Shop" ORDER BY id DESC');
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching shops:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/shop/:id", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const result = await db.query('SELECT * FROM "Shop" WHERE id = $1', [parseInt(req.params.id)]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error fetching shop:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Register new shop
app.post("/api/shop/register", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const { name, ownerName, email, phone, address, password } = req.body;

    if (!name || !ownerName || !email || !password) {
      return res.status(400).json({ success: false, message: "All required fields must be filled" });
    }

    // Check if email exists
    const existing = await db.query('SELECT id FROM "Shop" WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // Create shop
    const result = await db.query(
      'INSERT INTO "Shop" (name, "ownerName", email, phone, address, password, status, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *',
      [name, ownerName, email, phone, address || '', password, 'pending']
    );

    res.status(201).json({
      success: true,
      message: "Shop registered successfully! Awaiting SuperAdmin approval.",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error registering shop:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Approve shop
app.put("/api/shop/:id/approve", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const shopId = parseInt(req.params.id);

    const result = await db.query(
      'UPDATE "Shop" SET status = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *',
      ['approved', shopId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    res.status(200).json({ success: true, message: "Shop approved!", data: result.rows[0] });
  } catch (error) {
    console.error("Error approving shop:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Shop Login (after approval)
app.post("/api/shop-login", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    // Query for approved shop
    const result = await db.query(
      'SELECT * FROM "Shop" WHERE email = $1 AND password = $2 AND status = $3',
      [email, password, 'approved']
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials or shop not approved" });
    }

    const shop = result.rows[0];
    res.cookie('accessToken', 'shop-' + shop.id, { httpOnly: true });
    res.status(200).json({
      success: true,
      message: "Shop login successful",
      data: {
        id: shop.id,
        name: shop.name,
        email: shop.email,
        phone: shop.phone,
        ownerName: shop.ownerName,
        role: "Admin"
      }
    });
  } catch (error) {
    console.error("Shop login error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Change shop password (SuperAdmin only)
app.put("/api/shop/:id/password", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const shopId = parseInt(req.params.id);
    const { password } = req.body;

    if (!password || password.length < 4) {
      return res.status(400).json({ success: false, message: "Password must be at least 4 characters" });
    }

    const result = await db.query(
      'UPDATE "Shop" SET password = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING id, name, email',
      [password, shopId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    res.status(200).json({ success: true, message: "Password updated successfully!", data: result.rows[0] });
  } catch (error) {
    console.error("Error updating shop password:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reject/Disapprove shop
app.put("/api/shop/:id/reject", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const shopId = parseInt(req.params.id);

    const result = await db.query(
      'UPDATE "Shop" SET status = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *',
      ['pending', shopId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    res.status(200).json({ success: true, message: "Shop disapproved!", data: result.rows[0] });
  } catch (error) {
    console.error("Error rejecting shop:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete shop
app.delete("/api/shop/:id", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const shopId = parseInt(req.params.id);

    // Delete all staff for this shop
    try {
      await db.query('DELETE FROM "User" WHERE "shopId" = $1', [shopId]);
    } catch (e) {
      console.warn("Warning deleting staff:", e.message);
    }

    // Delete the shop
    const result = await db.query('DELETE FROM "Shop" WHERE id = $1 RETURNING *', [shopId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    res.status(200).json({ success: true, message: "Shop deleted permanently!", data: result.rows[0] });
  } catch (error) {
    console.error("Error deleting shop:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== STAFF ROUTES ====================

app.get("/api/staff/shop/:shopId", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const shopId = parseInt(req.params.shopId);
    const result = await db.query('SELECT * FROM "User" WHERE "shopId" = $1 ORDER BY id DESC', [shopId]);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching staff:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/staff", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const { name, email, phone, password, role, shopId } = req.body;

    if (!name || !email || !password || !role || !shopId) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Check if email exists
    const existing = await db.query('SELECT id FROM "User" WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const result = await db.query(
      'INSERT INTO "User" (name, email, phone, password, role, "shopId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *',
      [name, email, phone, password, role, shopId]
    );

    res.status(201).json({ success: true, message: "Staff added successfully!", data: result.rows[0] });
  } catch (error) {
    console.error("Error creating staff:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put("/api/staff/:id", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const { name, email, phone, role } = req.body;
    const staffId = parseInt(req.params.id);

    const result = await db.query(
      'UPDATE "User" SET name = COALESCE($1, name), email = COALESCE($2, email), phone = COALESCE($3, phone), role = COALESCE($4, role), "updatedAt" = NOW() WHERE id = $5 RETURNING *',
      [name || null, email || null, phone || null, role || null, staffId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    res.status(200).json({ success: true, message: "Staff updated!", data: result.rows[0] });
  } catch (error) {
    console.error("Error updating staff:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete("/api/staff/:id", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const staffId = parseInt(req.params.id);

    const result = await db.query('DELETE FROM "User" WHERE id = $1 RETURNING *', [staffId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    res.status(200).json({ success: true, message: "Staff deleted!", data: result.rows[0] });
  } catch (error) {
    console.error("Error deleting staff:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== STAFF LOGIN ====================

app.post("/api/staff/login", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const { email, password, shopId } = req.body;

    if (!email || !password || !shopId) {
      return res.status(400).json({ success: false, message: "Email, password, and shop ID are required" });
    }

    const result = await db.query(
      'SELECT * FROM "User" WHERE email = $1 AND password = $2 AND "shopId" = $3',
      [email, password, parseInt(shopId)]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const staff = result.rows[0];
    res.cookie('accessToken', 'staff-' + staff.id, { httpOnly: true });
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        shopId: staff.shopId,
        _id: staff.id
      }
    });
  } catch (error) {
    console.error("Staff login error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== TABLE ROUTES ====================

app.get("/api/table", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const shopId = req.query.shopId;
    let query = 'SELECT * FROM "Table" ORDER BY id DESC';
    let values = [];

    if (shopId) {
      query = 'SELECT * FROM "Table" WHERE "shopId" = $1 ORDER BY id DESC';
      values = [parseInt(shopId)];
    }

    const result = await db.query(query, values);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching tables:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/table", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const { tableNo, seats, shopId } = req.body;

    if (!tableNo || !seats || !shopId) {
      return res.status(400).json({ success: false, message: "Table number, seats, and shop ID are required" });
    }

    const result = await db.query(
      'INSERT INTO "Table" ("tableNo", seats, "shopId", status, "currentOrder", "createdAt") VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [tableNo, seats, parseInt(shopId), 'Available', null]
    );

    res.status(201).json({ success: true, message: "Table added!", data: result.rows[0] });
  } catch (error) {
    console.error("Error creating table:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put("/api/table/:id", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const { status, orderId } = req.body;
    const tableId = parseInt(req.params.id);

    const result = await db.query(
      'UPDATE "Table" SET status = COALESCE($1, status), "currentOrder" = COALESCE($2, "currentOrder") WHERE id = $3 RETURNING *',
      [status || null, orderId || null, tableId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Table not found" });
    }

    res.status(200).json({ success: true, message: "Table updated!", data: result.rows[0] });
  } catch (error) {
    console.error("Error updating table:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete("/api/table/:id", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const tableId = parseInt(req.params.id);

    const result = await db.query('DELETE FROM "Table" WHERE id = $1 RETURNING *', [tableId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Table not found" });
    }

    res.status(200).json({ success: true, message: "Table deleted!", data: result.rows[0] });
  } catch (error) {
    console.error("Error deleting table:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ORDER ROUTES ====================

app.post("/api/order", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const { customerDetails, orderStatus, bills, items, tableId, shopId, paymentMethod, paymentData } = req.body;

    if (!shopId) {
      return res.status(400).json({ success: false, message: "Shop ID is required" });
    }

    const result = await db.query(
      'INSERT INTO "Order" ("customerDetails", "orderStatus", bills, items, "tableId", "shopId", "paymentMethod", "paymentData", "orderDate", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), NOW()) RETURNING *',
      [customerDetails || '', orderStatus || 'pending', bills || '', items || '', tableId || null, shopId, paymentMethod || '', paymentData || '']
    );

    res.status(201).json({ success: true, message: "Order created!", data: result.rows[0] });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/order", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const shopId = req.query.shopId;
    let query = 'SELECT * FROM "Order" ORDER BY "orderDate" DESC';
    let values = [];

    if (shopId) {
      query = 'SELECT * FROM "Order" WHERE "shopId" = $1 ORDER BY "orderDate" DESC';
      values = [parseInt(shopId)];
    }

    const result = await db.query(query, values);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put("/api/order/:id", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const { orderStatus } = req.body;
    const orderId = parseInt(req.params.id);

    const result = await db.query(
      'UPDATE "Order" SET "orderStatus" = COALESCE($1, "orderStatus"), "updatedAt" = NOW() WHERE id = $2 RETURNING *',
      [orderStatus || null, orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, message: "Order updated!", data: result.rows[0] });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== PRODUCT ROUTES ====================

app.get("/api/products", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const shopId = req.query.shopId;
    let query = 'SELECT * FROM "Product" ORDER BY id DESC';
    let values = [];

    if (shopId) {
      query = 'SELECT * FROM "Product" WHERE "shopId" = $1 ORDER BY id DESC';
      values = [parseInt(shopId)];
    }

    const result = await db.query(query, values);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const { name, price, category, image, shopId } = req.body;

    if (!name || !price || !shopId) {
      return res.status(400).json({ success: false, message: "Name, price, and shop ID are required" });
    }

    const result = await db.query(
      'INSERT INTO "Product" (name, price, category, image, "shopId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *',
      [name, price, category || '', image || '', parseInt(shopId)]
    );

    res.status(201).json({ success: true, message: "Product added!", data: result.rows[0] });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const { name, price, category, image } = req.body;
    const productId = parseInt(req.params.id);

    const result = await db.query(
      'UPDATE "Product" SET name = COALESCE($1, name), price = COALESCE($2, price), category = COALESCE($3, category), image = COALESCE($4, image), "updatedAt" = NOW() WHERE id = $5 RETURNING *',
      [name || null, price || null, category || null, image || null, productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, message: "Product updated!", data: result.rows[0] });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const productId = parseInt(req.params.id);
    const result = await db.query('DELETE FROM "Product" WHERE id = $1 RETURNING *', [productId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, message: "Product deleted!", data: result.rows[0] });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== CATEGORY ROUTES ====================

app.get("/api/categories", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const shopId = req.query.shopId;
    let query = 'SELECT * FROM "Category" ORDER BY id DESC';
    let values = [];

    if (shopId) {
      query = 'SELECT * FROM "Category" WHERE "shopId" = $1 ORDER BY id DESC';
      values = [parseInt(shopId)];
    }

    const result = await db.query(query, values);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/categories", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const { name, shopId } = req.body;

    if (!name || !shopId) {
      return res.status(400).json({ success: false, message: "Name and shop ID are required" });
    }

    const result = await db.query(
      'INSERT INTO "Category" (name, "shopId", "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW()) RETURNING *',
      [name, parseInt(shopId)]
    );

    res.status(201).json({ success: true, message: "Category added!", data: result.rows[0] });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put("/api/categories/:id", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const { name } = req.body;
    const categoryId = parseInt(req.params.id);

    const result = await db.query(
      'UPDATE "Category" SET name = COALESCE($1, name), "updatedAt" = NOW() WHERE id = $2 RETURNING *',
      [name || null, categoryId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, message: "Category updated!", data: result.rows[0] });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete("/api/categories/:id", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const categoryId = parseInt(req.params.id);
    const result = await db.query('DELETE FROM "Category" WHERE id = $1 RETURNING *', [categoryId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, message: "Category deleted!", data: result.rows[0] });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== EXPENSE ROUTES (Custom Table) ====================

app.get("/api/expenses", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const shopId = req.query.shopId;
    let query = 'SELECT * FROM "Expense" ORDER BY "date" DESC';
    let values = [];

    if (shopId) {
      query = 'SELECT * FROM "Expense" WHERE "shopId" = $1 ORDER BY "date" DESC';
      values = [parseInt(shopId)];
    }

    const result = await db.query(query, values);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/expenses", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const { category, description, amount, date, shopId } = req.body;

    if (!category || !amount || !shopId) {
      return res.status(400).json({ success: false, message: "Category, amount, and shop ID are required" });
    }

    const result = await db.query(
      'INSERT INTO "Expense" (category, description, amount, "date", "shopId", "createdAt") VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [category, description || '', amount, date || new Date().toISOString().split('T')[0], parseInt(shopId)]
    );

    res.status(201).json({ success: true, message: "Expense added!", data: result.rows[0] });
  } catch (error) {
    console.error("Error creating expense:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put("/api/expenses/:id", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const { category, description, amount, date } = req.body;
    const expenseId = parseInt(req.params.id);

    const result = await db.query(
      'UPDATE "Expense" SET category = COALESCE($1, category), description = COALESCE($2, description), amount = COALESCE($3, amount), "date" = COALESCE($4, "date") WHERE id = $5 RETURNING *',
      [category || null, description || null, amount || null, date || null, expenseId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    res.status(200).json({ success: true, message: "Expense updated!", data: result.rows[0] });
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete("/api/expenses/:id", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const expenseId = parseInt(req.params.id);
    const result = await db.query('DELETE FROM "Expense" WHERE id = $1 RETURNING *', [expenseId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    res.status(200).json({ success: true, message: "Expense deleted!", data: result.rows[0] });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== STOCK ROUTES ====================

app.get("/api/stock", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ success: false, message: "Database not connected" });
    const shopId = req.query.shopId;
    let query = 'SELECT * FROM "Stock" ORDER BY id DESC';
    let values = [];
    if (shopId) {
      query = 'SELECT * FROM "Stock" WHERE "shopId" = $1 ORDER BY id DESC';
      values = [parseInt(shopId)];
    }
    const result = await db.query(query, values);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching stock:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/stock", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ success: false, message: "Database not connected" });
    const { name, quantity, unit, minLevel, shopId } = req.body;
    if (!name || !shopId) {
      return res.status(400).json({ success: false, message: "Name and shop ID are required" });
    }
    const result = await db.query(
      'INSERT INTO "Stock" (name, quantity, unit, "minLevel", "shopId", "createdAt") VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [name, quantity || 0, unit || 'kg', minLevel || 0, parseInt(shopId)]
    );
    res.status(201).json({ success: true, message: "Stock item added!", data: result.rows[0] });
  } catch (error) {
    console.error("Error creating stock:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put("/api/stock/:id", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ success: false, message: "Database not connected" });
    const { name, quantity, unit, minLevel } = req.body;
    const result = await db.query(
      'UPDATE "Stock" SET name = COALESCE($1, name), quantity = COALESCE($2, quantity), unit = COALESCE($3, unit), "minLevel" = COALESCE($4, "minLevel") WHERE id = $5 RETURNING *',
      [name || null, quantity ?? null, unit || null, minLevel ?? null, parseInt(req.params.id)]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Stock item not found" });
    res.status(200).json({ success: true, message: "Stock updated!", data: result.rows[0] });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete("/api/stock/:id", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ success: false, message: "Database not connected" });
    const result = await db.query('DELETE FROM "Stock" WHERE id = $1 RETURNING *', [parseInt(req.params.id)]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Stock item not found" });
    res.status(200).json({ success: true, message: "Stock deleted!", data: result.rows[0] });
  } catch (error) {
    console.error("Error deleting stock:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== DELIVERY ROUTES ====================

app.get("/api/delivery", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ success: false, message: "Database not connected" });
    const shopId = req.query.shopId;
    let query = 'SELECT * FROM "Delivery" ORDER BY id DESC';
    let values = [];
    if (shopId) {
      query = 'SELECT * FROM "Delivery" WHERE "shopId" = $1 ORDER BY id DESC';
      values = [parseInt(shopId)];
    }
    const result = await db.query(query, values);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/delivery", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ success: false, message: "Database not connected" });
    const { customerName, phone, address, items, total, status, shopId } = req.body;
    if (!customerName || !shopId) {
      return res.status(400).json({ success: false, message: "Customer name and shop ID are required" });
    }
    const result = await db.query(
      'INSERT INTO "Delivery" ("customerName", phone, address, items, total, status, "shopId", "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *',
      [customerName, phone || '', address || '', items || 0, total || 0, status || 'Pending', parseInt(shopId)]
    );
    res.status(201).json({ success: true, message: "Delivery added!", data: result.rows[0] });
  } catch (error) {
    console.error("Error creating delivery:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put("/api/delivery/:id", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ success: false, message: "Database not connected" });
    const { customerName, phone, address, items, total, status } = req.body;
    const result = await db.query(
      'UPDATE "Delivery" SET "customerName" = COALESCE($1, "customerName"), phone = COALESCE($2, phone), address = COALESCE($3, address), items = COALESCE($4, items), total = COALESCE($5, total), status = COALESCE($6, status) WHERE id = $7 RETURNING *',
      [customerName || null, phone || null, address || null, items ?? null, total ?? null, status || null, parseInt(req.params.id)]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Delivery not found" });
    res.status(200).json({ success: true, message: "Delivery updated!", data: result.rows[0] });
  } catch (error) {
    console.error("Error updating delivery:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete("/api/delivery/:id", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ success: false, message: "Database not connected" });
    const result = await db.query('DELETE FROM "Delivery" WHERE id = $1 RETURNING *', [parseInt(req.params.id)]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Delivery not found" });
    res.status(200).json({ success: true, message: "Delivery deleted!", data: result.rows[0] });
  } catch (error) {
    console.error("Error deleting delivery:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Global Error Handler
app.use(globalErrorHandler);

// Server
app.listen(PORT, () => {
    console.log(`☑️  POS Server is listening on port ${PORT}`);
    console.log(`📊 Connected to: Neon PostgreSQL Database`);
    console.log(`🚀 No mock data - Database only mode`);
})
