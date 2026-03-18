import io from 'socket.io-client';

class RealtimeService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = {};
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Connect to admin server
  connect() {
    try {
      // Connect to admin server on port 5002
      this.socket = io('http://localhost:5002', {
        cors: {
          origin: "http://localhost:3000",
          methods: ["GET", "POST"]
        },
        transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
        timeout: 10000,
        forceNew: true
      });

      this.socket.on('connect', () => {
        console.log('🔌 Connected to admin server for real-time sync');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.notifyListeners('connect', { connected: true });
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected from admin server:', reason);
        this.isConnected = false;
        this.notifyListeners('disconnect', { connected: false, reason });
        
        // Auto-reconnect if not intentional disconnect
        if (reason !== 'io client disconnect' && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          setTimeout(() => this.connect(), 2000);
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
        this.isConnected = false;
        this.notifyListeners('connect_error', { error: error.message });
      });

      // Listen for product changes
      this.socket.on('product-added', (product) => {
        console.log('📦 Real-time: Product added:', product.name);
        this.notifyListeners('product-added', product);
      });

      this.socket.on('product-updated', (product) => {
        console.log('📦 Real-time: Product updated:', product.name);
        this.notifyListeners('product-updated', product);
      });

      this.socket.on('product-deleted', (productId) => {
        console.log('📦 Real-time: Product deleted:', productId);
        this.notifyListeners('product-deleted', productId);
      });

      // Listen for category changes
      this.socket.on('category-added', (category) => {
        console.log('🏷️ Real-time: Category added:', category.name);
        this.notifyListeners('category-added', category);
      });

      this.socket.on('category-updated', (category) => {
        console.log('🏷️ Real-time: Category updated:', category.name);
        this.notifyListeners('category-updated', category);
      });

      this.socket.on('category-deleted', (categoryId) => {
        console.log('🏷️ Real-time: Category deleted:', categoryId);
        this.notifyListeners('category-deleted', categoryId);
      });

      // Listen for order status changes
      this.socket.on('order-status-updated', (data) => {
        console.log('📦 Real-time: Order status updated:', data.orderId);
        this.notifyListeners('order-status-updated', data);
      });

      // Listen for message replies
      this.socket.on('message-replied', (data) => {
        console.log('💬 Real-time: Message replied:', data.messageId);
        this.notifyListeners('message-replied', data);
      });

      // Listen for coupon changes
      this.socket.on('coupon-created', (coupon) => {
        console.log('🎫 Real-time: Coupon created:', coupon.code);
        this.notifyListeners('coupon-created', coupon);
      });

      return this.socket;
    } catch (error) {
      console.error('❌ Error connecting to admin server:', error);
      return null;
    }
  }

  // Disconnect from admin server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
    }
  }

  // Add event listener
  addEventListener(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  // Remove event listener
  removeEventListener(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  // Notify all listeners
  notifyListeners(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Error in listener for ${event}:`, error);
        }
      });
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }

  // Force reconnection
  reconnect() {
    this.disconnect();
    this.reconnectAttempts = 0;
    return this.connect();
  }
}

// Create singleton instance
const realtimeService = new RealtimeService();

export default realtimeService;
