// frontend/src/features/cart/cartSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the shape of a single cart entry
interface CartState {
    // Key: Product ID (string)
    // Value: Quantity (number)
    items: { [productId: string]: number };
}

const initialState: CartState = {
    // Cart data structure: { 'product_id_1': 2, 'product_id_2': 1, ... }
    items: {},
};

export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        /**
         * Adds one unit of a product to the cart. Creates the entry if it doesn't exist.
         * Payload: productId (string)
         */
        addItem: (state, action: PayloadAction<string>) => {
            const productId = action.payload;
            state.items[productId] = (state.items[productId] || 0) + 1;
        },

        /**
         * Removes one unit of a product from the cart. Deletes the entry if quantity hits zero.
         * Payload: productId (string)
         */
        removeItem: (state, action: PayloadAction<string>) => {
            const productId = action.payload;
            if (state.items[productId] > 1) {
                state.items[productId] -= 1;
            } else {
                // If quantity is 1 or less, delete the entry entirely
                delete state.items[productId];
            }
        },

        /**
         * Sets a specific quantity for a product. Deletes the entry if quantity is zero or less.
         * Payload: { productId: string, quantity: number }
         */
        setQuantity: (state, action: PayloadAction<{ productId: string, quantity: number }>) => {
            const { productId, quantity } = action.payload;
            if (quantity > 0) {
                state.items[productId] = quantity;
            } else {
                delete state.items[productId];
            }
        },

        /**
         * Clears all items from the cart.
         */
        clearCart: (state) => {
            state.items = {};
        },
    },
});

// Export the actions for use in components (e.g., dispatch(addItem('id')))
export const { addItem, removeItem, setQuantity, clearCart } = cartSlice.actions;

// Export the reducer for configuration in the store
export default cartSlice.reducer;