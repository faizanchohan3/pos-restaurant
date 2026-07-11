import { axiosWrapper } from "./axiosWrapper";

// API Endpoints

// Auth Endpoints
export const login = (data) => axiosWrapper.post("/api/user/login", data);
export const register = (data) => axiosWrapper.post("/api/user/register", data);
export const getUserData = () => axiosWrapper.get("/api/user");
export const logout = () => axiosWrapper.post("/api/user/logout");

// Table Endpoints
export const addTable = (data) => axiosWrapper.post("/api/table/", data);
export const getTables = () => axiosWrapper.get("/api/table");
export const updateTable = ({ tableId, ...tableData }) =>
  axiosWrapper.put(`/api/table/${tableId}`, tableData);

// Payment Endpoints
export const createOrderRazorpay = (data) =>
  axiosWrapper.post("/api/payment/create-order", data);
export const verifyPaymentRazorpay = (data) =>
  axiosWrapper.post("/api/payment//verify-payment", data);

// Order Endpoints
export const addOrder = (data) => axiosWrapper.post("/api/order/", data);
export const getOrders = () => axiosWrapper.get("/api/order");
export const updateOrderStatus = ({ orderId, orderStatus }) =>
  axiosWrapper.put(`/api/order/${orderId}`, { orderStatus });

// Staff Endpoints
export const createStaff = (data) => axiosWrapper.post("/api/staff", data);
export const getStaffByShop = (shopId) => axiosWrapper.get(`/api/staff/shop/${shopId}`);
export const updateStaff = ({ staffId, ...data }) => axiosWrapper.put(`/api/staff/${staffId}`, data);
export const deleteStaff = (staffId) => axiosWrapper.delete(`/api/staff/${staffId}`);

// Shop Management Endpoints
export const createShop = (data) => axiosWrapper.post("/api/shop/register", data);
export const getAllShops = () => axiosWrapper.get("/api/shop");
export const getShop = (shopId) => axiosWrapper.get(`/api/shop/${shopId}`);
export const approveShop = (shopId) => axiosWrapper.put(`/api/shop/${shopId}/approve`);
export const rejectShop = (shopId) => axiosWrapper.put(`/api/shop/${shopId}/reject`);
export const deleteShop = (shopId) => axiosWrapper.delete(`/api/shop/${shopId}`);
