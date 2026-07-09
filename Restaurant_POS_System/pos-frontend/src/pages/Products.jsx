import React, { useState, useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import { enqueueSnackbar } from "notistack";
import { FiTrash2, FiEdit2, FiPlus } from "react-icons/fi";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const Products = () => {
  const { user, role } = useSelector(state => state.user);
  // Get current shop from localStorage
  const currentShopId = parseInt(localStorage.getItem("selectedShop")) || 1;

  const [products, setProducts] = useState([
    { id: 1, name: "Paneer Tikka", category: "Appetizers", price: 280, image: "🍢", description: "Grilled paneer pieces", shop_id: 1 },
    { id: 2, name: "Butter Chicken", category: "Main Course", price: 380, image: "🍗", description: "Creamy chicken curry", shop_id: 1 },
    { id: 3, name: "Biryani", category: "Main Course", price: 320, image: "🍚", description: "Fragrant rice dish", shop_id: 1 },
    { id: 4, name: "Gulab Jamun", category: "Desserts", price: 150, image: "🍮", description: "Sweet milk solids", shop_id: 1 },
    { id: 5, name: "Samosa", category: "Appetizers", price: 80, image: "🥟", description: "Crispy fried pastry", shop_id: 1 },
  ]);
  const [categories] = useState([
    { id: 1, name: "Appetizers" },
    { id: 2, name: "Main Course" },
    { id: 3, name: "Desserts" },
    { id: 4, name: "Beverages" },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "Appetizers",
    price: "",
    image: "🍽️",
    description: "",
  });

  useEffect(() => {
    document.title = "POS | Products";
  }, []);

  if (role !== "Admin") {
    return <Navigate to="/" />;
  }

  // Filter products by current shop only
  const shopProducts = products.filter(p => p.shop_id === currentShopId);

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) {
      enqueueSnackbar("Please fill all required fields", { variant: "warning" });
      return;
    }

    if (editingId) {
      setProducts(products.map(p => p.id === editingId ? { ...p, ...formData, id: editingId, price: parseFloat(formData.price) } : p));
      enqueueSnackbar("Product updated!", { variant: "success" });
      setEditingId(null);
    } else {
      const newProduct = {
        id: Math.max(...products.map(p => p.id), 0) + 1,
        ...formData,
        price: parseFloat(formData.price),
        shop_id: currentShopId, // Current shop only
      };
      setProducts([...products, newProduct]);
      enqueueSnackbar("Product added!", { variant: "success" });
    }

    setFormData({ name: "", category: "Appetizers", price: "", image: "🍽️", description: "" });
    setShowAddModal(false);
  };

  const handleDeleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
    enqueueSnackbar("Product deleted!", { variant: "success" });
  };

  const handleEditProduct = (product) => {
    setFormData(product);
    setEditingId(product.id);
    setShowAddModal(true);
  };

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-10 py-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
            Products Management
          </h1>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: "", category: "Appetizers", price: "", image: "🍽️", description: "" });
            setShowAddModal(true);
          }}
          className="bg-yellow-400 text-gray-900 px-5 py-2 rounded-lg font-bold hover:bg-yellow-500"
        >
          + Add Product
        </button>
      </div>

      {/* Summary Card */}
      <div className="px-10 mb-4">
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#383838]">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-[#ababab] text-sm">Shop Products (Shop ID: {currentShopId})</p>
              <p className="text-white text-2xl font-bold">{shopProducts.length}</p>
            </div>
            <div>
              <p className="text-[#ababab] text-sm">Total Categories</p>
              <p className="text-yellow-400 text-2xl font-bold">{categories.length}</p>
            </div>
            <div>
              <p className="text-[#ababab] text-sm">Avg Price</p>
              <p className="text-green-400 text-2xl font-bold">PKR {shopProducts.length > 0 ? Math.round(shopProducts.reduce((sum, p) => sum + p.price, 0) / shopProducts.length).toLocaleString() : 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="flex-1 overflow-y-auto px-10 pb-8 bg-[#1f1f1f]">
        <div className="rounded-lg border border-[#383838] overflow-hidden">
          <table className="w-full text-left text-[#ababab] bg-[#1f1f1f]">
            <thead className="sticky top-0 bg-[#2a2a2a] z-10 border-b-2 border-[#383838]">
              <tr>
                <th className="px-6 py-4 text-[#f5f5f5] font-semibold text-sm">Image</th>
                <th className="px-6 py-4 text-[#f5f5f5] font-semibold text-sm">Product Name</th>
                <th className="px-6 py-4 text-[#f5f5f5] font-semibold text-sm">Category</th>
                <th className="px-6 py-4 text-[#f5f5f5] font-semibold text-sm">Price</th>
                <th className="px-6 py-4 text-[#f5f5f5] font-semibold text-sm">Description</th>
                <th className="px-6 py-4 text-[#f5f5f5] font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shopProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-[#ababab]">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-lg mb-4">📦 No products in this shop yet</p>
                      <p className="text-sm">Click "Add Product" button to add your first item!</p>
                    </div>
                  </td>
                </tr>
              ) : (
                shopProducts.map((product, index) => (
                  <tr
                    key={product.id}
                    className="border-b border-[#383838] hover:bg-[#2a2a2a] transition even:bg-[#2a2a2a] even:bg-opacity-30"
                  >
                    <td className="px-6 py-4 text-3xl">{product.image}</td>
                    <td className="px-6 py-4 text-[#f5f5f5] font-semibold">{product.name}</td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-900 text-blue-200 px-3 py-1 rounded text-xs font-semibold">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-yellow-400 font-bold">PKR {product.price.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-[#ababab]">{product.description}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="bg-blue-600 hover:bg-blue-700 p-2 rounded text-white transition"
                        title="Edit"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="bg-red-600 hover:bg-red-700 p-2 rounded text-white transition"
                        title="Delete"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2a2a2a] rounded-lg w-full max-w-md max-h-screen overflow-y-auto border border-[#383838]">
            <div className="sticky top-0 bg-[#2a2a2a] p-6 border-b border-[#383838]">
              <h2 className="text-white text-2xl font-bold">
                {editingId ? "✏️ Edit Product" : "➕ Add New Product"}
              </h2>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <div>
                <label className="text-[#ababab] text-sm mb-2 block font-semibold">📝 Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter product name"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-yellow-400"
                  required
                />
              </div>
              <div>
                <label className="text-[#ababab] text-sm mb-2 block font-semibold">📂 Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-yellow-400"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[#ababab] text-sm mb-2 block font-semibold">💰 Price *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="Enter price"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-yellow-400"
                  required
                />
              </div>
              <div>
                <label className="text-[#ababab] text-sm mb-2 block font-semibold">🖼️ Image Emoji</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  placeholder="e.g., 🍽️, 🍗, 🍚"
                  maxLength="2"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-yellow-400"
                />
              </div>
              <div>
                <label className="text-[#ababab] text-sm mb-2 block font-semibold">✍️ Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter product description"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-yellow-400 h-20 resize-none"
                />
              </div>

              {/* Sticky Footer with Buttons */}
              <div className="flex gap-3 pt-4 border-t border-[#383838]">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingId(null);
                    setFormData({ name: "", category: "Appetizers", price: "", image: "🍽️", description: "" });
                  }}
                  className="flex-1 bg-[#383838] hover:bg-[#484848] text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  ✕ Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg font-bold transition"
                >
                  {editingId ? "✓ Update Product" : "➕ Add Product"}
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

export default Products;
