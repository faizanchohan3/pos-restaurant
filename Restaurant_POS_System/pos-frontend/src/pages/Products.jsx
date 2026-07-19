import React, { useState, useEffect } from "react";
import BackButton from "../components/shared/BackButton";
import { enqueueSnackbar } from "notistack";
import { FiTrash2, FiEdit2 } from "react-icons/fi";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://pos-backend-lime.vercel.app";

const Products = () => {
  const { role } = useSelector((state) => state.user);
  const shopId = localStorage.getItem("selectedShop");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    image: "🍽️",
  });

  useEffect(() => {
    document.title = "POS | Products";
    if (shopId) {
      fetchProducts();
      fetchCategories();
    }
  }, [shopId]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/products?shopId=${shopId}`);
      const data = await res.json();
      if (data.success) setProducts(data.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      enqueueSnackbar("Failed to load products", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories?shopId=${shopId}`);
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  if (role !== "Admin") {
    return <Navigate to="/" />;
  }

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      enqueueSnackbar("Please fill all required fields", { variant: "warning" });
      return;
    }

    try {
      const url = editingId
        ? `${API_BASE_URL}/api/products/${editingId}`
        : `${API_BASE_URL}/api/products`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          category: formData.category,
          image: formData.image,
          shopId: parseInt(shopId),
        }),
      });
      const data = await res.json();

      if (data.success) {
        enqueueSnackbar(editingId ? "Product updated!" : "Product added!", { variant: "success" });
        fetchProducts();
        setShowAddModal(false);
        setEditingId(null);
        setFormData({ name: "", category: "", price: "", image: "🍽️" });
      } else {
        enqueueSnackbar(data.message || "Operation failed", { variant: "error" });
      }
    } catch (error) {
      console.error("Error:", error);
      enqueueSnackbar("Connection error", { variant: "error" });
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        enqueueSnackbar("Product deleted!", { variant: "success" });
        fetchProducts();
      } else {
        enqueueSnackbar("Failed to delete", { variant: "error" });
      }
    } catch (error) {
      console.error("Error:", error);
      enqueueSnackbar("Connection error", { variant: "error" });
    }
  };

  const handleEditProduct = (product) => {
    setFormData({
      name: product.name,
      category: product.category || "",
      price: product.price,
      image: product.image || "🍽️",
    });
    setEditingId(product.id);
    setShowAddModal(true);
  };

  const avgPrice = products.length > 0
    ? Math.round(products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length)
    : 0;

  return (
    <section className="bg-[#1f1f1f] min-h-screen overflow-auto flex flex-col pb-10">
      <div className="flex items-center justify-between px-4 md:px-10 py-4 sticky top-0 bg-[#1f1f1f] border-b border-[#383838] z-20">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
            Products Management
          </h1>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: "", category: categories[0]?.name || "", price: "", image: "🍽️" });
            setShowAddModal(true);
          }}
          className="bg-yellow-400 text-gray-900 px-5 py-2 rounded-lg font-bold hover:bg-yellow-500"
        >
          + Add Product
        </button>
      </div>

      {/* Summary Card */}
      <div className="px-4 md:px-10 py-6">
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#383838]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-[#ababab] text-sm">Total Products</p>
              <p className="text-white text-2xl font-bold">{products.length}</p>
            </div>
            <div>
              <p className="text-[#ababab] text-sm">Categories</p>
              <p className="text-yellow-400 text-2xl font-bold">{categories.length}</p>
            </div>
            <div>
              <p className="text-[#ababab] text-sm">Avg Price</p>
              <p className="text-green-400 text-2xl font-bold">PKR {avgPrice.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="px-4 md:px-10 pb-8">
        <div className="rounded-lg border border-[#383838] overflow-hidden">
          <table className="w-full text-left text-[#ababab] bg-[#1f1f1f]">
            <thead className="bg-[#2a2a2a] border-b-2 border-[#383838]">
              <tr>
                <th className="px-6 py-4 text-[#f5f5f5] font-semibold text-sm">Image</th>
                <th className="px-6 py-4 text-[#f5f5f5] font-semibold text-sm">Product Name</th>
                <th className="px-6 py-4 text-[#f5f5f5] font-semibold text-sm">Category</th>
                <th className="px-6 py-4 text-[#f5f5f5] font-semibold text-sm">Price</th>
                <th className="px-6 py-4 text-[#f5f5f5] font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-[#ababab]">Loading...</td></tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-[#ababab]">
                    <p className="text-lg mb-2">📦 No products yet</p>
                    <p className="text-sm">Click "Add Product" to add your first item!</p>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-[#383838] hover:bg-[#2a2a2a] transition">
                    <td className="px-6 py-4 text-3xl">{product.image}</td>
                    <td className="px-6 py-4 text-[#f5f5f5] font-semibold">{product.name}</td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-900 text-blue-200 px-3 py-1 rounded text-xs font-semibold">
                        {product.category || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-yellow-400 font-bold">PKR {(product.price || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button onClick={() => handleEditProduct(product)} className="bg-blue-600 hover:bg-blue-700 p-2 rounded text-white transition">
                        <FiEdit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="bg-red-600 hover:bg-red-700 p-2 rounded text-white transition">
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
          <div className="bg-[#2a2a2a] rounded-lg w-full max-w-md border border-[#383838]">
            <div className="p-6 border-b border-[#383838]">
              <h2 className="text-white text-2xl font-bold">
                {editingId ? "✏️ Edit Product" : "➕ Add New Product"}
              </h2>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <div>
                <label className="text-[#ababab] text-sm mb-2 block font-semibold">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product name"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg border border-[#383838] focus:border-yellow-400 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[#ababab] text-sm mb-2 block font-semibold">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg border border-[#383838] focus:border-yellow-400 focus:outline-none"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <p className="text-yellow-500 text-xs mt-1">No categories yet. Add categories first.</p>
                )}
              </div>
              <div>
                <label className="text-[#ababab] text-sm mb-2 block font-semibold">Price (PKR) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="Enter price"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg border border-[#383838] focus:border-yellow-400 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[#ababab] text-sm mb-2 block font-semibold">Image Emoji</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="e.g., 🍽️, 🍗, 🍚"
                  maxLength="2"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg border border-[#383838] focus:border-yellow-400 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-[#383838]">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingId(null);
                    setFormData({ name: "", category: "", price: "", image: "🍽️" });
                  }}
                  className="flex-1 bg-[#383838] hover:bg-[#484848] text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg font-bold transition"
                >
                  {editingId ? "Update Product" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Products;
