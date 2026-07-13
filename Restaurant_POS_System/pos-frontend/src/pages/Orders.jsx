import React, { useState, useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import Invoice from "../components/invoice/Invoice";
import { keepPreviousData, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOrders,
  updateOrderStatus,
  updateOrder,
  getCustomers,
  getLedger,
  addLedgerEntry,
  updateLedgerEntry,
  deleteLedgerEntry,
} from "../https/index";
import { enqueueSnackbar } from "notistack";
import { formatDateAndTime, parseJSON, parseItems, printReport } from "../utils";
import { FaPrint } from "react-icons/fa";

const STATUS_OPTIONS = ["In Progress", "Ready", "Delivered", "Completed"];

const statusBadge = (status) => {
  switch (status) {
    case "Completed":
      return "text-green-400 bg-[#1f3d2b]";
    case "Ready":
      return "text-blue-400 bg-[#1e2f4a]";
    case "Delivered":
      return "text-purple-400 bg-[#2e2450]";
    case "Cancelled":
      return "text-red-400 bg-[#4a2020]";
    default:
      return "text-yellow-400 bg-[#4a452e]";
  }
};

const Orders = () => {
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [printOrder, setPrintOrder] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [ledger, setLedger] = useState([]);
  const queryClient = useQueryClient();

  const shopId = localStorage.getItem("selectedShop");

  useEffect(() => {
    document.title = "POS | Orders";
    loadAux();
  }, []);

  const loadAux = async () => {
    if (!shopId) return;
    try {
      const [c, l] = await Promise.all([getCustomers(shopId), getLedger(shopId)]);
      if (c.data.success) setCustomers(c.data.data);
      if (l.data.success) setLedger(l.data.data);
    } catch {
      // ignore
    }
  };

  const { data: resData, isError } = useQuery({
    queryKey: ["orders", shopId],
    queryFn: async () => getOrders(shopId),
    placeholderData: keepPreviousData,
  });

  const ledgerFor = (orderId) => ledger.filter((e) => String(e.orderId) === String(orderId));

  const orderTotal = (order) => {
    const bills = parseJSON(order.bills, {});
    return Number(bills.totalWithTax ?? bills.total ?? 0);
  };

  // Toggle an order between paid and unpaid (udhar), reconciling the ledger.
  const setPayment = async (order, newStatus) => {
    try {
      await updateOrder({ orderId: order.id, paymentStatus: newStatus });
      const customer = parseJSON(order.customerDetails, {});
      const entries = ledgerFor(order.id);
      const debit = entries.find((e) => e.type === "debit");
      const credit = entries.find((e) => e.type === "credit");
      const total = orderTotal(order);

      if (newStatus === "unpaid") {
        if (credit) await deleteLedgerEntry(credit.id);
        if (!debit) {
          await addLedgerEntry({
            shopId: parseInt(shopId),
            customerId: customer.customerId || null,
            customerName: customer.name || "Walk-in Customer",
            type: "debit",
            amount: total,
            description: `Order #${order.id} (unpaid)`,
            orderId: order.id,
          });
        }
      } else {
        // paid -> settle any outstanding debit with a credit
        if (debit && !credit) {
          await addLedgerEntry({
            shopId: parseInt(shopId),
            customerId: customer.customerId || debit.customerId || null,
            customerName: customer.name || debit.customerName || "Walk-in Customer",
            type: "credit",
            amount: debit.amount,
            description: `Order #${order.id} payment`,
            orderId: order.id,
          });
        }
      }
      enqueueSnackbar(newStatus === "paid" ? "Marked as Paid" : "Marked as Udhar (unpaid)", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      loadAux();
    } catch {
      enqueueSnackbar("Failed to update payment", { variant: "error" });
    }
  };

  // Assign a registered customer to an order (also updates its ledger entries).
  const assignCustomer = async (order, customerId) => {
    const c = customers.find((x) => String(x.id) === String(customerId));
    if (!c) return;
    try {
      const existing = parseJSON(order.customerDetails, {});
      const details = { ...existing, name: c.name, phone: c.phone || "", customerId: c.id };
      await updateOrder({ orderId: order.id, customerDetails: JSON.stringify(details) });
      for (const e of ledgerFor(order.id)) {
        await updateLedgerEntry({ id: e.id, customerId: c.id, customerName: c.name });
      }
      enqueueSnackbar(`Assigned to ${c.name}`, { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      loadAux();
    } catch {
      enqueueSnackbar("Failed to assign customer", { variant: "error" });
    }
  };

  const updateMutation = useMutation({
    mutationFn: ({ orderId, orderStatus }) => updateOrderStatus({ orderId, orderStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      enqueueSnackbar("Order status updated!", { variant: "success" });
    },
    onError: () => enqueueSnackbar("Failed to update status", { variant: "error" }),
  });

  if (isError) {
    enqueueSnackbar("Something went wrong!", { variant: "error" });
  }

  const orders = resData?.data?.data || [];

  const filtered = orders.filter((o) => {
    const statusMatch =
      status === "all" ||
      (status === "progress" && o.orderStatus === "In Progress") ||
      (status === "ready" && o.orderStatus === "Ready") ||
      (status === "completed" &&
        (o.orderStatus === "Completed" || o.orderStatus === "Delivered"));
    if (!statusMatch) return false;
    if (!search) return true;
    const customer = parseJSON(o.customerDetails, {});
    const q = search.toLowerCase();
    return (
      (customer.name || "").toLowerCase().includes(q) ||
      (customer.phone || "").toLowerCase().includes(q) ||
      String(o.id).includes(q)
    );
  });

  const handlePrintReport = () => {
    const shopName = (() => {
      try {
        return JSON.parse(localStorage.getItem("shopSession"))?.name || "Orders";
      } catch {
        return "Orders";
      }
    })();

    let revenue = 0;
    const rows = filtered
      .map((o) => {
        const customer = parseJSON(o.customerDetails, {});
        const bills = parseJSON(o.bills, {});
        const items = parseItems(o.items);
        const total = Number(bills.totalWithTax ?? bills.total ?? 0);
        revenue += total;
        return `
        <tr>
          <td>#${o.id}</td>
          <td>${customer.name || "Walk-in Customer"}</td>
          <td>${customer.phone || "-"}</td>
          <td>${o.tableNo ?? o.tableId ?? "-"}</td>
          <td class="center">${items.length}</td>
          <td class="right">PKR ${total.toFixed(2)}</td>
          <td>${o.paymentMethod || "Cash"}</td>
          <td>${formatDateAndTime(o.orderDate)}</td>
          <td>${o.orderStatus}</td>
        </tr>`;
      })
      .join("");

    const table = `
      <table>
        <thead>
          <tr><th>Order #</th><th>Customer</th><th>Phone</th><th>Table</th><th class="center">Items</th><th class="right">Total</th><th>Payment</th><th>Date</th><th>Status</th></tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="9" class="center">No orders</td></tr>'}</tbody>
        <tfoot>
          <tr><td colspan="5">Total orders: ${filtered.length}</td><td class="right">PKR ${revenue.toFixed(2)}</td><td colspan="3"></td></tr>
        </tfoot>
      </table>`;

    const label = status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1);
    printReport(`${shopName} — Orders Report`, `Filter: ${label}${search ? ` · Search: "${search}"` : ""}`, table);
  };

  const handlePrint = (order) => {
    setPrintOrder({
      ...order,
      customerDetails: parseJSON(order.customerDetails, {}),
      bills: parseJSON(order.bills, {}),
      items: parseItems(order.items),
      paymentData: parseJSON(order.paymentData, {}),
    });
    setShowInvoice(true);
  };

  const filters = [
    { key: "all", label: "All" },
    { key: "progress", label: "In Progress" },
    { key: "ready", label: "Ready" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-10 py-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">Orders</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name / phone / #"
            className="bg-[#2a2a2a] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-yellow-500 text-sm w-56"
          />
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatus(f.key)}
              className={`text-[#ababab] text-sm font-semibold rounded-lg px-4 py-2 ${
                status === f.key ? "bg-[#383838] text-white" : ""
              }`}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-2 bg-[#2e4a40] text-[#02ca3a] px-4 py-2 rounded-lg font-semibold hover:bg-[#345c4d] text-sm"
          >
            <FaPrint size={14} /> Print Report
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-10 pb-6">
        <div className="overflow-x-auto rounded-lg border border-[#383838]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#2a2a2a] text-[#ababab] sticky top-0">
              <tr>
                <th className="p-3 border-b border-[#383838]">Order #</th>
                <th className="p-3 border-b border-[#383838]">Customer</th>
                <th className="p-3 border-b border-[#383838]">Phone</th>
                <th className="p-3 border-b border-[#383838]">Table</th>
                <th className="p-3 border-b border-[#383838] text-center">Items</th>
                <th className="p-3 border-b border-[#383838] text-right">Total</th>
                <th className="p-3 border-b border-[#383838]">Payment</th>
                <th className="p-3 border-b border-[#383838]">Paid?</th>
                <th className="p-3 border-b border-[#383838]">Date</th>
                <th className="p-3 border-b border-[#383838]">Status</th>
                <th className="p-3 border-b border-[#383838] text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-6 text-center text-[#ababab]">
                    No orders available
                  </td>
                </tr>
              ) : (
                filtered.map((order, idx) => {
                  const customer = parseJSON(order.customerDetails, {});
                  const bills = parseJSON(order.bills, {});
                  const items = parseItems(order.items);
                  const total = Number(bills.totalWithTax ?? bills.total ?? 0);
                  const tableNo = order.tableNo ?? order.tableId ?? "-";
                  return (
                    <tr
                      key={order.id ?? idx}
                      className={`${idx % 2 ? "bg-[#242424]" : "bg-[#1c1c1c]"} hover:bg-[#2e2e2e] text-[#f5f5f5]`}
                    >
                      <td className="p-3 border-b border-[#333]">#{order.id}</td>
                      <td className="p-3 border-b border-[#333]">
                        <div className="flex flex-col gap-1">
                          <span>{customer.name || "Walk-in Customer"}</span>
                          <select
                            value={customer.customerId || ""}
                            onChange={(e) => assignCustomer(order, e.target.value)}
                            className="bg-[#1f1f1f] text-[#ababab] text-xs rounded px-1 py-0.5 border border-[#383838] focus:outline-none max-w-[140px]"
                          >
                            <option value="">↪ assign customer…</option>
                            {customers.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="p-3 border-b border-[#333] text-[#ababab]">
                        {customer.phone || "-"}
                      </td>
                      <td className="p-3 border-b border-[#333]">{tableNo}</td>
                      <td className="p-3 border-b border-[#333] text-center">{items.length}</td>
                      <td className="p-3 border-b border-[#333] text-right font-semibold">
                        PKR {total.toFixed(2)}
                      </td>
                      <td className="p-3 border-b border-[#333] text-[#ababab]">
                        {order.paymentMethod || "Cash"}
                      </td>
                      <td className="p-3 border-b border-[#333]">
                        <select
                          value={order.paymentStatus === "unpaid" ? "unpaid" : "paid"}
                          onChange={(e) => setPayment(order, e.target.value)}
                          className={`px-2 py-1 rounded-md text-xs font-semibold focus:outline-none ${
                            order.paymentStatus === "unpaid"
                              ? "text-red-400 bg-[#4a2020]"
                              : "text-green-400 bg-[#1f3d2b]"
                          }`}
                        >
                          <option value="paid" className="bg-[#1f1f1f] text-white">Paid</option>
                          <option value="unpaid" className="bg-[#1f1f1f] text-white">Udhar</option>
                        </select>
                      </td>
                      <td className="p-3 border-b border-[#333] text-[#ababab] whitespace-nowrap">
                        {formatDateAndTime(order.orderDate)}
                      </td>
                      <td className="p-3 border-b border-[#333]">
                        <select
                          value={STATUS_OPTIONS.includes(order.orderStatus) ? order.orderStatus : "In Progress"}
                          onChange={(e) =>
                            updateMutation.mutate({ orderId: order.id, orderStatus: e.target.value })
                          }
                          className={`px-2 py-1 rounded-md text-xs font-semibold focus:outline-none ${statusBadge(order.orderStatus)}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s} className="bg-[#1f1f1f] text-white">
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 border-b border-[#333] text-center">
                        <button
                          onClick={() => handlePrint(order)}
                          title="Print receipt"
                          className="inline-flex items-center gap-1 bg-[#2e4a40] text-[#02ca3a] px-3 py-1.5 rounded-lg hover:bg-[#345c4d] text-xs font-semibold"
                        >
                          <FaPrint size={14} /> Print
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showInvoice && printOrder && (
        <Invoice orderInfo={printOrder} setShowInvoice={setShowInvoice} />
      )}

      <BottomNav />
    </section>
  );
};

export default Orders;
