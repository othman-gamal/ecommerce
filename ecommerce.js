// ecommerce.js

// ===== Product Classes =====
class Product {
    constructor(name, price, quantity) {
        this.name = name;
        this.price = price;
        this.quantity = quantity;
    }

    isExpired() {
        return false;
    }

    isShippable() {
        return false;
    }

    getName() {
        return this.name;
    }

    getWeight() {
        return 0;
    }

    reduceQuantity(qty) {
        if (this.quantity < qty) {
            throw new Error(`${this.name} is out of stock`);
        }
        this.quantity -= qty;
    }
}

class PerishableProduct extends Product {
    constructor(name, price, quantity, expiryDate, weight = 0) {
        super(name, price, quantity);
        this.expiryDate = new Date(expiryDate);
        this.weight = weight;
    }

    isExpired() {
        const today = new Date();
        return this.expiryDate < today;
    }

    isShippable() {
        return true;
    }

    getWeight() {
        return this.weight;
    }
}

class ShippableProduct extends Product {
    constructor(name, price, quantity, weight) {
        super(name, price, quantity);
        this.weight = weight;
    }

    isShippable() {
        return true;
    }

    getWeight() {
        return this.weight;
    }
}

// ===== Cart & Customer =====
class CartItem {
    constructor(product, quantity) {
        this.product = product;
        this.quantity = quantity;
    }

    getTotalPrice() {
        return this.product.price * this.quantity;
    }

    getProductName() {
        return this.product.name;
    }

    getWeight() {
        return this.product.getWeight() * this.quantity;
    }

    isShippable() {
        return this.product.isShippable();
    }

    isExpired() {
        return this.product.isExpired();
    }
}

class Cart {
    constructor() {
        this.items = [];
    }

    add(product, quantity) {
        if (quantity > product.quantity) {
            throw new Error(`Cannot add more than available stock for ${product.name}`);
        }

        this.items.push(new CartItem(product, quantity));
    }

    isEmpty() {
        return this.items.length === 0;
    }

    getItems() {
        return this.items;
    }

    getSubtotal() {
        return this.items.reduce((sum, item) => sum + item.getTotalPrice(), 0);
    }

    getShippableItems() {
        return this.items.filter(item => item.isShippable());
    }

    getTotalWeight() {
        return this.getShippableItems().reduce((total, item) => total + item.getWeight(), 0);
    }
}

class Customer {
    constructor(name, balance) {
        this.name = name;
        this.balance = balance;
    }

    pay(amount) {
        if (this.balance < amount) {
            throw new Error(`Insufficient balance. Required: ${amount}, Available: ${this.balance}`);
        }
        this.balance -= amount;
    }

    getBalance() {
        return this.balance;
    }
}

// ===== Shipping Service =====
class ShippingService {
    static ship(items) {
        console.log('\n** Shipment notice **');
        items.forEach(item => {
            console.log(`${item.quantity}x ${item.getProductName()} \t ${item.getWeight()}g`);
        });
        const totalWeight = items.reduce((sum, item) => sum + item.getWeight(), 0);
        console.log(`Total package weight ${(totalWeight / 1000).toFixed(1)}kg`);
    }
}

// ===== Checkout Process =====
function checkout(customer, cart) {
    if (cart.isEmpty()) {
        throw new Error("Cart is empty");
    }

    for (const item of cart.getItems()) {
        if (item.isExpired()) {
            throw new Error(`${item.getProductName()} is expired`);
        }
        item.product.reduceQuantity(item.quantity);
    }

    const subtotal = cart.getSubtotal();
    const shippingFee = cart.getTotalWeight() > 0 ? 30 : 0;
    const total = subtotal + shippingFee;

    customer.pay(total);

    // Ship items
    const shippableItems = cart.getShippableItems();
    if (shippableItems.length > 0) {
        ShippingService.ship(shippableItems);
    }

    // Print receipt
    console.log('\n** Checkout receipt **');
    cart.getItems().forEach(item => {
        console.log(`${item.quantity}x ${item.getProductName()} \t ${item.getTotalPrice()}`);
    });
    console.log('----------------------');
    console.log(`Subtotal \t ${subtotal}`);
    console.log(`Shipping \t ${shippingFee}`);
    console.log(`Amount \t\t ${total}`);
    console.log(`Customer Balance \t ${customer.getBalance()}`);
}

// ======== DEMO / TEST ========
try {
    const cheese = new PerishableProduct("Cheese", 100, 5, "2025-08-01", 200);
    const biscuits = new PerishableProduct("Biscuits", 150, 2, "2025-08-01", 700);
    const tv = new ShippableProduct("TV", 300, 10, 10000);
    const scratchCard = new Product("Scratch Card", 50, 10); // No shipping, no expiry

    const customer = new Customer("Ali", 1000);
    const cart = new Cart();

    // Add items
    cart.add(cheese, 2);
    cart.add(biscuits, 1);
    cart.add(scratchCard, 1);

    // Checkout
    checkout(customer, cart);
} catch (err) {
    console.error("ERROR:", err.message);
}
