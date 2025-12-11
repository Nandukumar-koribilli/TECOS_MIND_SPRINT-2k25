// frontend/src/components/OrderHistory.tsx (For Farmers)

import React from "react";
import { useGetUserOrdersQuery } from "../api/storeApi";
import { Loader2, ShoppingCart, Clock, Package, Truck, X } from "lucide-react";
import { Order } from "../types";

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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const OrderHistory: React.FC = () => {
  // Fetch orders for the authenticated user (Farmer)
  const { data: orders, isLoading, error } = useGetUserOrdersQuery(undefined);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <span className="ml-3 text-lg text-gray-600">
          Loading order history...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">
        Error loading history: {(error as any).error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
        <Truck className="w-6 h-6 mr-3 text-green-600" />
        Your Order History
      </h1>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-md">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4" />
          <p className="text-lg">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500"
            >
              <div className="flex justify-between items-start border-b pb-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order Placed On:</p>
                  <p className="font-semibold text-lg">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Status:</p>
                  {getStatusBadge(order.status)}
                </div>
              </div>

              <h3 className="font-bold text-xl text-green-700 mb-2">
                Total: ₹{order.total_amount.toLocaleString()}
              </h3>

              <p className="font-medium text-gray-800 mb-2 flex items-center">
                <Package className="w-4 h-4 mr-2" /> Items Ordered:
              </p>
              <ul className="space-y-1 pl-4 list-disc text-sm text-gray-600">
                {order.items.map((item, index) => (
                  <li key={index}>
                    {item.quantity}x **{item.product_id.name}** (₹
                    {item.price_at_purchase.toLocaleString()} each)
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
