import React, { useEffect, useState } from "react";
import { GrRadialSelected } from "react-icons/gr";
import { FaShoppingCart } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { enqueueSnackbar } from "notistack";
import { addItems } from "../../redux/slices/cartSlice";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://pos-backend-lime.vercel.app";

// Colors used to tint the category tabs (DB categories only store a name).
const TAB_COLORS = [
  "#b73e3e", "#5b45b0", "#7f167f", "#735f32",
  "#1d2569", "#285430", "#025cca", "#be3e3f",
];

const MenuContainer = () => {
  const dispatch = useDispatch();
  const shopId = localStorage.getItem("selectedShop");

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [itemCount, setItemCount] = useState(0);
  const [itemId, setItemId] = useState();

  useEffect(() => {
    const loadMenu = async () => {
      if (!shopId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/categories?shopId=${shopId}`),
          fetch(`${API_BASE_URL}/api/products?shopId=${shopId}`),
        ]);
        const catJson = await catRes.json();
        const prodJson = await prodRes.json();
        const cats = catJson.success ? catJson.data : [];
        setCategories(cats);
        setProducts(prodJson.success ? prodJson.data : []);
        if (cats.length) setSelected(cats[0]);
      } catch (error) {
        console.error("Error loading menu:", error);
        enqueueSnackbar("Failed to load menu", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };
    loadMenu();
  }, [shopId]);

  const increment = (id) => {
    setItemId(id);
    if (itemCount >= 4) return;
    setItemCount((prev) => prev + 1);
  };
  const decrement = (id) => {
    setItemId(id);
    if (itemCount <= 0) return;
    setItemCount((prev) => prev - 1);
  };

  const handleAddToCart = (item) => {
    // Clicking add-to-cart adds 1 (or the chosen count); quantity is
    // editable afterwards in the Cart / order details.
    const qty = itemId === item.id && itemCount > 0 ? itemCount : 1;
    const { name, price } = item;
    dispatch(
      addItems({
        id: item.id,
        name,
        pricePerQuantity: price,
        quantity: qty,
        price: price * qty,
      })
    );
    setItemCount(0);
    enqueueSnackbar(`${name} added`, { variant: "success" });
  };

  const productsFor = (category) =>
    products.filter((p) => p.category === category?.name);

  if (loading) {
    return <p className="text-[#ababab] px-10 py-6">Loading menu…</p>;
  }

  if (!categories.length) {
    return (
      <p className="text-[#ababab] px-10 py-6">
        No menu categories yet. Add categories and products from the Admin
        dashboard.
      </p>
    );
  }

  const selectedProducts = productsFor(selected);

  return (
    <>
      <div className="flex gap-2 px-10 py-3 w-full overflow-x-auto pb-2">
        {categories.map((menu, index) => {
          const count = productsFor(menu).length;
          return (
            <div
              key={menu.id}
              className="flex flex-col items-start justify-between p-2 rounded-lg h-[65px] min-w-max cursor-pointer hover:opacity-80 transition"
              style={{ backgroundColor: TAB_COLORS[index % TAB_COLORS.length] }}
              onClick={() => {
                setSelected(menu);
                setItemId(0);
                setItemCount(0);
              }}
            >
              <div className="flex items-center gap-1">
                <span className="text-sm">🍽️</span>
                <h1 className="text-[#f5f5f5] text-xs font-semibold">
                  {menu.name}
                </h1>
                {selected?.id === menu.id && (
                  <GrRadialSelected className="text-white" size={12} />
                )}
              </div>
              <p className="text-[#ababab] text-xs font-semibold">{count}</p>
            </div>
          );
        })}
      </div>

      <hr className="border-[#2a2a2a] border-t-2 mt-4" />

      {selectedProducts.length === 0 ? (
        <p className="text-[#ababab] px-10 py-6">
          No products in “{selected?.name}” yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 px-10 py-4 w-[100%]">
          {selectedProducts.map((item) => {
            return (
              <div
                key={item.id}
                className="flex flex-col rounded-xl overflow-hidden bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#3a3a3a] transition"
              >
                {/* Image / placeholder */}
                <div className="h-28 bg-[#232323] flex items-center justify-center overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement.innerHTML =
                          '<span style="font-size:2.25rem">🍽️</span>';
                      }}
                    />
                  ) : (
                    <span className="text-4xl">🍽️</span>
                  )}
                </div>

                <div className="p-3 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <h1 className="text-[#f5f5f5] text-base font-semibold leading-tight">
                      {item.name}
                    </h1>
                    <p className="text-[#f6b100] text-base font-bold whitespace-nowrap">
                      PKR {item.price}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center bg-[#1f1f1f] rounded-lg gap-3 px-3 py-1.5">
                      <button
                        onClick={() => decrement(item.id)}
                        className="text-yellow-500 text-xl leading-none"
                      >
                        &minus;
                      </button>
                      <span className="text-white text-sm w-4 text-center">
                        {itemId == item.id ? itemCount : "0"}
                      </span>
                      <button
                        onClick={() => increment(item.id)}
                        className="text-yellow-500 text-xl leading-none"
                      >
                        &#43;
                      </button>
                    </div>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="bg-[#2e4a40] text-[#02ca3a] p-2 rounded-lg hover:bg-[#345c4d]"
                      title="Add to cart"
                    >
                      <FaShoppingCart size={20} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default MenuContainer;
