import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { enqueueSnackbar } from "notistack";
import { getAvatarName } from "../../utils";
import { setCustomer } from "../../redux/slices/customerSlice";
import { getCustomers, addCustomer } from "../../https";

const CustomerInfo = () => {
  const dispatch = useDispatch();
  const customerData = useSelector((state) => state.customer);

  const [customers, setCustomers] = useState([]);
  const [selectedId, setSelectedId] = useState("walkin"); // "walkin" | "new" | id
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const shopId = localStorage.getItem("selectedShop");

  useEffect(() => {
    if (!shopId) return;
    getCustomers(shopId)
      .then((res) => {
        if (res.data.success) setCustomers(res.data.data);
      })
      .catch(() => {});
  }, [shopId]);

  const guests = customerData.guests || 0;

  const applyCustomer = (custName, custPhone, customerId = null) => {
    dispatch(setCustomer({ name: custName, phone: custPhone, guests, customerId }));
  };

  const handleSelect = (value) => {
    setSelectedId(value);
    setName("");
    setPhone("");
    if (value === "walkin") {
      applyCustomer("Walk-in Customer", "");
    } else if (value === "new") {
      applyCustomer("", "");
    } else {
      const c = customers.find((x) => String(x.id) === String(value));
      if (c) applyCustomer(c.name, c.phone || "", c.id);
    }
  };

  const handleSaveNew = async () => {
    if (!name.trim()) {
      enqueueSnackbar("Enter the customer's name", { variant: "warning" });
      return;
    }
    applyCustomer(name.trim(), phone || "");
    try {
      if (shopId) {
        const res = await addCustomer({
          name: name.trim(),
          phone: phone || "",
          shopId: parseInt(shopId),
        });
        if (res.data.success) {
          setCustomers((prev) => [...prev, res.data.data]);
          setSelectedId(String(res.data.data.id));
          applyCustomer(res.data.data.name, res.data.data.phone || "", res.data.data.id);
          enqueueSnackbar("Customer saved!", { variant: "success" });
        }
      }
    } catch {
      // Non-fatal; the name is still applied to the order
    }
  };

  return (
    <div className="px-2 py-1">
      <div className="flex items-center justify-between mb-3">
        <div className="flex flex-col items-start">
          <h1 className="text-md text-[#f5f5f5] font-semibold tracking-wide">
            {customerData.customerName || "No customer selected"}
          </h1>
          <p className="text-xs text-[#ababab] font-medium mt-1">
            Table: {customerData.table?.tableNo || "N/A"} / Dine in
          </p>
        </div>
        <button className="bg-[#f6b100] p-3 text-xl font-bold rounded-lg text-[#1f1f1f]">
          {getAvatarName(customerData.customerName) || "CN"}
        </button>
      </div>

      <label className="text-[#ababab] text-xs mb-1 block">Customer</label>
      <select
        value={selectedId}
        onChange={(e) => handleSelect(e.target.value)}
        className="w-full bg-white text-gray-900 px-3 py-2 rounded-lg focus:outline-none border border-[#383838] text-sm"
      >
        <option value="walkin" className="bg-white text-gray-900">🚶 Walk-in Customer</option>
        {customers.map((c) => (
          <option key={c.id} value={c.id} className="bg-white text-gray-900">
            {c.name}
            {c.phone ? ` — ${c.phone}` : ""}
          </option>
        ))}
        <option value="new" className="bg-white text-gray-900">➕ Add new customer…</option>
      </select>

      {selectedId === "new" && (
        <div className="mt-3 space-y-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Customer name"
            className="w-full bg-[#1f1f1f] text-white px-3 py-2 rounded-lg focus:outline-none border border-[#383838] text-sm"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone (optional)"
            className="w-full bg-[#1f1f1f] text-white px-3 py-2 rounded-lg focus:outline-none border border-[#383838] text-sm"
          />
          <button
            onClick={handleSaveNew}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 rounded-lg text-sm"
          >
            Save &amp; Use
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerInfo;
