import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaCheck } from "react-icons/fa6";
import { FaPrint } from "react-icons/fa";
import { getShop } from "../../https";

const Invoice = ({ orderInfo, setShowInvoice }) => {
  const invoiceRef = useRef(null);
  const [shop, setShop] = useState(null);

  // Load the shop's details for the receipt header
  useEffect(() => {
    const shopId = localStorage.getItem("selectedShop");
    if (!shopId) return;
    getShop(shopId)
      .then((res) => {
        if (res.data.success) setShop(res.data.data);
      })
      .catch(() => {});
  }, []);

  const customer = orderInfo?.customerDetails || {};
  const bills = orderInfo?.bills || {};
  const items = Array.isArray(orderInfo?.items) ? orderInfo.items : [];
  const num = (v) => Number(v || 0).toFixed(2);

  const handlePrint = () => {
    const printContent = invoiceRef.current.innerHTML;
    const WinPrint = window.open("", "", "width=900,height=650");

    WinPrint.document.write(`
            <html>
              <head>
                <title>Order Receipt</title>
                <style>
                  body { font-family: Arial, sans-serif; padding: 20px; }
                  .receipt-container { width: 300px; border: 1px solid #ddd; padding: 10px; }
                  h2 { text-align: center; }
                  .powered { text-align: center; margin-top: 16px; padding-top: 8px; border-top: 1px dashed #999; font-size: 11px; color: #666; }
                </style>
              </head>
              <body>
                ${printContent}
              </body>

            </html>
          `);

    WinPrint.document.close();
    WinPrint.focus();
    setTimeout(() => {
      WinPrint.print();
      WinPrint.close();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-[400px] relative max-h-[92vh] overflow-y-auto">
        {/* Close (X) */}
        <button
          onClick={() => setShowInvoice(false)}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 text-lg font-bold"
          title="Close"
        >
          ✕
        </button>

        {/* Receipt Content for Printing */}

        <div ref={invoiceRef} className="p-4">
          {/* Shop Header */}
          <div className="text-center mb-3">
            <h1 className="text-lg font-bold uppercase">
              {shop?.name || "Restaurant"}
            </h1>
            {shop?.address && (
              <p className="text-xs text-gray-600">{shop.address}</p>
            )}
            {shop?.phone && (
              <p className="text-xs text-gray-600">Tel: {shop.phone}</p>
            )}
          </div>

          {/* Receipt Header */}
          <div className="flex justify-center mb-4">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 150 }}
              className="w-12 h-12 border-8 border-green-500 rounded-full flex items-center justify-center shadow-lg bg-green-500"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="text-2xl"
              >
                <FaCheck className="text-white" />
              </motion.span>
            </motion.div>
          </div>

          <h2 className="text-xl font-bold text-center mb-2">Order Receipt</h2>
          <p className="text-gray-600 text-center">Thank you for your order!</p>

          {/* Order Details */}

          <div className="mt-4 border-t pt-4 text-sm text-gray-700">
            <p>
              <strong>Order ID:</strong>{" "}
              {orderInfo?.id ||
                (orderInfo?.orderDate
                  ? Math.floor(new Date(orderInfo.orderDate).getTime())
                  : "-")}
            </p>
            <p>
              <strong>Name:</strong> {customer.name || "Walk-in Customer"}
            </p>
            <p>
              <strong>Phone:</strong> {customer.phone || "-"}
            </p>
            {customer.address && (
              <p>
                <strong>Address:</strong> {customer.address}
              </p>
            )}
            {customer.address ? null : (
              <p>
                <strong>Guests:</strong> {customer.guests ?? 0}
              </p>
            )}
            {orderInfo?.note && (
              <p>
                <strong>Note:</strong> {orderInfo.note}
              </p>
            )}
          </div>

          {/* Items Summary */}

          <div className="mt-4 border-t pt-4">
            <h3 className="text-sm font-semibold">Items Ordered</h3>
            <ul className="text-sm text-gray-700">
              {items.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center text-xs"
                >
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span>PKR {num(item.price)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bills Summary */}

          <div className="mt-4 border-t pt-4 text-sm">
            <p>
              <strong>Subtotal:</strong> PKR {num(bills.total)}
            </p>
            <p>
              <strong>Tax:</strong> PKR {num(bills.tax)}
            </p>
            <p className="text-md font-semibold">
              <strong>Grand Total:</strong> PKR {num(bills.totalWithTax)}
            </p>
          </div>

          {/* Payment Details */}

          <div className="mb-2 mt-2 text-xs">
            <p>
              <strong>Payment Method:</strong>{" "}
              {orderInfo?.paymentMethod || "Cash"}
            </p>
            <div className="text-center mt-3 pt-2 border-t border-dashed border-gray-400 text-[10px] text-gray-500">
              Powered by <strong>SoftTech</strong> · 0333 9777676
            </div>
            {orderInfo?.paymentData?.razorpay_order_id && (
              <>
                <p>
                  <strong>Razorpay Order ID:</strong>{" "}
                  {orderInfo.paymentData.razorpay_order_id}
                </p>
                <p>
                  <strong>Razorpay Payment ID:</strong>{" "}
                  {orderInfo.paymentData.razorpay_payment_id}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg"
          >
            <FaPrint size={16} /> Print Invoice
          </button>
          <button
            onClick={() => setShowInvoice(false)}
            className="px-5 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
