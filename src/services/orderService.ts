import * as XLSX from 'xlsx';

export interface OrderDetails {
    orderId: string;
    userId: string;
    customerName: string;
    email: string;
    phone: string;
    address: {
        street: string;
        city: string;
        state: string;
        pincode: string;
    };
    products: {
        id: string;
        name: string;
        quantity: number;
        price: number;
    }[];
    totalAmount: number;
    paymentMethod: 'COD';
    orderDate: string;
    status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered';
}

class OrderService {
    private readonly filePath = 'orders.xlsx';
    private orders: OrderDetails[] = [];

    constructor() {
        this.loadOrders();
    }

    private loadOrders() {
        try {
            const workbook = XLSX.readFile(this.filePath);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            this.orders = XLSX.utils.sheet_to_json(worksheet);
        } catch (error) {
            console.log('No existing orders file found. Will create new on first order.');
            this.orders = [];
        }
    }

    private saveOrders() {
        const worksheet = XLSX.utils.json_to_sheet(this.orders);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
        XLSX.writeFile(workbook, this.filePath);
    }

    addOrder(order: OrderDetails) {
        this.orders.push(order);
        this.saveOrders();
        return order.orderId;
    }

    getOrders() {
        return this.orders;
    }

    getOrderById(orderId: string) {
        return this.orders.find(order => order.orderId === orderId);
    }

    getOrdersByUserId(userId: string) {
        return this.orders.filter(order => order.userId === userId);
    }

    updateOrderStatus(orderId: string, status: OrderDetails['status']) {
        const order = this.orders.find(o => o.orderId === orderId);
        if (order) {
            order.status = status;
            this.saveOrders();
            return true;
        }
        return false;
    }
}

export const orderService = new OrderService();