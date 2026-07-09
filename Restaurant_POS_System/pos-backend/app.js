const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();

const config = require("./config/config");
const globalErrorHandler = require("./middlewares/globalErrorHandler");

const PORT = config.port;

// Middlewares
app.use(cors({
    credentials: true,
    origin: ['http://localhost:5173']
}))
app.use(express.json());
app.use(cookieParser())

// Root Endpoint
app.get("/", (req,res) => {
    res.json({message : "Hello from POS Server!"});
})

// Mock Routes (in-memory data for now)
const mockUsers = [];
const mockTables = [
  { id: 1, tableNo: 1, status: "Available", seats: 4 },
  { id: 2, tableNo: 2, status: "Available", seats: 4 },
  { id: 3, tableNo: 3, status: "Available", seats: 6 },
];
const mockOrders = [];
const mockPayments = [];

// User Routes
app.post("/api/user/register", (req, res) => {
  const { name, phone, email, password, role } = req.body;
  const user = { id: mockUsers.length + 1, name, phone, email, password, role, createdAt: new Date(), updatedAt: new Date() };
  mockUsers.push(user);
  res.status(201).json({ success: true, message: "New user created!", data: user });
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
