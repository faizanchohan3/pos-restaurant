import React, { useState } from "react";
import { FaCheckDouble, FaLongArrowAltRight } from "react-icons/fa";
import { FaCircle } from "react-icons/fa";
import { formatDateAndTime, getAvatarName, parseJSON, parseItems } from "../../utils/index";
import { updateOrderStatus } from "../../https/index";
import { enqueueSnackbar } from "notistack";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const OrderCard = ({ key, order }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  const customer = parseJSON(order.customerDetails, {});
  const bills = parseJSON(order.bills, {});
  const items = parseItems(order.items);
  const tableNo = order.tableNo ?? order.table?.tableNo ?? order.tableId ?? "-";
  const grandTotal = Number(bills.totalWithTax ?? bills.total ?? 0);

  const updateMutation = useMutation({
    mutationFn: (newStatus) => updateOrderStatus({ orderId: order.id, orderStatus: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      enqueueSnackbar("Order status updated!", { variant: "success" });
      setIsUpdating(false);
    },
    onError: () => {
      enqueueSnackbar("Failed to update order status", { variant: "error" });
      setIsUpdating(false);
    },
  });

  const handleStatusChange = (newStatus) => {
    setIsUpdating(true);
    updateMutation.mutate(newStatus);
  };

  const getNextStatuses = () => {
    const statuses = ["In Progress", "Ready", "Delivered", "Completed"];
    const currentIndex = statuses.indexOf(order.orderStatus);
    return statuses.slice(currentIndex + 1);
  };

  return (
    <div key={key} className="w-full bg-[#262626] p-4 rounded-lg mb-4">
      <div className="flex items-center gap-5">
        <button className="bg-[#f6b100] p-3 text-xl font-bold rounded-lg">
          {getAvatarName(customer.name) || "N/A"}
        </button>
        <div className="flex items-center justify-between w-[100%]">
          <div className="flex flex-col items-start gap-1">
            <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">
              {customer.name || "Walk-in Customer"}
            </h1>
            <p className="text-[#ababab] text-sm">#{Math.floor(new Date(order.orderDate).getTime())} / Dine in</p>
            <p className="text-[#ababab] text-sm">Table <FaLongArrowAltRight className="text-[#ababab] ml-2 inline" /> {tableNo}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {order.orderStatus === "Ready" ? (
              <>
                <p className="text-green-600 bg-[#2e4a40] px-2 py-1 rounded-lg">
                  <FaCheckDouble className="inline mr-2" /> {order.orderStatus}
                </p>
                <p className="text-[#ababab] text-sm">
                  <FaCircle className="inline mr-2 text-green-600" /> Ready to
                  serve
                </p>
              </>
            ) : (
              <>
                <p className="text-yellow-600 bg-[#4a452e] px-2 py-1 rounded-lg">
                  <FaCircle className="inline mr-2" /> {order.orderStatus}
                </p>
                <p className="text-[#ababab] text-sm">
                  <FaCircle className="inline mr-2 text-yellow-600" /> Preparing your order
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-4 text-[#ababab]">
        <p>{formatDateAndTime(order.orderDate)}</p>
        <p>{items.length} Items</p>
      </div>
      <hr className="w-full mt-4 border-t-1 border-gray-500" />
      <div className="flex items-center justify-between mt-4">
        <h1 className="text-[#f5f5f5] text-lg font-semibold">Total</h1>
        <p className="text-[#f5f5f5] text-lg font-semibold">PKR {grandTotal.toFixed(2)}</p>
      </div>

      {/* Status Change Buttons */}
      <div className="flex gap-2 mt-4">
        {getNextStatuses().map((status) => (
          <button
            key={status}
            onClick={() => handleStatusChange(status)}
            disabled={isUpdating}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition ${
              status === "Ready"
                ? "bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                : status === "Delivered"
                ? "bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                : "bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
            }`}
          >
            {isUpdating ? "..." : status}
          </button>
        ))}
      </div>
    </div>
  );
};

export default OrderCard;
