// 1. Define the Blueprints (Interfaces)
export interface Product {
  id: number;
  name: string;
  price: string;
  sellerId: string;
  image: string;
  description: string;
}

export interface Seller {
  id: string;
  name: string;
  email: string;
  password?: string; // Optional so it doesn't cause issues in the UI
}

// 2. Hardcoded Sellers (3 Accounts)
export const SELLERS: Seller[] = [
  { 
    id: "seller_1", 
    name: "Alpha Designs", 
    email: "alpha@test.com", 
    password: "password123" 
  },
  { 
    id: "seller_2", 
    name: "Beta Graphics", 
    email: "beta@test.com", 
    password: "password123" 
  },
  { 
    id: "seller_3", 
    name: "Gamma Studios", 
    email: "gamma@test.com", 
    password: "password123" 
  },
];

// 3. Hardcoded Products (9 Posters)
// Each 3 posters are linked to a specific Seller ID
export const ALL_PRODUCTS: Product[] = [
  // Alpha's Products - Furniture & Seating
  { 
    id: 101, 
    name: "Scandinavian Oak Chair", 
    price: "$85", 
    sellerId: "seller_1", 
    image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=400",
    description: "A sleek, minimalist wooden chair. Its light oak finish is perfect for testing how natural textures look in your space."
  },
  { 
    id: 102, 
    name: "Velvet Accent Armchair", 
    price: "$210", 
    sellerId: "seller_1", 
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=400",
    description: "Deep emerald green upholstery. Ideal for visualizing a bold pop of color against neutral walls."
  },
  { 
    id: 103, 
    name: "Industrial Coffee Table", 
    price: "$120", 
    sellerId: "seller_1", 
    image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=400",
    description: "A low-profile table with metal legs and a reclaimed wood top. Best for center-room placement testing."
  },

  // Beta's Products - Lighting & Ambiance
  { 
  id: 304, 
  name: "Minimalist Floating Clock", 
  price: "$35", 
  sellerId: "seller_3", 
  image: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?q=80&w=400",
  description: "A borderless, matte black wall clock with silent movement. Designed to test vertical alignment and wall spacing in your virtual room."
},
  { 
    id: 202, 
    name: "Ceramic Table Lamp", 
    price: "$30", 
    sellerId: "seller_2", 
    image: "https://images.unsplash.com/photo-1534073828943-f801091bb18c?q=80&w=400",
    description: "Hand-crafted base with a linen shade. Perfect for bedside tables or sideboards."
  },
  { 
    id: 203, 
    name: "Neon Wall Sign", 
    price: "$65", 
    sellerId: "seller_2", 
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=400",
    description: "A vibrant 'Dream' neon sign. Use this to visualize how colored light interacts with your room's mood."
  },

  // Gamma's Products - Decor & Plants
  { 
    id: 301, 
    name: "Potted Monstera Deliciosa", 
    price: "$25", 
    sellerId: "seller_3", 
    image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=400",
    description: "A lush green indoor plant. Perfect for filling empty corners and testing organic shapes in your room."
  },
  { 
    id: 302, 
    name: "Abstract Canvas Art", 
    price: "$55", 
    sellerId: "seller_3", 
    image: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=400",
    description: "Large-scale wall art. Helps you determine the right size for frames on your specific wall dimensions."
  },
  { 
    id: 303, 
    name: "Full-Length Floor Mirror", 
    price: "$110", 
    sellerId: "seller_3", 
    image: "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=400",
    description: "A minimalist gold-framed mirror. Essential for testing how light reflection makes your room feel larger."
  },
];