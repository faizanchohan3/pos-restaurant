import React, { useState, useEffect } from "react";
import { FaHome } from "react-icons/fa";
import { MdOutlineReorder, MdTableBar } from "react-icons/md";
import { CiCircleMore } from "react-icons/ci";
import { BiSolidDish } from "react-icons/bi";
import { useNavigate, useLocation } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import Modal from "./Modal";
import { useDispatch, useSelector } from "react-redux";
import { setCustomer } from "../../redux/slices/customerSlice";
import { getCustomers, addCustomer } from "../../https";

// Items shown in the "More" menu, gated by role.
// admin: true renders in the yellow "ADMIN ONLY" group.
const MORE_MENU_ITEMS = [
  { label: "🚚 Delivery Orders", route: "/delivery", roles: ["Admin"] },
  { label: "📈 Dashboard", route: "/dashboard", roles: ["Admin"] },
  { label: "🍽️ Menu", route: "/menu", roles: ["Admin"] },
  { label: "💸 Expenses", route: "/expenses", roles: ["Admin", "Manager", "Cashier"] },
  { label: "📊 Financial Report", route: "/financial", roles: ["Admin", "Manager"] },
  { label: "🛍️ Products", route: "/products", roles: ["Admin"], admin: true },
  { label: "📂 Categories", route: "/categories", roles: ["Admin"], admin: true },
  { label: "📦 Stock Management", route: "/stock", roles: ["Admin"], admin: true },
  { label: "👥 Manage Staff", route: "/staff-management", roles: ["Admin"], admin: true },
  { label: "👤 Customers", route: "/customers", roles: ["Admin"], admin: true },
  { label: "🏪 Shop Management", route: "/shop-management", roles: ["Admin"], admin: true },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, role } = useSelector(state => state.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [guestCount, setGuestCount] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [customers, setCustomers] = useState([]);
  // "walkin" | "new" | <customer id>
  const [selectedCustomerId, setSelectedCustomerId] = useState("walkin");

  const openModal = () => {
    setSelectedCustomerId("walkin");
    setName("");
    setPhone("");
    setGuestCount(0);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  // Load this shop's customers whenever the order modal opens
  useEffect(() => {
    if (!isModalOpen) return;
    const shopId = localStorage.getItem("selectedShop");
    if (!shopId) return;
    getCustomers(shopId)
      .then((res) => {
        if (res.data.success) setCustomers(res.data.data);
      })
      .catch(() => {});
  }, [isModalOpen]);

  const increment = () => {
    if(guestCount >= 6) return;
    setGuestCount((prev) => prev + 1);
  }
  const decrement = () => {
    if(guestCount <= 0) return;
    setGuestCount((prev) => prev - 1);
  }

  const isActive = (path) => location.pathname === path;

  const handleCreateOrder = async () => {
    const shopId = localStorage.getItem("selectedShop");
    let custName = "Walk-in Customer";
    let custPhone = "";

    if (selectedCustomerId === "walkin") {
      custName = name.trim() || "Walk-in Customer";
      custPhone = phone || "";
    } else if (selectedCustomerId === "new") {
      if (!name.trim()) {
        enqueueSnackbar("Enter the new customer's name", { variant: "warning" });
        return;
      }
      custName = name.trim();
      custPhone = phone || "";
      // Save the new customer to this shop
      try {
        if (shopId) {
          await addCustomer({ name: custName, phone: custPhone, shopId: parseInt(shopId) });
        }
      } catch {
        // Non-fatal: still allow the order to proceed
      }
    } else {
      const c = customers.find((c) => String(c.id) === String(selectedCustomerId));
      if (c) {
        custName = c.name;
        custPhone = c.phone || "";
      }
    }

    dispatch(setCustomer({ name: custName, phone: custPhone, guests: guestCount }));
    setIsModalOpen(false);
    navigate("/tables");
  };

  // Menu items available to the current role
  const currentRole = role || user?.role;
  const visibleMenuItems = MORE_MENU_ITEMS.filter((item) =>
    item.roles.includes(currentRole)
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#262626] p-2 h-16 flex justify-around">
      <button
        onClick={() => navigate("/")}
        className={`flex items-center justify-center font-bold ${
          isActive("/") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab]"
        } w-[300px] rounded-[20px]`}
      >
        <FaHome className="inline mr-2" size={20} /> <p>Home</p>
      </button>
      <button
        onClick={() => navigate("/orders")}
        className={`flex items-center justify-center font-bold ${
          isActive("/orders") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab]"
        } w-[300px] rounded-[20px]`}
      >
        <MdOutlineReorder className="inline mr-2" size={20} /> <p>Orders</p>
      </button>
      <button
        onClick={() => navigate("/tables")}
        className={`flex items-center justify-center font-bold ${
          isActive("/tables") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab]"
        } w-[300px] rounded-[20px]`}
      >
        <MdTableBar className="inline mr-2" size={20} /> <p>Tables</p>
      </button>

      {/* "More" menu only shows when the current role has items available */}
      {visibleMenuItems.length > 0 && (
        <div className="relative w-[300px]">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="flex items-center justify-center font-bold text-[#ababab] w-full hover:text-[#f5f5f5]"
          >
            <CiCircleMore className="inline mr-2" size={20} /> <p>More</p>
          </button>

          {showMoreMenu && (
            <div className="absolute bottom-16 left-0 right-0 bg-[#343434] rounded-lg shadow-lg overflow-hidden border border-[#383838] max-h-72 overflow-y-auto">
              {visibleMenuItems.map((item, idx) => {
                const isFirstAdmin =
                  item.admin &&
                  (idx === 0 || !visibleMenuItems[idx - 1].admin);
                return (
                  <React.Fragment key={item.route}>
                    {isFirstAdmin && (
                      <>
                        <div className="border-t border-[#484848]"></div>
                        <p className="text-yellow-400 text-xs font-bold px-4 py-2">
                          ADMIN ONLY
                        </p>
                      </>
                    )}
                    <button
                      onClick={() => {
                        navigate(item.route);
                        setShowMoreMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 font-semibold text-sm ${
                        isActive(item.route)
                          ? "text-[#f5f5f5] bg-[#383838]"
                          : item.admin
                          ? "text-yellow-400"
                          : "text-[#ababab]"
                      } hover:bg-[#383838] hover:text-[#f5f5f5]`}
                    >
                      {item.label}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      )}

      <button
        disabled={isActive("/tables") || isActive("/menu")}
        onClick={openModal}
        className="absolute bottom-6 bg-[#F6B100] text-[#f5f5f5] rounded-full p-4 items-center"
      >
        <BiSolidDish size={40} />
      </button>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Create Order">
        <div>
          <label className="block text-[#ababab] mb-2 text-sm font-medium">Customer</label>
          <div className="flex items-center rounded-lg p-3 px-4 bg-[#1f1f1f]">
            <select
              value={selectedCustomerId}
              onChange={(e) => {
                setSelectedCustomerId(e.target.value);
                setName("");
                setPhone("");
              }}
              className="bg-transparent flex-1 text-white focus:outline-none"
            >
              <option value="walkin" className="bg-[#1f1f1f]">🚶 Walk-in Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#1f1f1f]">
                  {c.name}{c.phone ? ` — ${c.phone}` : ""}
                </option>
              ))}
              <option value="new" className="bg-[#1f1f1f]">➕ Add new customer…</option>
            </select>
          </div>
        </div>

        {(selectedCustomerId === "walkin" || selectedCustomerId === "new") && (
          <>
            <div>
              <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
                Customer Name {selectedCustomerId === "new" ? "*" : "(optional)"}
              </label>
              <div className="flex items-center rounded-lg p-3 px-4 bg-[#1f1f1f]">
                <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder={selectedCustomerId === "new" ? "Enter customer name" : "Walk-in Customer"} className="bg-transparent flex-1 text-white focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">Customer Phone</label>
              <div className="flex items-center rounded-lg p-3 px-4 bg-[#1f1f1f]">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} type="number" placeholder="Phone number" className="bg-transparent flex-1 text-white focus:outline-none" />
              </div>
            </div>
          </>
        )}
        <div>
          <label className="block mb-2 mt-3 text-sm font-medium text-[#ababab]">Guest</label>
          <div className="flex items-center justify-between bg-[#1f1f1f] px-4 py-3 rounded-lg">
            <button onClick={decrement} className="text-yellow-500 text-2xl">&minus;</button>
            <span className="text-white">{guestCount} Person</span>
            <button onClick={increment} className="text-yellow-500 text-2xl">&#43;</button>
          </div>
        </div>
        <button onClick={handleCreateOrder} className="w-full bg-[#F6B100] text-[#f5f5f5] rounded-lg py-3 mt-8 hover:bg-yellow-700">
          Create Order
        </button>
      </Modal>
    </div>
  );
};

export default BottomNav;
