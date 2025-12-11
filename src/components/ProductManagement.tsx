// frontend/src/components/ProductManagement.tsx (FINAL: Product CRUD + Order Management)

import React, { useState, FormEvent, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  DollarSign,
  Package,
  X,
  Clock,
  Truck,
  ShoppingCart,
} from "lucide-react";
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetAllOrdersQuery, // ✅ Hook for Landowner orders
} from "../api/storeApi";
import { Product, Order, UserProfile } from "../types";

// --- Helper Types & Constants ---
interface ProductFormState {
  name: string;
  description: string;
  category: string;
  price: string;
  stock_quantity: string;
  image_url: string;
}
const initialFormState: ProductFormState = {
  name: "",
  description: "",
  category: "Organic",
  price: "",
  stock_quantity: "",
  image_url: "",
};
const categories = ["Organic", "Biological", "Botanical", "Chemical"];

// --- Helper Functions ---
const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const getStatusBadge = (status: Order["status"]) => {
  let color = "";
  switch (status) {
    case "Delivered":
      color = "bg-green-100 text-green-800";
      break;
    case "Shipped":
      color = "bg-blue-100 text-blue-800";
      break;
    case "Cancelled":
      color = "bg-red-100 text-red-800";
      break;
    default:
      color = "bg-yellow-100 text-yellow-800";
  }
  return (
    <span
      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}
    >
      {status}
    </span>
  );
};

export const ProductManagement: React.FC = () => {
  // RTK Query Hooks
  const {
    data: products,
    isLoading: isLoadingProducts,
    error: fetchError,
  } = useGetProductsQuery(undefined);
  const { data: orders, isLoading: isLoadingOrders } =
    useGetAllOrdersQuery(undefined); // Fetch ALL customer orders

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  // UI State: Tab selection and Modal/Form state
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<ProductFormState>(initialFormState);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Sync form state when starting an edit operation
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || "",
        description: editingProduct.description || "",
        category: editingProduct.category || categories[0],
        price: String(editingProduct.price || ""),
        stock_quantity: String(editingProduct.stock_quantity || ""),
        image_url: editingProduct.image_url || "",
      });
      setShowModal(true);
    } else {
      setFormData(initialFormState);
    }
  }, [editingProduct]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock_quantity),
    };
    if (
      isNaN(payload.price) ||
      isNaN(payload.stock_quantity) ||
      payload.price < 0 ||
      payload.stock_quantity < 0
    ) {
      alert("Price and Stock must be valid non-negative numbers.");
      return;
    }

    try {
      if (editingProduct) {
        await updateProduct({
          productId: editingProduct._id,
          updates: payload,
        }).unwrap();
        alert(`Product ${payload.name} updated successfully!`);
      } else {
        await createProduct(payload).unwrap();
        alert(`Product ${payload.name} created successfully!`);
      }
      setShowModal(false);
      setEditingProduct(null);
    } catch (err) {
      console.error("Product operation failed:", err);
      const errorDetail =
        (err as any).data?.detail ||
        "An unexpected error occurred during product management.";
      alert(`Failed: ${errorDetail}`);
    }
  };

  const handleDelete = async (productId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      try {
        await deleteProduct(productId).unwrap();
        alert("Product deleted successfully.");
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Failed to delete product.");
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData(initialFormState);
  };

  // UI Render Logic
  if (isLoadingProducts || isLoadingOrders) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />{" "}
        <span className="ml-3 text-lg text-gray-600">
          Loading management data...
        </span>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="p-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">
        Error loading data: {(fetchError as any).error}
      </div>
    );
  }

  // --- RENDER BLOCK ---

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Store Management Dashboard
      </h1>

      {/* Tab Navigation */}
      <div className="mb-6 flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("products")}
          className={`pb-3 font-semibold transition-colors flex items-center space-x-2 ${
            activeTab === "products"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Package className="w-5 h-5" />
          <span>Product Catalog ({products?.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-3 font-semibold transition-colors flex items-center space-x-2 ${
            activeTab === "orders"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Customer Orders ({orders?.length || 0})</span>
        </button>
      </div>

      {/* --- 1. PRODUCT MANAGEMENT TAB --- */}
      {activeTab === "products" && (
        <>
          <div className="flex justify-end items-center mb-4">
            <button
              onClick={() => {
                setEditingProduct(null);
                setShowModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              disabled={isCreating || isUpdating}
            >
              <Plus className="w-5 h-5" />
              <span>Add New Product</span>
            </button>
          </div>
          {/* Product List Table */}
          <div className="bg-white rounded-xl shadow-md overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price (₹)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products?.length ? (
                  products.map((product) => (
                    <tr key={product._id}>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.category === "Organic"
                              ? "bg-green-100 text-green-800"
                              : product.category === "Chemical"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        ₹{product.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">{product.stock_quantity}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No products listed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* --- 2. ORDER MANAGEMENT TAB --- */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-xl shadow-md overflow-x-auto p-4">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Customer Order Details
          </h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items/Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date/Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address/Contact
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders?.length ? (
                orders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {order._id.slice(-6)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {/* Customer Name, Email, Phone are populated via user_id */}
                      <p className="font-medium text-gray-900">
                        {(order.user_id as UserProfile)?.full_name || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(order.user_id as UserProfile)?.email}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {order.items.map((item, index) => (
                        <div key={index} className="text-xs">
                          {item.quantity}x **
                          {(item.product_id as Product)?.name}**
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 font-bold text-green-700">
                      ₹{order.total_amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="mb-1">{getStatusBadge(order.status)}</div>
                      <div className="text-xs text-gray-500">
                        {formatDate(order.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <p className="text-xs text-gray-700">
                        {(order.user_id as UserProfile)?.address?.city || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Ph: {(order.user_id as UserProfile)?.phone || "N/A"}
                      </p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No customer orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleFormSubmit}>
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-green-500"
                    required
                  />
                </div>
                {/* Product Category (Dropdown based on Mongoose Enum) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 bg-white"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Price and Stock Quantity */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <DollarSign className="w-4 h-4 inline mr-1" /> Price (₹) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-green-500"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Package className="w-4 h-4 inline mr-1" /> Stock Quantity
                      *
                    </label>
                    <input
                      type="number"
                      name="stock_quantity"
                      value={formData.stock_quantity}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-green-500"
                      required
                      min="0"
                    />
                  </div>
                </div>
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-green-500"
                  />
                </div>
                {/* Image URL (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-green-500"
                    placeholder="http://example.com/image.jpg"
                  />
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="p-6 border-t flex justify-end space-x-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isCreating || isUpdating ? (
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                  ) : null}
                  {editingProduct ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
