const mongoose = require('mongoose');
const Product = require('./models/Product');
const dotenv = require('dotenv');

dotenv.config();

const sampleProducts = [
  {
    name: "Classic White Shirt",
    brand: "Raymond",
    price: 1299,
    discount: 20,
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e5ccfa627?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1596755094514-f87e5ccfa627?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1596755094514-f87e5ccfa627?w=500&h=600&fit=crop"
    ],
    description: "A classic white shirt perfect for formal and casual occasions. Made from premium cotton fabric with a comfortable fit.",
    category: "Men",
    subcategory: "Shirts",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["White", "Blue", "Black"],
    stock: 50,
    trending: true,
    newArrival: false,
    rating: 4.5,
    numReviews: 128,
    tags: ["formal", "casual", "cotton", "classic"]
  },
  {
    name: "Floral Summer Dress",
    brand: "Zara",
    price: 2499,
    discount: 30,
    images: [
      "https://images.unsplash.com/photo-1572800073768-c7e5d7b6c9b0?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1572800073768-c7e5d7b6c9b0?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1572800073768-c7e5d7b6c9b0?w=500&h=600&fit=crop"
    ],
    description: "Beautiful floral summer dress with a flattering silhouette. Perfect for beach outings and casual gatherings.",
    category: "Women",
    subcategory: "Dresses",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Floral", "Pink", "Blue"],
    stock: 30,
    trending: true,
    newArrival: true,
    rating: 4.8,
    numReviews: 89,
    tags: ["summer", "floral", "casual", "comfortable"]
  },
  {
    name: "Denim Jeans",
    brand: "Levi's",
    price: 2999,
    discount: 15,
    images: [
      "https://images.unsplash.com/photo-1542272604-784c1e2af864?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1542272604-784c1e2af864?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1542272604-784c1e2af864?w=500&h=600&fit=crop"
    ],
    description: "Classic denim jeans with a modern fit. Durable and stylish, perfect for everyday wear.",
    category: "Men",
    subcategory: "Jeans",
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Blue", "Black", "Grey"],
    stock: 40,
    trending: false,
    newArrival: false,
    rating: 4.6,
    numReviews: 203,
    tags: ["denim", "casual", "durable", "classic"]
  },
  {
    name: "Kids T-Shirt Pack",
    brand: "H&M",
    price: 899,
    discount: 25,
    images: [
      "https://images.unsplash.com/photo-1563379091339-03246991d9b5?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1563379091339-03246991d9b5?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1563379091339-03246991d9b5?w=500&h=600&fit=crop"
    ],
    description: "Pack of 3 comfortable cotton t-shirts for kids. Available in various colors and fun designs.",
    category: "Kids",
    subcategory: "T-Shirts",
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-12Y"],
    colors: ["Red", "Blue", "Green", "Yellow"],
    stock: 60,
    trending: true,
    newArrival: false,
    rating: 4.4,
    numReviews: 67,
    tags: ["kids", "cotton", "comfortable", "colorful"]
  },
  {
    name: "Sports Jacket",
    brand: "Nike",
    price: 3999,
    discount: 10,
    images: [
      "https://images.unsplash.com/photo-1556821840-3a8f8ea5b2d6?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a8f8ea5b2d6?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a8f8ea5b2d6?w=500&h=600&fit=crop"
    ],
    description: "Professional sports jacket with moisture-wicking technology. Perfect for workouts and outdoor activities.",
    category: "Unisex",
    subcategory: "Jackets",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Navy", "Grey", "Red"],
    stock: 35,
    trending: true,
    newArrival: true,
    rating: 4.7,
    numReviews: 156,
    tags: ["sports", "athletic", "moisture-wicking", "professional"]
  },
  {
    name: "Elegant Evening Gown",
    brand: "FabIndia",
    price: 4999,
    discount: 35,
    images: [
      "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=500&h=600&fit=crop"
    ],
    description: "Stunning evening gown with intricate embroidery. Perfect for weddings and special occasions.",
    category: "Women",
    subcategory: "Gowns",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Maroon", "Royal Blue", "Black", "Gold"],
    stock: 20,
    trending: false,
    newArrival: true,
    rating: 4.9,
    numReviews: 45,
    tags: ["evening", "wedding", "elegant", "embroidered"]
  },
  {
    name: "Casual Shorts",
    brand: "Tommy Hilfiger",
    price: 1599,
    discount: 20,
    images: [
      "https://images.unsplash.com/photo-1586790170043-bec4e76a8c5f?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1586790170043-bec4e76a8c5f?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1586790170043-bec4e76a8c5f?w=500&h=600&fit=crop"
    ],
    description: "Comfortable casual shorts perfect for summer. Made from breathable fabric with a stylish fit.",
    category: "Men",
    subcategory: "Shorts",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Khaki", "Navy", "Black", "Grey"],
    stock: 45,
    trending: false,
    newArrival: false,
    rating: 4.3,
    numReviews: 92,
    tags: ["casual", "summer", "comfortable", "breathable"]
  },
  {
    name: "Kids Party Wear",
    brand: "Gini & Jony",
    price: 1899,
    discount: 15,
    images: [
      "https://images.unsplash.com/photo-1515372039744-b8e02a3ae446?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1515372039744-b8e02a3ae446?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1515372039744-b8e02a3ae446?w=500&h=600&fit=crop"
    ],
    description: "Fancy party wear for kids. Comfortable yet stylish for birthday parties and celebrations.",
    category: "Kids",
    subcategory: "Party Wear",
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
    colors: ["Pink", "Blue", "White", "Black"],
    stock: 25,
    trending: false,
    newArrival: true,
    rating: 4.5,
    numReviews: 38,
    tags: ["party", "fancy", "kids", "celebration"]
  },
  {
    name: "Yoga Leggings",
    brand: "Lululemon",
    price: 2299,
    discount: 25,
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=600&fit=crop"
    ],
    description: "High-quality yoga leggings with four-way stretch. Moisture-wicking and perfect for all types of workouts.",
    category: "Women",
    subcategory: "Leggings",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Black", "Navy", "Grey", "Purple"],
    stock: 40,
    trending: true,
    newArrival: false,
    rating: 4.8,
    numReviews: 189,
    tags: ["yoga", "workout", "stretch", "athletic"]
  },
  {
    name: "Business Suit",
    brand: "Armani",
    price: 8999,
    discount: 40,
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop"
    ],
    description: "Premium business suit with perfect tailoring. Includes jacket and trousers for a complete professional look.",
    category: "Men",
    subcategory: "Suits",
    sizes: ["38R", "40R", "42R", "44R", "46R"],
    colors: ["Navy", "Charcoal", "Black", "Grey"],
    stock: 15,
    trending: false,
    newArrival: false,
    rating: 4.9,
    numReviews: 67,
    tags: ["business", "formal", "premium", "professional"]
  },
  {
    name: "Summer Sandals",
    brand: "Crocs",
    price: 999,
    discount: 30,
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=600&fit=crop"
    ],
    description: "Comfortable summer sandals perfect for beach and casual wear. Lightweight and water-resistant.",
    category: "Unisex",
    subcategory: "Footwear",
    sizes: ["6", "7", "8", "9", "10", "11"],
    colors: ["Blue", "Black", "Pink", "Green"],
    stock: 55,
    trending: true,
    newArrival: false,
    rating: 4.2,
    numReviews: 134,
    tags: ["summer", "beach", "comfortable", "casual"]
  },
  {
    name: "Winter Coat",
    brand: "Burberry",
    price: 6999,
    discount: 20,
    images: [
      "https://images.unsplash.com/photo-1551488830116-7c215c2e35c5?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551488830116-7c215c2e35c5?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551488830116-7c215c2e35c5?w=500&h=600&fit=crop"
    ],
    description: "Luxury winter coat with wool blend fabric. Warm and stylish for cold weather.",
    category: "Unisex",
    subcategory: "Coats",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Camel", "Black", "Navy", "Grey"],
    stock: 25,
    trending: false,
    newArrival: true,
    rating: 4.7,
    numReviews: 89,
    tags: ["winter", "warm", "luxury", "stylish"]
  }
];

const seedDatabase = async () => {
  try {
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    await Product.insertMany(sampleProducts);
    console.log('Sample products inserted successfully');

    console.log(`Added ${sampleProducts.length} products to the database`);
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cloths_shop');
    console.log('MongoDB Connected');
    await seedDatabase();
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

connectDB();
