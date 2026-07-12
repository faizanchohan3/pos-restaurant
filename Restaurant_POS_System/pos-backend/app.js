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

// Global Error Handler
app.use(globalErrorHandler);

// Server
app.listen(PORT, () => {
    console.log(`☑️  POS Server is listening on port ${PORT}`);
    console.log(`📊 Connected to: Neon PostgreSQL Database`);
    console.log(`🚀 No mock data - Database only mode`);
})
