// frontend/src/types.ts

// =========================================================
// 1. CORE USER & AUTHENTICATION TYPES
// =========================================================
export type Role = 'farmer' | 'landowner' | 'admin';

// Data structure stored in Redux for the active session
export interface AuthUser {
    id: string;
    role: Role;
    full_name: string;
}

// Redux Auth Slice State
export interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    user: AuthUser | null;
}

// RTK Query Response when logging in or signing up
export interface AuthResponse {
    message: string;
    token: string;
    role: Role;
    user_id: string; // Renamed from _id in the database response
    full_name: string;
}

export interface LoginResponse extends AuthResponse {}
export interface SignupResponse extends AuthResponse {}


// =========================================================
// 2. LOCATION & ADDRESS TYPES (Structured for MongoDB GeoJSON)
// =========================================================

// MongoDB GeoJSON Point structure
export interface Coordinates {
    type: 'Point';
    values: [number, number]; // [longitude, latitude]
}

// Full structured address used in UserProfile and Land
export interface Address {
    street_address: string;
    city: string;
    state_province: string;
    postal_code: string;
    country: string;
    coordinates: Coordinates;
    landmark?: string;
    parcel_id?: string;
}

// User profile data retrieved from /api/profile/:id
export interface UserProfile {
    _id: string;
    email: string;
    full_name: string;
    role: Role;
    phone: string;
    address?: Address; 
    created_at: string;
    updated_at: string;
}

// =========================================================
// 3. LAND MANAGEMENT TYPES
// =========================================================

// Land structure retrieved from /api/lands
export interface Land {
    _id: string;
    owner_id: string;
    title: string;
    description: string;
    location: Address; // Uses the structured address
    area: number;
    price_per_acre: number;
    soil_type: string;
    water_availability: 'high' | 'medium' | 'low' | 'seasonal';
    status: 'available' | 'rented' | 'maintenance';
    created_at: string;
    updated_at: string;
}

// Data type for creating a new land listing (excluding server-generated fields)
export type NewLandData = Omit<
    Land, 
    '_id' | 'owner_id' | 'created_at' | 'updated_at' | 'status'
>;


// =========================================================
// 4. STORE / ORDER TYPES
// =========================================================

// Basic structure for a product item in the store
export interface Product {
    _id: string;
    name: string;
    description?: string;
    category: 'Organic' | 'Biological' | 'Botanical' | 'Chemical';
    price: number;
    stock_quantity: number;
    image_url?: string;
}

// Item details within an order
export interface OrderItem {
    product_id: string; // ObjectId of the Product
    quantity: number;
    price_at_purchase: number;
}

// Order structure
export interface Order {
    _id: string;
    user_id: string;
    items: OrderItem[];
    total_amount: number;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    created_at: string;
}