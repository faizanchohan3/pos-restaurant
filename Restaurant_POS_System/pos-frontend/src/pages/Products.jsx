import React, { useState, useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import { enqueueSnackbar } from "notistack";
import { FiTrash2, FiEdit2 } from "react-icons/fi";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const Products = () => {
  const { user } = useSelector(state => state.user);
  const [products, setProducts] = useState([
    { id: 1, name: "Paneer Tikka", category: "Appetizers", price: 280, image: "🍢", description: "Grilled paneer pieces", shop_id: 1 },
    { id: 2, name: "Butter Chicken", category: "Main Course", price: 380, image: "🍗", description: "Creamy chicken curry", shop_id: 1 },
    { id: 3, name: "Biryani", category: "Main Course", price: 320, image: "🍚", description: "Fragrant rice dish", shop_id: 1 },
    { id: 4, name: "Gulab Jamun", category: "Desserts", price: 150, image: "🍮", description: "Sweet milk solids", shop_id: 1 },
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

  if (user?.role !== "Admin") {
    return <Navigate to="/" />;
  }

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
        shop_id: 1, // Current shop
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
              <p className="text-[#ababab] text-sm">Total Products</p>
              <p className="text-white text-2xl font-bold">{products.length}</p>
            </div>
            <div>
              <p className="text-[#ababab] text-sm">Total Categories</p>
              <p className="text-yellow-400 text-2xl font-bold">{categories.length}</p>
            </div>
            <div>
              <p className="text-[#ababab] text-sm">Avg Price</p>
              <p className="text-green-400 text-2xl font-bold">₹{Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="flex-1 overflow-auto px-10 pb-4">
        <table className="w-full text-left text-[#ababab]">
          <thead className="sticky top-0 bg-[#2a2a2a]">
            <tr className="border-b border-[#383838]">
              <th className="px-4 py-3 text-[#f5f5f5]">Image</th>
              <th className="px-4 py-3 text-[#f5f5f5]">Product Name</th>
              <th className="px-4 py-3 text-[#f5f5f5]">Category</th>
              <th className="px-4 py-3 text-[#f5f5f5]">Price</th>
              <th className="px-4 py-3 text-[#f5f5f5]">Description</th>
              <th className="px-4 py-3 text-[#f5f5f5]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-[#383838] hover:bg-[#2a2a2a]">
                <td className="px-4 py-3 text-3xl">{product.image}</td>
                <td className="px-4 py-3 text-[#f5f5f5] font-semibold">{product.name}</td>
                <td className="px-4 py-3">
                  <span className="bg-[#383838] text-[#f5f5f5] px-3 py-1 rounded text-sm">
                    {product.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-yellow-400 font-bold">₹{product.price.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm">{product.description}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="bg-blue-600 hover:bg-blue-700 p-2 rounded text-white"
                    title="Edit"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="bg-red-600 hover:bg-red-700 p-2 rounded text-white"
                    title="Delete"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2a2a2a] rounded-lg p-8 w-96 max-h-96 overflow-y-auto">
            <h2 className="text-white text-xl font-bold mb-4">
              {editingId ? "Edit Product" : "Add New Product"}
            </h2>
            <form onSubmit={handleAddProduct}>
              <div className="mb-4">
                <label className="text-[#ababab] text-sm mb-2 block">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter product name"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838]"
                />
              </div>
              <div className="mb-4">
                <label className="text-[#ababab] text-sm mb-2 block">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838]"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="text-[#ababab] text-sm mb-2 block">Price *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="Enter price"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838]"
                />
              </div>
              <div className="mb-4">
                <label className="text-[#ababab] text-sm mb-2 block">Image Emoji</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  placeholder="e.g., 🍽️, 🍗, 🍚"
                  maxLength="2"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838]"
                />
              </div>
              <div className="mb-4">
                <label className="text-[#ababab] text-sm mb-2 block">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter product description"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] h-16 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingId(null);
                  }}
                  className="flex-1 bg-[#383838] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#484848]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg font-bold hover:bg-yellow-500"
                >
                  {editingId ? "Update" : "Add"}
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
