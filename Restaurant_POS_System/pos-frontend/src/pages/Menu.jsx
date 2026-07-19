import React, { useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import { MdRestaurantMenu } from "react-icons/md";
import MenuContainer from "../components/menu/MenuContainer";
import CustomerInfo from "../components/menu/CustomerInfo";
import CartInfo from "../components/menu/CartInfo";
import Bill from "../components/menu/Bill";
import { useSelector, useDispatch } from "react-redux";
import { getTotalPrice, setCart } from "../redux/slices/cartSlice";

const Menu = () => {
  const dispatch = useDispatch();

    useEffect(() => {
      document.title = "POS | Menu"
    }, [])

  const customerData = useSelector((state) => state.customer);
  const cartData = useSelector((state) => state.cart);
  const total = useSelector(getTotalPrice);

  // Persist the cart per table + shop, so it survives navigation/reload.
  const shopId = localStorage.getItem("selectedShop");
  const tableId = customerData.table?.tableId;
  const cartKey = tableId ? `cart_${shopId}_${tableId}` : null;

  useEffect(() => {
    if (!cartKey) return;
    try {
      dispatch(setCart(JSON.parse(localStorage.getItem(cartKey) || "[]")));
    } catch {
      dispatch(setCart([]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartKey]);

  useEffect(() => {
    if (!cartKey) return;
    localStorage.setItem(cartKey, JSON.stringify(cartData));
  }, [cartData, cartKey]);
  const taxRate = 5.25;
  const tax = (total * taxRate) / 100;
  const totalPriceWithTax = total + tax;

  return (
    <section className="bg-[#1f1f1f] min-h-screen flex flex-col pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-10 py-3 md:py-4 bg-[#2a2a2a] border-b border-[#383838] flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-xl md:text-2xl font-bold tracking-wider">
            🍽️ Menu
          </h1>
        </div>
        <div className="flex items-center gap-3 md:gap-6">
          {/* Sticky Bill Total */}
          {cartData.length > 0 && (
            <div className="bg-[#f6b100] rounded-lg px-4 py-2 flex flex-col items-end">
              <p className="text-xs text-[#1f1f1f] font-semibold">Total Bill</p>
              <p className="text-xl text-[#1f1f1f] font-bold">
                PKR {totalPriceWithTax.toFixed(2)}
              </p>
            </div>
          )}
          <div className="flex items-center gap-3 cursor-pointer bg-[#1f1f1f] px-4 py-2 rounded-lg">
            <MdRestaurantMenu className="text-[#f5f5f5] text-3xl" />
            <div className="flex flex-col items-start">
              <h1 className="text-sm text-[#f5f5f5] font-semibold">
                {customerData.customerName || "Customer"}
              </h1>
              <p className="text-xs text-[#ababab]">
                Table: {customerData.table?.tableNo || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 p-2 md:p-4">
        {/* Left: Menu Items (Scrollable) */}
        <div className="lg:flex-[3] overflow-y-auto">
          <MenuContainer />
        </div>

        {/* Right: Cart/Bill */}
        <div className="lg:flex-[1] flex flex-col gap-3 lg:sticky lg:top-4 h-fit">
          <div className="bg-[#2a2a2a] rounded-lg border border-[#383838] p-4 overflow-y-auto max-h-96">
            <h3 className="text-[#f5f5f5] font-bold mb-3">👤 Customer Info</h3>
            <CustomerInfo />
          </div>

          <div className="rounded-lg overflow-hidden">
            <CartInfo />
          </div>

          <div className="bg-[#2a2a2a] rounded-lg border border-[#383838] p-4 overflow-y-auto max-h-96">
            <h3 className="text-[#f5f5f5] font-bold mb-3">💳 Bill</h3>
            <Bill />
          </div>
        </div>
      </div>

      <BottomNav />
    </section>
  );
};

export default Menu;
