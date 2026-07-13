import React, { useState, useEffect } from "react";
import BackButton from "../components/shared/BackButton";
import Invoice from "../components/invoice/Invoice";
import { enqueueSnackbar } from "notistack";
import { FiMapPin, FiPhone, FiClock, FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";
import { FaPrint } from "react-icons/fa";
import { getCustomers, addCustomer } from "../https";
import { parseJSON } from "../utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://pos-backend-lime.vercel.app";
const TAX_RATE = 5.25;

const Delivery = () => {
  const shopId = localStorage.getItem("selectedShop");
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // customer + products
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState("new");
  const [cust, setCust] = useState({ name: "", phone: "", address: "" });
  const [cart, setCart] = useState({}); // { productId: { ...product, qty } }

  // invoice
  const [printOrder, setPrintOrder] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    document.title = "POS | Delivery Orders";
    if (shopId) {
      fetchDeliveries();
      getCustomers(shopId).then((r) => r.data.success && setCustomers(r.data.data)).catch(() => {});
      fetch(`${API_BASE_URL}/api/products?shopId=${shopId}`)
        .then((r) => r.json())
        .then((d) => d.success && setProducts(d.data))
        .catch(() => {});
    }
  }, [shopId]);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/delivery?shopId=${shopId}`);
      const data = await res.json();
      if (data.success) setDeliveryOrders(data.data);
    } catch (error) {
      enqueueSnackbar("Failed to load deliveries", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const lineItems = Object.values(cart);
  const subtotal = lineItems.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = (subtotal * TAX_RATE) / 100;
  const grandTotal = subtotal + tax;
  const totalQty = lineItems.reduce((s, i) => s + i.qty, 0);

  const openModal = () => {
    setSelectedId("new");
    setCust({ name: "", phone: "", address: "" });
    setCart({});
    setShowAddModal(true);
  };

  const handleCustomerSelect = (value) => {
    setSelectedId(value);
    if (value === "new") {
      setCust({ name: "", phone: "", address: "" });
    } else {
      const c = customers.find((x) => String(x.id) === String(value));
      if (c) setCust({ name: c.name, phone: c.phone || "", address: c.address || "" });
    }
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev[product.id];
      return { ...prev, [product.id]: { ...product, qty: (existing?.qty || 0) + 1 } };
    });
  };
  const decFromCart = (product) => {
    setCart((prev) => {
      const existing = prev[product.id];
      if (!existing) return prev;
      const qty = existing.qty - 1;
      const next = { ...prev };
      if (qty <= 0) delete next[product.id];
      else next[product.id] = { ...existing, qty };
      return next;
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!cust.name.trim()) {
      enqueueSnackbar("Enter customer name", { variant: "warning" });
      return;
    }
    if (!cust.address.trim()) {
      enqueueSnackbar("Enter delivery address", { variant: "warning" });
      return;
    }
    if (lineItems.length === 0) {
      enqueueSnackbar("Add at least one item", { variant: "warning" });
      return;
    }

    // Save new customer if needed
    if (selectedId === "new") {
      try {
        await addCustomer({
          name: cust.name.trim(),
          phone: cust.phone || "",
          address: cust.address || "",
          shopId: parseInt(shopId),
        });
      } catch {
        // non-fatal
      }
    }

    const items = lineItems.map((i) => ({
      name: i.name,
      quantity: i.qty,
      price: i.price * i.qty,
    }));
    const itemsData = JSON.stringify({
      items,
      bills: { total: subtotal, tax, totalWithTax: grandTotal },
    });

    try {
      const res = await fetch(`${API_BASE_URL}/api/delivery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: cust.name.trim(),
          phone: cust.phone || "",
          address: cust.address || "",
          items: totalQty,
          itemsData,
          total: grandTotal,
          status: "Pending",
          shopId: parseInt(shopId),
        }),
      });
      const data = await res.json();
      if (data.success) {
        enqueueSnackbar("Delivery order created!", { variant: "success" });
        setShowAddModal(false);
        fetchDeliveries();
        printInvoice(data.data);
      } else {
        enqueueSnackbar(data.message || "Failed to create", { variant: "error" });
      }
    } catch {
      enqueueSnackbar("Connection error", { variant: "error" });
    }
  };

  const printInvoice = (order) => {
    const parsed = parseJSON(order.itemsData, {});
    setPrintOrder({
      id: order.id,
      orderDate: order.createdAt,
      customerDetails: {
        name: order.customerName,
        phone: order.phone,
        address: order.address,
      },
      bills: parsed.bills || { total: order.total, tax: 0, totalWithTax: order.total },
      items: parsed.items || [],
      paymentMethod: "Delivery (COD)",
    });
    setShowInvoice(true);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/delivery/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) fetchDeliveries();
    } catch {
      enqueueSnackbar("Connection error", { variant: "error" });
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm("Delete this delivery order?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/delivery/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        enqueueSnackbar("Order deleted!", { variant: "success" });
        fetchDeliveries();
      }
    } catch {
      enqueueSnackbar("Connection error", { variant: "error" });
    }
  };

  const statusColors = {
    Pending: "bg-yellow-900 text-yellow-200",
    "In Transit": "bg-blue-900 text-blue-200",
    Delivered: "bg-green-900 text-green-200",
    Cancelled: "bg-red-900 text-red-200",
  };

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-10 py-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">Delivery Orders</h1>
        </div>
        <button
          onClick={openModal}
          className="bg-yellow-400 text-gray-900 px-5 py-2 rounded-lg font-bold hover:bg-yellow-500"
        >
          + New Delivery
        </button>
      </div>

      {/* Delivery Orders */}
      <div className="flex-1 overflow-auto px-10 pb-4">
        {loading ? (
          <p className="text-[#ababab] py-8 text-center">Loading...</p>
        ) : deliveryOrders.length === 0 ? (
          <p className="text-[#ababab] py-8 text-center">No delivery orders yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deliveryOrders.map((order) => (
              <div key={order.id} className="bg-[#2a2a2a] rounded-lg p-4 border border-[#383838]">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-[#f5f5f5] font-bold text-lg">{order.customerName}</h3>
                    <div className="flex items-center gap-2 text-[#ababab] text-sm mt-1">
                      <FiPhone size={14} />
                      <span>{order.phone || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#ababab] text-sm mt-1">
                      <FiMapPin size={14} />
                      <span>{order.address}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-bold text-xl">PKR {Number(order.total).toFixed(2)}</p>
                    <p className="text-[#ababab] text-sm">{order.items} items</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <FiClock size={14} className="text-[#ababab]" />
                  <span className="text-[#ababab] text-sm">
                    {order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}
                  </span>
                  <span className={`ml-auto px-3 py-1 rounded-full text-sm font-semibold ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </div>

                <div className="flex gap-2">
                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                    className="flex-1 bg-[#1f1f1f] text-white px-3 py-2 rounded text-sm border border-[#383838] focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={() => printInvoice(order)}
                    className="bg-[#2e4a40] text-[#02ca3a] px-3 py-2 rounded text-sm font-semibold flex items-center gap-1 hover:bg-[#345c4d]"
                  >
                    <FaPrint size={14} /> Print
                  </button>
                  <button
                    onClick={() => handleDeleteOrder(order.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-semibold"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Delivery Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2a2a2a] rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-[#383838]">
              <h2 className="text-white text-xl font-bold">New Delivery Order</h2>
              <button onClick={() => setShowAddModal(false)} className="text-[#ababab] hover:text-white text-xl">✕</button>
            </div>

            <form onSubmit={handleCreate} className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5">
                {/* Left: customer */}
                <div>
                  <h3 className="text-[#f5f5f5] font-semibold mb-3">👤 Customer</h3>
                  <select
                    value={selectedId}
                    onChange={(e) => handleCustomerSelect(e.target.value)}
                    className="w-full bg-[#1f1f1f] text-white px-3 py-2 rounded-lg border border-[#383838] text-sm mb-3"
                  >
                    <option value="new">➕ New customer</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}{c.phone ? ` — ${c.phone}` : ""}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={cust.name}
                    onChange={(e) => setCust({ ...cust, name: e.target.value })}
                    placeholder="Customer name *"
                    className="w-full bg-[#1f1f1f] text-white px-3 py-2 rounded-lg border border-[#383838] text-sm mb-3"
                  />
                  <input
                    type="tel"
                    value={cust.phone}
                    onChange={(e) => setCust({ ...cust, phone: e.target.value })}
                    placeholder="Phone"
                    className="w-full bg-[#1f1f1f] text-white px-3 py-2 rounded-lg border border-[#383838] text-sm mb-3"
                  />
                  <textarea
                    value={cust.address}
                    onChange={(e) => setCust({ ...cust, address: e.target.value })}
                    placeholder="Delivery address *"
                    className="w-full bg-[#1f1f1f] text-white px-3 py-2 rounded-lg border border-[#383838] text-sm h-20 resize-none"
                  />

                  {/* Cart summary */}
                  <div className="mt-4 bg-[#1f1f1f] rounded-lg p-3 border border-[#383838]">
                    <h4 className="text-[#f5f5f5] font-semibold text-sm mb-2">🛒 Order ({totalQty})</h4>
                    {lineItems.length === 0 ? (
                      <p className="text-[#ababab] text-xs">No items added.</p>
                    ) : (
                      <div className="space-y-1 max-h-28 overflow-y-auto">
                        {lineItems.map((i) => (
                          <div key={i.id} className="flex justify-between text-xs text-[#ddd]">
                            <span>{i.name} × {i.qty}</span>
                            <span>PKR {(i.price * i.qty).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="border-t border-[#383838] mt-2 pt-2 text-xs space-y-1">
                      <div className="flex justify-between text-[#ababab]"><span>Subtotal</span><span>PKR {subtotal.toFixed(2)}</span></div>
                      <div className="flex justify-between text-[#ababab]"><span>Tax ({TAX_RATE}%)</span><span>PKR {tax.toFixed(2)}</span></div>
                      <div className="flex justify-between text-yellow-400 font-bold"><span>Total</span><span>PKR {grandTotal.toFixed(2)}</span></div>
                    </div>
                  </div>
                </div>

                {/* Right: products */}
                <div>
                  <h3 className="text-[#f5f5f5] font-semibold mb-3">🍽️ Menu Items</h3>
                  {products.length === 0 ? (
                    <p className="text-[#ababab] text-sm">No products. Add products first.</p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {products.map((p) => (
                        <div key={p.id} className="flex items-center justify-between bg-[#1f1f1f] rounded-lg p-2 border border-[#383838]">
                          <div>
                            <p className="text-[#f5f5f5] text-sm font-semibold">{p.name}</p>
                            <p className="text-[#ababab] text-xs">PKR {p.price} · {p.category}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => decFromCart(p)} className="bg-[#383838] text-white p-1.5 rounded"><FiMinus size={14} /></button>
                            <span className="text-white text-sm w-5 text-center">{cart[p.id]?.qty || 0}</span>
                            <button type="button" onClick={() => addToCart(p)} className="bg-green-600 text-white p-1.5 rounded"><FiPlus size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 p-5 border-t border-[#383838]">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-[#383838] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#484848]">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg font-bold hover:bg-yellow-500">
                  Create &amp; Print Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showInvoice && printOrder && (
        <Invoice orderInfo={printOrder} setShowInvoice={setShowInvoice} />
      )}
    </section>
  );
};

export default Delivery;
