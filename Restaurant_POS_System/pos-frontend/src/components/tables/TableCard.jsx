import React from "react";
import { useNavigate } from "react-router-dom";
import { getAvatarName } from "../../utils";
import { useDispatch } from "react-redux";
import { updateTable as setTableInStore } from "../../redux/slices/customerSlice";
import { updateTable as updateTableApi } from "../../https";
import { enqueueSnackbar } from "notistack";
import { MdTableRestaurant } from "react-icons/md";

const TableCard = ({ id, name, status, initials, seats, onUpdate }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isBooked = status === "Booked";

  const handleClick = () => {
    if (isBooked) return;
    dispatch(setTableInStore({ table: { tableId: id, tableNo: name } }));
    navigate("/menu");
  };

  const handleFree = async (e) => {
    e.stopPropagation();
    try {
      await updateTableApi({ tableId: id, status: "Available", orderId: null });
      enqueueSnackbar(`Table ${name} is now available`, { variant: "success" });
      onUpdate && onUpdate();
    } catch {
      enqueueSnackbar("Failed to update table", { variant: "error" });
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`rounded-xl p-5 border transition ${
        isBooked
          ? "bg-[#262626] border-[#3a2b2b] cursor-not-allowed"
          : "bg-[#262626] border-[#2e4a40] hover:border-[#02ca3a] cursor-pointer"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MdTableRestaurant className="text-[#ababab]" size={20} />
          <h1 className="text-[#f5f5f5] text-lg font-bold">Table {name}</h1>
        </div>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${
            isBooked ? "text-red-400 bg-[#4a2020]" : "text-green-400 bg-[#1f3d2b]"
          }`}
        >
          {isBooked ? "Booked" : "Available"}
        </span>
      </div>

      <div className="flex items-center justify-center my-5">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${
            isBooked ? "bg-[#4a452e] text-yellow-300" : "bg-[#1f1f1f] text-[#5a5a5a]"
          }`}
        >
          {getAvatarName(initials) || "—"}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-[#ababab]">
        <span>
          Seats: <span className="text-[#f5f5f5] font-semibold">{seats}</span>
        </span>
        {isBooked ? (
          <button
            onClick={handleFree}
            className="text-[#02ca3a] font-semibold hover:underline"
          >
            Mark available
          </button>
        ) : (
          <span className="text-[#02ca3a] font-semibold">Tap to order →</span>
        )}
      </div>
    </div>
  );
};

export default TableCard;
