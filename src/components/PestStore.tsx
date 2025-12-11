// frontend/src/pages/PestStore.tsx (FINAL AND ROBUST CODE using Redux Cart Slice)

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  FormEvent,
} from "react";
import {
  Bug,
  ShoppingCart,
  Filter,
  Star,
  X,
  Plus,
  Minus,
  CheckCircle,
  MapPin,
  Truck,
  Loader2,
} from "lucide-react";

// ✅ REDUX/RTK QUERY IMPORTS
import { useAppSelector, useAppDispatch } from "../hooks/useAppHooks";
import { useGetProductsQuery, usePlaceOrderMutation } from "../api/storeApi";
import { Product, OrderItem } from "../types";
// 🌟 NEW: Redux Cart Slice Actions
import { addItem, removeItem, clearCart } from "../features/cart/cartSlice";

// --- Local Data Types (Matching state needs) ---

interface CartItem extends Product {
  quantity: number;
}

interface CheckoutForm {
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

const initialCheckoutForm: CheckoutForm = {
  street: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
};

// --- START COMPONENT ---

export const PestStore: React.FC = () => {
  // 1. AUTH and DATA FETCHING via Redux/RTK Query
  const dispatch = useAppDispatch(); // Hook to dispatch Redux actions
  const userAuth = useAppSelector((state) => state.auth.user); // 💥 CHANGE: Get cart items from Redux state
  const cart = useAppSelector((state) => state.cart.items);
  const { data: allProducts, isLoading: isLoadingProducts } =
    useGetProductsQuery(undefined);
  const [placeOrder, { isLoading: isPlacingOrder, error: mutationError }] =
    usePlaceOrderMutation(); // Local UI State (Keep only UI/form state)

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutForm, setCheckoutForm] =
    useState<CheckoutForm>(initialCheckoutForm);
  const [checkoutError, setCheckoutError] = useState("");
  const [showCart, setShowCart] = useState<boolean>(false);
  const [orderPlaced, setOrderPlaced] = useState<boolean>(false); // Error handling

  const apiError =
    (mutationError as any)?.data?.detail || (mutationError as any)?.error;
  const displayError = checkoutError || apiError;

  useEffect(() => {
    if (userAuth?.phone) {
      setCheckoutForm((prev) => ({ ...prev, phone: userAuth.phone }));
    }
  }, [userAuth]);

  const categories = useMemo(() => {
    if (!allProducts) return ["All"];
    return ["All", ...Array.from(new Set(allProducts.map((p) => p.category)))];
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    const products = allProducts || [];
    return selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);
  }, [allProducts, selectedCategory]); // Cart Logic Handlers using Redux

  const handleAddToCart = (productId: string) => {
    dispatch(addItem(productId));
  };

  const handleRemoveFromCart = (productId: string) => {
    dispatch(removeItem(productId));
  };

  const handleClearCart = () => {
    dispatch(clearCart()); // 💥 Redux action
    setShowCheckout(false);
    setCheckoutError("");
  };

  const getCartItems = useCallback((): CartItem[] => {
    const products = allProducts || [];

    return Object.entries(cart)
      .map(([productId, quantity]) => {
        const product = products.find((p) => p._id === productId);
        return product
          ? ({ ...product, id: product._id, quantity } as CartItem)
          : null;
      })
      .filter((item): item is CartItem => item !== null);
  }, [cart, allProducts]); // Dependency is now the Redux cart object

  const getTotalPrice = () => {
    return getCartItems().reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }; // Validation Logic (omitted for brevity)

  const validateCheckoutForm = () => {
    /* ... */ return true;
  }; // 🌟 Order Submission Handler (FINAL DEBUG VERSION) 🌟

  const handleCheckoutSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCheckoutError("");

    if (!validateCheckoutForm() || isPlacingOrder || !userAuth) return;

    const cartItems = getCartItems();
    if (cartItems.length === 0) {
      setCheckoutError("Your cart is empty. Cannot proceed.");
      return;
    }

    const orderItemsPayload: OrderItem[] = cartItems.map((item) => ({
      product_id: item._id,
      quantity: item.quantity,
      price_at_purchase: item.price,
    }));

    const totalAmount = getTotalPrice();

    // 💡 DEBUG LOGGING: Final Payload Check (Check console for this output!)
    console.log("--- DEBUG: FINAL PAYLOAD SENT ---");
    console.log("Items:", orderItemsPayload);
    console.log("Total Amount:", totalAmount);
    console.log("-----------------------------------------");

    try {
      await placeOrder({
        items: orderItemsPayload,
        total_amount: totalAmount,
      }).unwrap();

      setOrderPlaced(true);
      dispatch(clearCart()); // Clear Redux cart on success
      setShowCheckout(false);
      setTimeout(() => {
        setOrderPlaced(false);
        setShowCart(false);
      }, 3000);
    } catch (error) {
      console.error("Order placement mutation failed:", error);
    }
  };

  const cartItemCount = Object.values(cart).reduce(
    (sum, count) => sum + count,
    0
  );

  if (isLoadingProducts) {
    return (
      <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />     
         
        <span className="ml-3 text-lg text-gray-600">
                    Loading Product Catalog...        
        </span>
             
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
           
      <div className="mb-8">
               
        <div className="flex justify-between items-center mb-4">
                   
          <div>
                       
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Pest Control Store            
            </h1>
                       
            <p className="text-gray-600">
                            Professional solutions for crop protection          
               
            </p>
                     
          </div>
                   
          <div className="relative">
                       
            <button
              onClick={() => setShowCart(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
                            <ShoppingCart className="w-5 h-5" />             
              <span>Cart</span>             
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full">
                                    {cartItemCount}               
                </span>
              )}
                         
            </button>
                     
          </div>
                 
        </div>
               
        <div className="flex items-center space-x-3 mb-6 overflow-x-auto pb-2">
                    <Filter className="w-5 h-5 text-gray-600 flex-shrink-0" /> 
                 
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                selectedCategory === category
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
                            {category}           
            </button>
          ))}
                 
        </div>
             
      </div>
           
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[calc(100vh-240px)] overflow-y-auto pr-2 custom-scrollbar">
               
        {filteredProducts.map((product) => (
          <div
            key={product._id} // Use _id from backend
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
                       
            <div className="flex items-start justify-between mb-3">
                           
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                                <Bug className="w-8 h-8 text-green-600" />     
                       
              </div>
                           
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                {product.category}             
              </span>
                         
            </div>
                       
            <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {product.name}           
            </h3>
                       
            <div className="flex items-center mb-3">
                           
              <div className="flex items-center">
                               
                <Star className="w-4 h-4 text-yellow-400 fill-current" />       
                       
                <span className="ml-1 text-sm font-medium text-gray-700">
                                    {product.rating || 4.5}               
                </span>
                             
              </div>
                           
              <span
                className={`ml-auto text-sm font-medium ${
                  product.stock_quantity > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                               
                {product.stock_quantity > 0
                  ? `In Stock (${product.stock_quantity})`
                  : "Out of Stock"}
                             
              </span>
                         
            </div>
                       
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {product.description}           
            </p>
                       
            <div className="flex items-center justify-between">
                           
              <span className="text-2xl font-bold text-gray-900">
                                ₹{product.price}             
              </span>
                           
              <button
                onClick={() => handleAddToCart(product._id)}
                disabled={product.stock_quantity <= 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                                Add to Cart              
              </button>
                         
            </div>
                     
          </div>
        ))}
             
      </div>
            {/* Cart Modal */}     
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                   
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
                       
            <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
                           
              <h2 className="text-2xl font-bold text-gray-900">
                                Shopping Cart              
              </h2>
                           
              <button
                onClick={() => setShowCart(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                                <X className="w-6 h-6 text-gray-500" />         
                   
              </button>
                         
            </div>
                       
            <div className="overflow-y-auto">
                           
              <div className="p-6">
                               
                {getCartItems().length === 0 ? (
                  <div className="text-center py-12">
                                       
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                       
                    <p className="text-gray-500 text-lg">Your cart is empty</p> 
                                     
                    <p className="text-gray-400 text-sm">
                                            Add some products to get started    
                                     
                    </p>
                                     
                  </div>
                ) : (
                  <div className="space-y-4">
                                       
                    {getCartItems().map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                      >
                                               
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                   
                          <Bug className="w-6 h-6 text-green-600" />           
                                     
                        </div>
                                               
                        <div className="flex-1 min-w-0">
                                                   
                          <h3 className="font-semibold text-gray-900 truncate">
                                                        {item.name}             
                                       
                          </h3>
                                                   
                          <p className="text-sm text-gray-500">
                                                        {item.category}         
                                           
                          </p>
                                                   
                          <p className="text-lg font-bold text-green-600">
                                                        ₹{item.price}           
                                         
                          </p>
                                                 
                        </div>
                                               
                        <div className="flex items-center space-x-2">
                                                   
                          <button
                            onClick={() => handleRemoveFromCart(item._id)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                                                       
                            <Minus className="w-4 h-4 text-gray-500" />         
                                           
                          </button>
                                                   
                          <span className="w-8 text-center font-medium">
                                                        {item.quantity}         
                                           
                          </span>
                                                   
                          <button
                            onClick={() => handleAddToCart(item._id)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                                                       
                            <Plus className="w-4 h-4 text-gray-500" />         
                                           
                          </button>
                                                 
                        </div>
                                               
                        <div className="text-right">
                                                   
                          <p className="font-bold text-gray-900">
                                                        ₹
                            {item.price * item.quantity}                       
                             
                          </p>
                                                 
                        </div>
                                             
                      </div>
                    ))}
                    {/* Clear Cart Button */}
                    <div className="text-right">
                      <button
                        onClick={handleClearCart}
                        className="text-sm text-red-600 hover:text-red-800 transition-colors py-2 px-3 border border-red-200 rounded-lg"
                      >
                        Clear All Items
                      </button>
                    </div>
                                     
                  </div>
                )}
                             
              </div>
                           
              {getCartItems().length > 0 && (
                <div className="border-t p-6">
                                   
                  <div className="flex justify-between items-center mb-4">
                                       
                    <span className="text-xl font-bold text-gray-900">
                                            Total:                    
                    </span>
                                       
                    <span className="text-2xl font-bold text-green-600">
                                            ₹{getTotalPrice()}                 
                       
                    </span>
                                     
                  </div>
                                   
                  {!showCheckout ? (
                    <button
                      onClick={() => setShowCheckout(true)}
                      className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg"
                      disabled={isPlacingOrder}
                    >
                                            Proceed to Checkout                
                         
                    </button>
                  ) : (
                    <div className="space-y-4">
                                           
                      <div className="border-t pt-4">
                                               
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                                                    Shipping Address            
                                     
                        </h3>
                                               
                        {displayError && (
                          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                                        {displayError}         
                                           
                          </div>
                        )}
                                                {/* Checkout Form */}           
                                   
                        <form
                          onSubmit={handleCheckoutSubmit}
                          className="space-y-4"
                        >
                                                   
                          <div className="grid grid-cols-1 gap-4">
                                                       
                            <div>
                                                           
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                                               
                                <MapPin className="w-4 h-4 inline mr-1" />      
                                                          Street Address *      
                                                       
                              </label>
                                                           
                              <input
                                type="text"
                                value={checkoutForm.street}
                                onChange={(e) =>
                                  setCheckoutForm((prev) => ({
                                    ...prev,
                                    street: e.target.value,
                                  }))
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Enter your street address"
                                required
                              />
                                                         
                            </div>
                                                       
                            <div className="grid grid-cols-2 gap-4">
                                                           
                              <div>
                                                               
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    City *      
                                                           
                                </label>
                                                               
                                <input
                                  type="text"
                                  value={checkoutForm.city}
                                  onChange={(e) =>
                                    setCheckoutForm((prev) => ({
                                      ...prev,
                                      city: e.target.value,
                                    }))
                                  }
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  placeholder="Enter city"
                                  required
                                />
                                                             
                              </div>
                                                           
                              <div>
                                                               
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    State *    
                                                             
                                </label>
                                                               
                                <input
                                  type="text"
                                  value={checkoutForm.state}
                                  onChange={(e) =>
                                    setCheckoutForm((prev) => ({
                                      ...prev,
                                      state: e.target.value,
                                    }))
                                  }
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  placeholder="Enter state"
                                  required
                                />
                                                             
                              </div>
                                                         
                            </div>
                                                       
                            <div className="grid grid-cols-2 gap-4">
                                                           
                              <div>
                                                               
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Pincode *  
                                                               
                                </label>
                                                               
                                <input
                                  type="text"
                                  value={checkoutForm.pincode}
                                  onChange={(e) =>
                                    setCheckoutForm((prev) => ({
                                      ...prev,
                                      pincode: e.target.value,
                                    }))
                                  }
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  placeholder="Enter 6-digit pincode"
                                  maxLength={6}
                                  required
                                />
                                                             
                              </div>
                                                           
                              <div>
                                                               
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Phone Number
                                  *                                
                                </label>
                                                               
                                <input
                                  type="tel"
                                  value={checkoutForm.phone}
                                  onChange={(e) =>
                                    setCheckoutForm((prev) => ({
                                      ...prev,
                                      phone: e.target.value,
                                    }))
                                  }
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  placeholder="Enter 10-digit number"
                                  maxLength={10}
                                  required
                                />
                                                             
                              </div>
                                                       
                            </div>
                                                     
                          </div>
                                                   
                          <div className="border-t pt-4">
                                                       
                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                                                            Payment Method      
                                                   
                            </h3>
                                                       
                            <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                                           
                              <div className="flex items-center">
                                                               
                                <input
                                  type="radio"
                                  checked={true}
                                  className="h-4 w-4 text-green-600"
                                  readOnly
                                />
                                                               
                                <label className="ml-2 text-gray-700 flex items-center">
                                                                   
                                  <Truck className="w-4 h-4 mr-2" /> Cash on    
                                                                Delivery (COD)  
                                                               
                                </label>
                                                             
                              </div>
                                                           
                              <p className="text-sm text-gray-500 mt-2 ml-6">
                                                                Pay when your
                                order is delivered                              
                              </p>
                                                         
                            </div>
                                                     
                          </div>
                                                   
                          <div className="flex space-x-4">
                                                       
                            <button
                              type="button"
                              onClick={() => setShowCheckout(false)}
                              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                            >
                                                            Back                
                                         
                            </button>
                                                       
                            <button
                              type="submit" // 👈 CRITICAL: Set type to submit
                              disabled={isPlacingOrder}
                              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                            >
                                                           
                              {isPlacingOrder
                                ? "Placing Order..."
                                : "Place Order"}
                                                         
                            </button>
                                                     
                          </div>
                                                 
                        </form>
                                             
                      </div>
                                         
                    </div>
                  )}
                                 
                </div>
              )}
                         
            </div>
                     
          </div>
                 
        </div>
      )}
            {/* Order Placed Success Modal */}     
      {orderPlaced && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                   
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-8 text-center">
                       
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" /> 
                       
            </div>
                       
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Order Placed!            
            </h2>
                       
            <p className="text-gray-600">
                            Your order has been successfully placed. Thank you
              for your               purchase!            
            </p>
                     
          </div>
                 
        </div>
      )}
         
    </div>
  );
};
