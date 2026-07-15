import React, { useEffect, useRef } from "react";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { FiPlus, FiMinus } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { removeItem, updateItemQuantity } from "../../redux/slices/cartSlice";

const CartInfo = () => {
  const cartData = useSelector((state) => state.cart);
  const scrolLRef = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    if (scrolLRef.current) {
      scrolLRef.current.scrollTo({
        top: scrolLRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [cartData]);

  const handleRemove = (itemId) => dispatch(removeItem(itemId));
  const changeQty = (item, delta) =>
    dispatch(updateItemQuantity({ id: item.id, quantity: item.quantity + delta }));

  return (
    <div className="bg-white text-gray-900 rounded-lg px-4 py-3">
      <h1 className="text-lg text-gray-900 font-bold tracking-wide">Order Details</h1>
      <div className="mt-3 overflow-y-scroll scrollbar-hide h-[340px]" ref={scrolLRef}>
        {cartData.length === 0 ? (
          <p className="text-gray-500 text-sm flex justify-center items-center h-[340px]">
            Your cart is empty. Start adding items!
          </p>
        ) : (
          cartData.map((item) => (
            <div key={item.id} className="bg-gray-100 rounded-lg px-4 py-3 mb-2">
              <div className="flex items-center justify-between">
                <h1 className="text-gray-900 font-semibold text-md">{item.name}</h1>
                <p className="text-gray-900 font-bold">PKR {item.price}</p>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-2 py-1">
                  <button onClick={() => changeQty(item, -1)} className="text-gray-700 hover:text-black">
                    <FiMinus size={16} />
                  </button>
                  <span className="text-gray-900 text-sm w-6 text-center font-semibold">{item.quantity}</span>
                  <button onClick={() => changeQty(item, 1)} className="text-gray-700 hover:text-black">
                    <FiPlus size={16} />
                  </button>
                </div>
                <button onClick={() => handleRemove(item.id)} className="text-red-500 hover:text-red-600">
                  <RiDeleteBin2Fill size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CartInfo;
