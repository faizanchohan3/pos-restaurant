import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

const ShopSelector = () => {
  const [shops] = useState([
    { id: 1, name: "Main Branch" },
    { id: 2, name: "Mall Branch" },
  ]);
  const [selectedShop, setSelectedShop] = useState(1);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleShopChange = (shopId) => {
    setSelectedShop(shopId);
    setShowDropdown(false);
    // Store in localStorage for persistence
    localStorage.setItem("selectedShop", shopId);
  };

  const currentShop = shops.find(s => s.id === selectedShop);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 bg-[#2a2a2a] hover:bg-[#383838] text-white px-4 py-2 rounded-lg font-semibold border border-[#383838]"
      >
        🏪 {currentShop?.name || "Select Shop"}
      </button>

      {showDropdown && (
        <div className="absolute top-12 right-0 bg-[#343434] rounded-lg shadow-lg overflow-hidden border border-[#383838] w-48 z-40">
          {shops.map(shop => (
            <button
              key={shop.id}
              onClick={() => handleShopChange(shop.id)}
              className={`w-full text-left px-4 py-3 font-semibold text-sm ${
                selectedShop === shop.id ? "text-[#f5f5f5] bg-[#383838]" : "text-[#ababab]"
              } hover:bg-[#383838] hover:text-[#f5f5f5]`}
            >
              {selectedShop === shop.id ? "✓ " : ""}{shop.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopSelector;
