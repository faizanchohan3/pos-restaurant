import React, { useState } from "react";
import { FaHome } from "react-icons/fa";
import { MdOutlineReorder, MdTableBar } from "react-icons/md";
import { CiCircleMore } from "react-icons/ci";
import { BiSolidDish } from "react-icons/bi";
import { useNavigate, useLocation } from "react-router-dom";
import Modal from "./Modal";
import { useDispatch, useSelector } from "react-redux";
import { setCustomer } from "../../redux/slices/customerSlice";

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
  const [name, setName] = useState();
  const [phone, setPhone] = useState();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const increment = () => {
    if(guestCount >= 6) return;
    setGuestCount((prev) => prev + 1);
  }
  const decrement = () => {
    if(guestCount <= 0) return;
    setGuestCount((prev) => prev - 1);
  }

  const isActive = (path) => location.pathname === path;

  const handleCreateOrder = () => {
    // send the data to store
    dispatch(setCustomer({name, phone, guests: guestCount}));
    navigate("/tables");
  }

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
          <label className="block text-[#ababab] mb-2 text-sm font-medium">Customer Name</label>
          <div className="flex items-center rounded-lg p-3 px-4 bg-[#1f1f1f]">
            <input value={name} onChange={(e) => setName(e.target.value)} type="text" name="" placeholder="Enter customer name" id="" className="bg-transparent flex-1 text-white focus:outline-none"  />
          </div>
        </div>
        <div>
          <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">Customer Phone</label>
          <div className="flex items-center rounded-lg p-3 px-4 bg-[#1f1f1f]">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} type="number" name="" placeholder="+91-9999999999" id="" className="bg-transparent flex-1 text-white focus:outline-none"  />
          </div>
        </div>
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
