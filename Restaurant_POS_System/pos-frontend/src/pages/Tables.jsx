import React, { useState, useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import TableCard from "../components/tables/TableCard";
import { tables } from "../constants";
import { keepPreviousData, useQuery, useMutation } from "@tanstack/react-query";
import { getTables, addTable } from "../https";
import { enqueueSnackbar } from "notistack";

const Tables = () => {
  const [status, setStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ tableNo: "", seats: "" });
  const shopId = localStorage.getItem("selectedShop");

  useEffect(() => {
    document.title = "POS | Tables"
  }, [])

  const { data: resData, isError, refetch } = useQuery({
    queryKey: ["tables", shopId],
    queryFn: async () => {
      return await getTables(shopId);
    },
    placeholderData: keepPreviousData,
  });

  const addTableMutation = useMutation({
    mutationFn: (data) => addTable(data),
    onSuccess: (res) => {
      enqueueSnackbar("Table added successfully!", { variant: "success" });
      setFormData({ tableNo: "", seats: "" });
      setShowAddModal(false);
      refetch();
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Failed to add table";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  if(isError) {
    enqueueSnackbar("Something went wrong!", { variant: "error" })
  }

  const handleAddTable = (e) => {
    e.preventDefault();
    if (!formData.tableNo || !formData.seats) {
      enqueueSnackbar("Please fill all fields", { variant: "warning" });
      return;
    }
    if (!shopId) {
      enqueueSnackbar("No shop selected. Please log in again.", { variant: "error" });
      return;
    }
    addTableMutation.mutate({
      tableNo: parseInt(formData.tableNo),
      seats: parseInt(formData.seats),
      shopId: parseInt(shopId),
    });
  };

  const tablesList = resData?.data?.data || [];
  const filteredTables = status === "all" ? tablesList : tablesList.filter(t => t.status === "Booked");

  return (
    <section className="bg-[#1f1f1f]  h-[calc(100vh-5rem)] overflow-hidden">
      <div className="flex items-center justify-between px-10 py-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
            Tables
          </h1>
        </div>
        <div className="flex items-center justify-around gap-4">
          <button
            onClick={() => setStatus("all")}
            className={`text-[#ababab] text-lg ${
              status === "all" && "bg-[#383838] rounded-lg px-5 py-2"
            }  rounded-lg px-5 py-2 font-semibold`}
          >
            All
          </button>
          <button
            onClick={() => setStatus("booked")}
            className={`text-[#ababab] text-lg ${
              status === "booked" && "bg-[#383838] rounded-lg px-5 py-2"
            }  rounded-lg px-5 py-2 font-semibold`}
          >
            Booked
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-yellow-400 text-gray-900 px-5 py-2 rounded-lg font-bold hover:bg-yellow-500"
          >
            + Add Table
          </button>
        </div>
      </div>

      <div className="px-10 py-4 h-[calc(100vh-13rem)] overflow-y-auto scrollbar-hide">
        {filteredTables.length === 0 ? (
          <div className="text-center text-[#ababab] py-16">
            <p className="text-lg mb-2">No tables yet</p>
            <p className="text-sm">Click “+ Add Table” to create your first table.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredTables.map((table) => {
              return (
                <TableCard
                  key={table.id}
                  id={table.id}
                  name={table.tableNo}
                  status={table.status}
                  initials={table?.currentOrder?.customerDetails?.name || "-"}
                  seats={table.seats}
                  onUpdate={refetch}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Add Table Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2a2a2a] rounded-lg p-8 w-96">
            <h2 className="text-white text-xl font-bold mb-4">Add New Table</h2>
            <form onSubmit={handleAddTable}>
              <div className="mb-4">
                <label className="text-[#ababab] text-sm mb-2 block">Table Number</label>
                <input
                  type="number"
                  value={formData.tableNo}
                  onChange={(e) => setFormData({...formData, tableNo: e.target.value})}
                  placeholder="Enter table number"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838]"
                />
              </div>
              <div className="mb-4">
                <label className="text-[#ababab] text-sm mb-2 block">Number of Seats</label>
                <input
                  type="number"
                  value={formData.seats}
                  onChange={(e) => setFormData({...formData, seats: e.target.value})}
                  placeholder="Enter number of seats"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838]"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-[#383838] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#484848]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addTableMutation.isPending}
                  className="flex-1 bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg font-bold hover:bg-yellow-500 disabled:opacity-50"
                >
                  {addTableMutation.isPending ? "Adding..." : "Add Table"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </section>
  );
};

export default Tables;
