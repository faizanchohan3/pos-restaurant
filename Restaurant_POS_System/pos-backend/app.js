const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();

// Initialize Prisma with connection pooling for serverless
let prisma;
let prismaError = null;

if (process.env.DATABASE_URL) {
  try {
    const { PrismaClient } = require("@prisma/client");
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
  } catch (error) {
    prismaError = error.message;
    console.warn("Prisma initialization warning:", prismaError);
    prisma = null;
  }
} else {
  console.warn("DATABASE_URL not set - using mock data");
  prisma = null;
}

const config = require("./config/config");
const globalErrorHandler = require("./middlewares/globalErrorHandler");

const PORT = config.port;

// Middlewares
app.use(cors({
    credentials: true,
    origin: ['http://localhost:5173', 'https://pos-frontend-omega-ten.vercel.app', 'https://pos-frontend-7tszy1so6-softtech1.vercel.app']
}))
app.use(express.json());
app.use(cookieParser())

// Root Endpoint
app.get("/", (req,res) => {
    res.json({message : "Hello from POS Server!"});
})

// ==================== MOCK DATA STORE ====================
const mockShops = [
  {
    id: 1,
    name: "Main Branch",
    ownerName: "Raj Kumar",
    email: "main@restaurant.com",
    phone: "9876543211",
    address: "Downtown",
    password: "admin123",
    status: "approved",
    createdAt: new Date("2024-06-01"),
  },
];

const mockStaff = [
  {
    id: 1,
    name: "John Doe",
    email: "john@restaurant.com",
    phone: "9876543210",
    password: "staff123",
    role: "Cashier",
    shopId: 1,
    createdAt: new Date(),
  },
];

const mockUsers = [];
const mockTables = [
  { id: 1, tableNo: 1, status: "Available", seats: 4, shopId: 1 },
  { id: 2, tableNo: 2, status: "Available", seats: 4, shopId: 1 },
  { id: 3, tableNo: 3, status: "Available", seats: 6, shopId: 1 },
];
const mockOrders = [];
const mockPayments = [];

// ==================== SHOP ROUTES ====================
app.get("/api/shop", async (req, res) => {
  try {
    if (prisma) {
      const shops = await prisma.shop.findMany();
      res.status(200).json({ success: true, data: shops });
    } else {
      // Fallback to mock data if Prisma not available
      res.status(200).json({ success: true, data: mockShops });
    }
  } catch (error) {
    console.error("Error fetching shops:", error);
    // Fallback to mock data on error
    res.status(200).json({ success: true, data: mockShops });
  }
});

app.get("/api/shop/:id", async (req, res) => {
  try {
    let shop;
    if (prisma) {
      shop = await prisma.shop.findUnique({
        where: { id: parseInt(req.params.id) }
      });
    } else {
      // Fallback to mock data
      shop = mockShops.find(s => s.id === parseInt(req.params.id));
    }

    if (shop) {
      res.status(200).json({ success: true, data: shop });
    } else {
      res.status(404).json({ success: false, message: "Shop not found" });
    }
  } catch (error) {
    console.error("Error fetching shop:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Register new shop
app.post("/api/shop/register", async (req, res) => {
  try {
    const { name, ownerName, email, phone, address, password } = req.body;

    if (!name || !ownerName || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    let existingShop;
    let newShop;

    if (prisma) {
      // Check if email already exists
      existingShop = await prisma.shop.findUnique({
        where: { email }
      });

      if (existingShop) {
        return res.status(400).json({ success: false, message: "Email already registered" });
      }

      // Create new shop with pending status
      newShop = await prisma.shop.create({
        data: {
          name,
          ownerName,
          email,
          phone,
          address,
          password,
          status: "pending"
        }
      });
    } else {
      // Fallback to mock data
      existingShop = mockShops.find(s => s.email === email);
      if (existingShop) {
        return res.status(400).json({ success: false, message: "Email already registered" });
      }

      newShop = {
        id: Math.max(...mockShops.map(s => s.id), 0) + 1,
        name,
        ownerName,
        email,
        phone,
        address,
        password,
        status: "pending",
        createdAt: new Date().toISOString()
      };
      mockShops.push(newShop);
    }

    res.status(201).json({ success: true, message: "Shop registered successfully!", data: newShop });
  } catch (error) {
    console.error("Error registering shop:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Approve shop
app.put("/api/shop/:id/approve", async (req, res) => {
  try {
    const shopId = parseInt(req.params.id);
    let shop;

    if (prisma) {
      shop = await prisma.shop.update({
        where: { id: shopId },
        data: { status: "approved" }
      });
    } else {
      // Fallback to mock data
      shop = mockShops.find(s => s.id === shopId);
      if (shop) {
        shop.status = "approved";
      } else {
        return res.status(404).json({ success: false, message: "Shop not found" });
      }
    }

    res.status(200).json({ success: true, message: "Shop approved!", data: shop });
  } catch (error) {
    console.error("Error approving shop:", error);
    res.status(404).json({ success: false, message: "Shop not found" });
  }
});

// Reject/Disapprove shop
app.put("/api/shop/:id/reject", async (req, res) => {
  try {
    const shopId = parseInt(req.params.id);
    let shop;

    if (prisma) {
      shop = await prisma.shop.update({
        where: { id: shopId },
        data: { status: "pending" }
      });
    } else {
      // Fallback to mock data
      shop = mockShops.find(s => s.id === shopId);
      if (shop) {
        shop.status = "pending";
      } else {
        return res.status(404).json({ success: false, message: "Shop not found" });
      }
    }

    res.status(200).json({ success: true, message: "Shop disapproved!", data: shop });
  } catch (error) {
    console.error("Error rejecting shop:", error);
    res.status(404).json({ success: false, message: "Shop not found" });
  }
});

// Delete shop
app.delete("/api/shop/:id", async (req, res) => {
  try {
    const shopId = parseInt(req.params.id);
    let deletedShop;

    if (prisma) {
      // Delete all staff for this shop first
      try {
        await prisma.$executeRawUnsafe(
          `DELETE FROM "User" WHERE role = 'staff' AND email LIKE $1`,
          [`%${shopId}%`]
        );
      } catch (e) {
        // Ignore raw query errors
      }

      deletedShop = await prisma.shop.delete({
        where: { id: shopId }
      });
    } else {
      // Fallback to mock data
      const index = mockShops.findIndex(s => s.id === shopId);
      if (index === -1) {
        return res.status(404).json({ success: false, message: "Shop not found" });
      }
      deletedShop = mockShops.splice(index, 1)[0];
    }

    res.status(200).json({ success: true, message: "Shop deleted!", data: deletedShop });
  } catch (error) {
    console.error("Error deleting shop:", error);
    res.status(404).json({ success: false, message: "Shop not found" });
  }
});

// ==================== STAFF ROUTES ====================
// Get all staff for a shop
app.get("/api/staff/shop/:shopId", (req, res) => {
  const shopId = parseInt(req.params.shopId);
  const staff = mockStaff.filter(s => s.shopId === shopId);
  res.status(200).json({ success: true, data: staff });
});

// Add new staff to shop
app.post("/api/staff", (req, res) => {
  const { name, email, phone, password, role, shopId } = req.body;

  if (!name || !email || !password || !role || !shopId) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  // Check if email already exists
  if (mockStaff.find(s => s.email === email)) {
    return res.status(400).json({ success: false, message: "Email already exists" });
  }

  const newStaff = {
    id: mockStaff.length + 1,
    name,
    email,
    phone,
    password,
    role,
    shopId,
    createdAt: new Date(),
  };

  mockStaff.push(newStaff);
  res.status(201).json({ success: true, message: "Staff added successfully!", data: newStaff });
});

// Update staff
app.put("/api/staff/:id", (req, res) => {
  const { name, email, phone, role } = req.body;
  const staff = mockStaff.find(s => s.id === parseInt(req.params.id));

  if (!staff) {
    return res.status(404).json({ success: false, message: "Staff not found" });
  }

  if (name) staff.name = name;
  if (email) staff.email = email;
  if (phone) staff.phone = phone;
  if (role) staff.role = role;

  res.status(200).json({ success: true, message: "Staff updated!", data: staff });
});

// Delete staff
app.delete("/api/staff/:id", (req, res) => {
  const index = mockStaff.findIndex(s => s.id === parseInt(req.params.id));

  if (index === -1) {
    return res.status(404).json({ success: false, message: "Staff not found" });
  }

  const deletedStaff = mockStaff.splice(index, 1);
  res.status(200).json({ success: true, message: "Staff deleted!", data: deletedStaff[0] });
});

// ==================== USER/STAFF LOGIN ROUTES ====================
app.post("/api/user/register", (req, res) => {
  const { name, phone, email, password, role } = req.body;
  const user = { id: mockUsers.length + 1, name, phone, email, password, role, createdAt: new Date(), updatedAt: new Date() };
  mockUsers.push(user);
  res.status(201).json({ success: true, message: "New user created!", data: user });
});

// Staff login
app.post("/api/staff/login", (req, res) => {
  const { email, password, shopId } = req.body;

  if (!email || !password || !shopId) {
    return res.status(400).json({ success: false, message: "Email, password, and shop ID are required" });
  }

  const staff = mockStaff.find(s => s.email === email && s.shopId === parseInt(shopId));

  if (!staff || staff.password !== password) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  res.cookie('accessToken', 'mock-staff-token-' + staff.id, { httpOnly: true });
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
});

app.post("/api/user/login", (req, res) => {
  const { email, password } = req.body;
  const user = mockUsers.find(u => u.email === email);
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }
  res.cookie('accessToken', 'mock-token', { httpOnly: true });
  res.status(200).json({ success: true, message: "Login successful", data: user });
});

app.get("/api/user", (req, res) => {
  res.status(200).json({ success: true, data: { id: 1, name: "Test User", role: "admin" } });
});

app.post("/api/user/logout", (req, res) => {
  res.clearCookie('accessToken');
  res.status(200).json({ success: true, message: "Logout successful" });
});

// Table Routes
app.post("/api/table", (req, res) => {
  const { tableNo, seats } = req.body;
  if (!tableNo || !seats) {
    return res.status(400).json({ success: false, message: "Table number and seats are required" });
  }
  const table = { id: mockTables.length + 1, tableNo, seats, status: "Available", currentOrder: null };
  mockTables.push(table);
  res.status(201).json({ success: true, message: "Table added!", data: table });
});

app.post("/api/table/", (req, res) => {
  const { tableNo, seats } = req.body;
  if (!tableNo || !seats) {
    return res.status(400).json({ success: false, message: "Table number and seats are required" });
  }
  const table = { id: mockTables.length + 1, tableNo, seats, status: "Available", currentOrder: null };
  mockTables.push(table);
  res.status(201).json({ success: true, message: "Table added!", data: table });
});

app.get("/api/table", (req, res) => {
  res.status(200).json({ success: true, data: mockTables });
});

app.put("/api/table/:id", (req, res) => {
  const { status, orderId } = req.body;
  const table = mockTables.find(t => t.id === parseInt(req.params.id));
  if (table) {
    if (status) table.status = status;
    if (orderId !== undefined) table.currentOrder = orderId;
    res.status(200).json({ success: true, message: "Table updated!", data: table });
  } else {
    res.status(404).json({ success: false, message: "Table not found" });
  }
});

// Order Routes
app.post("/api/order", (req, res) => {
  const order = { id: mockOrders.length + 1, ...req.body, createdAt: new Date(), updatedAt: new Date() };
  mockOrders.push(order);
  res.status(201).json({ success: true, message: "Order created!", data: order });
});

app.post("/api/order/", (req, res) => {
  const order = { id: mockOrders.length + 1, ...req.body, createdAt: new Date(), updatedAt: new Date() };
  mockOrders.push(order);
  res.status(201).json({ success: true, message: "Order created!", data: order });
});

app.get("/api/order", (req, res) => {
  res.status(200).json({ success: true, data: mockOrders });
});

app.get("/api/order/:id", (req, res) => {
  const order = mockOrders.find(o => o.id === parseInt(req.params.id));
  if (order) {
    res.status(200).json({ success: true, data: order });
  } else {
    res.status(404).json({ success: false, message: "Order not found" });
  }
});

app.put("/api/order/:id", (req, res) => {
  const { orderStatus } = req.body;
  const order = mockOrders.find(o => o.id === parseInt(req.params.id));
  if (order) {
    if (orderStatus) order.orderStatus = orderStatus;
    order.updatedAt = new Date();
    res.status(200).json({ success: true, message: "Order updated", data: order });
  } else {
    res.status(404).json({ success: false, message: "Order not found" });
  }
});

// Payment Routes
app.post("/api/payment/create-order", (req, res) => {
  res.status(200).json({ success: true, order: { id: "mock_order_" + Date.now() } });
});

app.post("/api/payment/verify", (req, res) => {
  res.json({ success: true, message: "Payment verified successfully!" });
});

app.post("/api/payment/webhook", (req, res) => {
  res.json({ success: true });
});

// Global Error Handler
app.use(globalErrorHandler);

// Server
app.listen(PORT, () => {
    console.log(`☑️  POS Server is listening on port ${PORT}`);
})
