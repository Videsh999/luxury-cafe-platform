import express from 'express';
import mongoose from 'mongoose';
import MenuItem from '../models/MenuItem.js';

const router = express.Router();

// Expanded luxury menu data
const mockMenuItems = [
  // COFFEE
  {
    _id: "m1",
    name: "Golden Espresso",
    description: "A rich, intense shot of pure arabica with a golden crema.",
    price: 149,
    category: "Hot Coffee",
    images: [
      "/src/assets/menu/espresso.jpg",
      "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1579992357154-faf4bde95b3d?auto=format&fit=crop&q=80&w=800"
    ],
    prepTime: 3,
    rating: 4.9,
    ingredients: ["100% Arabica Beans", "Filtered Water"],
    preparationStyle: "High-pressure extraction at 9 bars.",
    chefRecommendation: "Best enjoyed immediately without sugar to appreciate the rich crema.",
    isAvailable: true,
    calories: 5,
    dietaryPreference: "Vegan",
    spiceLevel: "None",
    badge: "Popular"
  },
  {
    _id: "m2",
    name: "Velvet Latte",
    description: "Silky smooth steamed milk over a double shot of espresso.",
    price: 249,
    category: "Hot Coffee",
    images: [
      "/src/assets/menu/latte.jpg",
      "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1529892485635-2574fa3b4820?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=800"
    ],
    prepTime: 5,
    rating: 4.8,
    ingredients: ["Double Espresso", "Steamed Whole Milk", "Microfoam"],
    preparationStyle: "Hand-poured latte art with perfectly textured microfoam.",
    chefRecommendation: "Pair with a Butter Croissant for the perfect morning ritual.",
    isAvailable: true,
    calories: 190,
    dietaryPreference: "Veg",
    spiceLevel: "None",
    badge: null
  },
  {
    _id: "m3",
    name: "Classic Cappuccino",
    description: "Perfectly balanced espresso, steamed milk, and a deep layer of foam.",
    price: 229,
    category: "Hot Coffee",
    images: [
      "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1534687941688-1b05fc6a7605?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1444418185997-1145401101e0?auto=format&fit=crop&q=80&w=800"
    ],
    prepTime: 5,
    rating: 4.7,
    ingredients: ["Espresso", "Steamed Milk", "Milk Foam", "Cocoa Dust"],
    preparationStyle: "Equal parts espresso, steamed milk, and thick milk foam.",
    chefRecommendation: "Sprinkle a touch of cinnamon on top.",
    isAvailable: true,
    calories: 120,
    dietaryPreference: "Veg",
    spiceLevel: "None",
    badge: null
  },
  {
    _id: "m4",
    name: "Dark Mocha",
    description: "Rich espresso combined with premium dark chocolate and steamed milk.",
    price: 289,
    category: "Hot Coffee",
    images: [
      "/src/assets/menu/dark_mocha.png",
      "https://images.unsplash.com/photo-1578314675249-a6914fa619d0?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1596078841242-12f73caf6fdc?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1558231515-ad3f6b4e4ed6?auto=format&fit=crop&q=80&w=800"
    ],
    prepTime: 6,
    rating: 4.9,
    ingredients: ["Espresso", "Dark Chocolate", "Steamed Milk", "Whipped Cream"],
    preparationStyle: "Melted Belgian chocolate mixed directly with the hot espresso pull.",
    chefRecommendation: "Indulge as an afternoon dessert replacement.",
    isAvailable: true,
    calories: 320,
    dietaryPreference: "Veg",
    spiceLevel: "None",
    badge: null
  },
  {
    _id: "m5",
    name: "Premium Americano",
    description: "Hot water poured over a double shot of espresso for a rich, smooth finish.",
    price: 179,
    category: "Hot Coffee",
    images: [
      "https://images.unsplash.com/photo-1551030173-122aabc4489c?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1512568400610-62da28bc8a13?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1620062758129-8e42edde66f9?auto=format&fit=crop&q=80&w=800"
    ],
    prepTime: 3,
    rating: 4.6,
    ingredients: ["Double Espresso", "Hot Water"],
    preparationStyle: "Espresso poured slowly over hot water to preserve the delicate oils.",
    chefRecommendation: "Add a splash of cold cream for a smoother finish.",
    isAvailable: true,
    calories: 10,
    dietaryPreference: "Vegan",
    spiceLevel: "None",
    badge: null
  },
  {
    _id: "m6",
    name: "Artisan Cold Brew",
    description: "Slow-steeped for 24 hours for a perfectly smooth, low-acidity coffee.",
    price: 259,
    category: "Cold Brews",
    images: [
      "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1461023058943-07cb14ee473a?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800"
    ],
    prepTime: 2,
    rating: 4.9,
    ingredients: ["Cold Brewed Arabica", "Ice", "Optional Milk"],
    preparationStyle: "Steeped cold for 24 hours and triple-filtered for absolute clarity.",
    chefRecommendation: "Try it black over ice to taste the natural chocolate notes.",
    isAvailable: true,
    calories: 15,
    dietaryPreference: "Vegan",
    spiceLevel: "None",
    badge: "Popular"
  },
  {
    _id: "m7",
    name: "Ceremonial Matcha Latte",
    description: "Premium ceremonial grade matcha whisked with perfectly steamed milk.",
    price: 299,
    category: "Matcha",
    images: [
      "/src/assets/menu/matcha_latte.png",
      "https://images.unsplash.com/photo-1515823662415-e0fd0d981a44?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1536585141049-063fc434db16?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1582782782946-b35581567113?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1589396575653-c09c794ff6a6?auto=format&fit=crop&q=80&w=800"
    ],
    prepTime: 5,
    rating: 4.8,
    ingredients: ["Ceremonial Matcha", "Steamed Milk", "Honey"],
    preparationStyle: "Hand-whisked using a traditional bamboo chasen for a frothy, lump-free base.",
    chefRecommendation: "Sub for oat milk to complement the earthy notes of the matcha.",
    isAvailable: true,
    calories: 150,
    dietaryPreference: "Veg",
    spiceLevel: "None",
    badge: "Chef Recommended"
  },
  {
    _id: "m8",
    name: "Caramel Macchiato",
    description: "Vanilla syrup, steamed milk, espresso, and a rich caramel drizzle.",
    price: 279,
    category: "Hot Coffee",
    images: [
      "https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1557142046-c704a3adf364?auto=format&fit=crop&q=80&w=800"
    ],
    prepTime: 5,
    rating: 4.7,
    ingredients: ["Vanilla Syrup", "Steamed Milk", "Espresso", "Caramel Sauce"],
    preparationStyle: "Layered build starting with vanilla and milk, topped with espresso and caramel crosshatch.",
    chefRecommendation: "Do not stir—enjoy the layered flavor journey from caramel to sweet milk.",
    isAvailable: true,
    calories: 250,
    dietaryPreference: "Veg",
    spiceLevel: "None",
    badge: null
  },

  // DESSERTS
  {
    _id: "m9",
    name: "Classic Tiramisu",
    description: "Authentic Italian recipe with mascarpone, espresso-soaked ladyfingers, and cocoa.",
    price: 349,
    category: "Desserts",
    images: [
      "/src/assets/menu/tiramisu.jpg",
      "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1621305417846-9507856ddf7a?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1563805042-7684c8a9e9ce?auto=format&fit=crop&q=80&w=800"
    ],
    prepTime: 5,
    rating: 4.9,
    ingredients: ["Mascarpone Cheese", "Espresso", "Ladyfingers", "Cocoa Powder", "Marsala Wine"],
    preparationStyle: "Chilled overnight to allow the espresso and Marsala wine to infuse perfectly.",
    chefRecommendation: "Pair with a Golden Espresso for a complete Italian dessert experience.",
    isAvailable: true,
    calories: 450,
    dietaryPreference: "Veg",
    spiceLevel: "None",
    badge: "Popular"
  },
  {
    _id: "m10",
    name: "New York Cheesecake",
    description: "Dense, smooth, and creamy cheesecake with a graham cracker crust.",
    price: 299,
    category: "Desserts",
    images: [
      "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1524351199678-941a58a3df50?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1631580879668-3d84f23b7ff6?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1596489332560-644783cb2b7e?auto=format&fit=crop&q=80&w=800"
    ],
    prepTime: 5,
    rating: 4.8,
    ingredients: ["Cream Cheese", "Graham Cracker", "Vanilla", "Sugar", "Eggs"],
    preparationStyle: "Baked in a water bath for the silkiest texture, then slowly cooled.",
    chefRecommendation: "Enjoy it plain to appreciate the rich vanilla bean profile.",
    isAvailable: true,
    calories: 550,
    dietaryPreference: "Veg",
    spiceLevel: "None",
    badge: null
  },
  {
    _id: "m11",
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with a molten chocolate center, served with vanilla bean ice cream.",
    price: 389,
    category: "Desserts",
    images: [
      "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1563805042-7684c8a9e9ce?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1511381939415-e440c9c4bfa6?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=800"
    ],
    prepTime: 12,
    rating: 5.0,
    ingredients: ["Dark Chocolate", "Butter", "Eggs", "Flour", "Vanilla Ice Cream"],
    preparationStyle: "Baked to order to ensure the center remains perfectly molten.",
    chefRecommendation: "Break the center immediately to let the chocolate flow before the ice cream melts.",
    isAvailable: true,
    calories: 620,
    dietaryPreference: "Veg",
    spiceLevel: "None",
    badge: "Chef Recommended"
  },
  {
    _id: "m12",
    name: "Red Velvet Cake",
    description: "Moist red velvet sponge layered with smooth cream cheese frosting.",
    price: 329,
    category: "Desserts",
    images: [
      "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1576088219358-769aebfa15af?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&q=80&w=800"
    ],
    prepTime: 5,
    rating: 4.7,
    ingredients: ["Red Velvet Sponge", "Cream Cheese Frosting", "Cocoa"],
    preparationStyle: "Hand-frosted and dusted with red velvet crumbs.",
    chefRecommendation: "Best paired with an Artisan Cold Brew.",
    isAvailable: true,
    calories: 480,
    dietaryPreference: "Veg",
    spiceLevel: "None",
    badge: null
  },
  {
    _id: "m13",
    name: "Brownie Sundae",
    description: "Warm fudgy brownie topped with ice cream, chocolate sauce, and walnuts.",
    price: 279,
    category: "Desserts",
    images: [
      "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=800"
    ],
    prepTime: 8,
    rating: 4.8,
    ingredients: ["Chocolate Brownie", "Vanilla Ice Cream", "Chocolate Sauce", "Walnuts"],
    preparationStyle: "Brownie warmed to order, creating a delightful temperature contrast.",
    chefRecommendation: "Great for sharing with a loved one.",
    isAvailable: true,
    calories: 650,
    dietaryPreference: "Veg",
    spiceLevel: "None",
    badge: null
  },
  {
    _id: "m14",
    name: "Blueberry Cheesecake",
    description: "Classic cheesecake topped with a rich, house-made blueberry compote.",
    price: 349,
    category: "Desserts",
    images: [
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1495147466023-ac5c588e2e40?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1631580879668-3d84f23b7ff6?auto=format&fit=crop&q=80&w=800"
    ],
    prepTime: 5,
    rating: 4.8,
    ingredients: ["Cream Cheese", "Graham Crust", "Blueberry Compote"],
    preparationStyle: "Topped with a compote made from slow-cooked wild blueberries.",
    chefRecommendation: "Let it rest at room temperature for 5 minutes before eating.",
    isAvailable: true,
    calories: 520,
    dietaryPreference: "Veg",
    spiceLevel: "None",
    badge: null
  },

  // BAKERY
  {
    _id: "m15",
    name: "Butter Croissant",
    description: "Flaky, buttery, authentic French croissant baked fresh every morning.",
    price: 189,
    category: "Bakery",
    images: [
      "/src/assets/menu/croissant.jpg",
      "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1623366302587-bca280fb5d7c?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&q=80&w=800"
    ],
    prepTime: 2,
    rating: 4.9,
    ingredients: ["French Flour", "Cultured Butter", "Yeast", "Sea Salt"],
    preparationStyle: "Laminated dough rested for 48 hours for ultimate flakiness.",
    chefRecommendation: "Tear, don't cut. Perfect alongside a classic cappuccino.",
    isAvailable: true,
    calories: 280,
    dietaryPreference: "Veg",
    spiceLevel: "None",
    badge: "Popular"
  },
  {
    _id: "m16",
    name: "Chocolate Croissant",
    description: "Traditional Pain au Chocolat filled with rich dark chocolate batons.",
    price: 229,
    category: "Bakery",
    images: [
      "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1623366302587-bca280fb5d7c?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800"
    ],
    prepTime: 2,
    rating: 4.8,
    ingredients: ["French Flour", "Cultured Butter", "Dark Chocolate"],
    preparationStyle: "Baked until golden with the chocolate just slightly melted inside.",
    chefRecommendation: "Warm it up slightly to enjoy molten chocolate centers.",
    isAvailable: true,
    calories: 340,
    dietaryPreference: "Veg",
    spiceLevel: "None",
    badge: null
  },
  {
    _id: "m17",
    name: "Blueberry Muffin",
    description: "Moist vanilla muffin bursting with fresh blueberries and a streusel topping.",
    price: 159,
    category: "Bakery",
    images: [
      "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1586985289906-406988974504?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1558401391-7899b4bd5bbf?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=800"
    ],
    prepTime: 2,
    rating: 4.7,
    ingredients: ["Flour", "Fresh Blueberries", "Butter", "Sugar", "Streusel"],
    preparationStyle: "Folded gently by hand to keep the blueberries intact and juicy.",
    chefRecommendation: "Best enjoyed warm.",
    isAvailable: true,
    calories: 380,
    dietaryPreference: "Veg",
    spiceLevel: "None",
    badge: null
  },
  {
    _id: "m18",
    name: "Cinnamon Roll",
    description: "Warm, gooey cinnamon roll topped with rich cream cheese icing.",
    price: 199,
    category: "Bakery",
    images: [
      "https://images.unsplash.com/photo-1555507036-ab1f40ce88cb?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1596634591465-ee6bc5a5e3be?auto=format&fit=crop&q=80&w=800"
    ],
    prepTime: 3,
    rating: 4.9,
    ingredients: ["Flour", "Cinnamon", "Brown Sugar", "Cream Cheese Icing"],
    preparationStyle: "Rolled tight to ensure a gooey, soft center and baked to golden brown.",
    chefRecommendation: "Unroll as you eat to save the best bite for last.",
    isAvailable: true,
    calories: 450,
    dietaryPreference: "Veg",
    spiceLevel: "None",
    badge: "Chef Recommended"
  },
  {
    _id: "m19",
    name: "Almond Danish",
    description: "Flaky pastry filled with almond frangipane and topped with toasted almonds.",
    price: 219,
    category: "Bakery",
    images: [
      "https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1563805042-7684c8a9e9ce?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800"
    ],
    prepTime: 2,
    rating: 4.6,
    ingredients: ["Pastry Dough", "Almond Paste", "Toasted Almonds"],
    preparationStyle: "Filled generously with house-made frangipane.",
    chefRecommendation: "Pairs perfectly with a dark, unsweetened coffee.",
    isAvailable: true,
    calories: 360,
    dietaryPreference: "Veg",
    spiceLevel: "None",
    badge: null
  },

  // PASTA & MAIN COURSE
  {
    _id: "m20",
    name: "Black Truffle Pasta",
    description: "Handmade fettuccine tossed in a rich black truffle cream sauce with parmesan dust.",
    price: 549,
    category: "Pasta",
    images: [
      "/src/assets/menu/pasta.jpg",
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=800"
    ],
    prepTime: 15,
    rating: 5.0,
    ingredients: ["Fettuccine", "Black Truffle", "Heavy Cream", "Parmigiano-Reggiano", "Garlic"],
    preparationStyle: "Pasta is tossed directly in a heated parmesan wheel for ultimate creaminess.",
    chefRecommendation: "A robust red wine is the ideal companion for this dish.",
    isAvailable: true,
    calories: 780,
    dietaryPreference: "Veg",
    spiceLevel: "None",
    badge: "Chef Recommended"
  },
  {
    _id: "m21",
    name: "Chicken Alfredo Pasta",
    description: "Penne pasta with grilled chicken in a creamy garlic parmesan sauce.",
    price: 499,
    category: "Pasta",
    images: [
      "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1548369937-47519962c11a?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&q=80&w=800"
    ],
    prepTime: 15,
    rating: 4.7,
    ingredients: ["Penne Pasta", "Grilled Chicken", "Parmesan", "Cream", "Garlic"],
    preparationStyle: "Chicken is grilled over open flame before being sliced into the rich sauce.",
    chefRecommendation: "Ask for an extra crack of black pepper on top.",
    isAvailable: true,
    calories: 850,
    dietaryPreference: "Non-Veg",
    spiceLevel: "None",
    badge: null
  },
  {
    _id: "m22",
    name: "Spicy Arrabbiata Pasta",
    description: "Spaghetti tossed in a fiery tomato and garlic sauce with fresh basil.",
    price: 449,
    category: "Pasta",
    images: [
      "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=800"
    ],
    prepTime: 12,
    rating: 4.8,
    ingredients: ["Spaghetti", "Tomato Sauce", "Chili Flakes", "Garlic", "Fresh Basil"],
    preparationStyle: "Sauce is simmered slowly to allow the chili heat to infuse the tomatoes.",
    chefRecommendation: "Not for the faint of heart—the heat builds beautifully.",
    isAvailable: true,
    calories: 600,
    dietaryPreference: "Veg",
    spiceLevel: "Hot",
    badge: "Popular"
  },
  {
    _id: "m23",
    name: "Creamy Mushroom Pasta",
    description: "Tagliatelle in a rich sauce made from wild mushrooms and herbs.",
    price: 529,
    category: "Pasta",
    images: [
      "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=800"
    ],
    prepTime: 15,
    rating: 4.6,
    ingredients: ["Tagliatelle", "Wild Mushrooms", "Cream", "Thyme", "Garlic"],
    preparationStyle: "Mushrooms are pan-seared first to caramelize their natural sugars.",
    chefRecommendation: "The earthy flavors pair wonderfully with an Artisan Cold Brew.",
    isAvailable: true,
    calories: 720,
    dietaryPreference: "Veg",
    spiceLevel: "None",
    badge: null
  },
  {
    _id: "m24",
    name: "Gourmet Veg Lasagna",
    description: "Layers of pasta, roasted vegetables, ricotta, and mozzarella baked to perfection.",
    price: 579,
    category: "Pasta",
    images: [
      "https://images.unsplash.com/photo-1614961909013-1e2212a2ca87?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=800"
    ],
    prepTime: 20,
    rating: 4.9,
    ingredients: ["Lasagna Sheets", "Roasted Vegetables", "Ricotta", "Mozzarella", "Marinara"],
    preparationStyle: "Slow-baked until the top is bubbling and golden crisp.",
    chefRecommendation: "A heavy, satisfying dish—come hungry.",
    isAvailable: true,
    calories: 680,
    dietaryPreference: "Veg",
    spiceLevel: "Mild",
    badge: null
  },

  // BURGERS & SANDWICHES
  {
    _id: "m25",
    name: "Aura Signature Burger",
    description: "Wagyu beef patty, truffle mayo, aged cheddar, and caramelized onions on a brioche bun.",
    price: 399,
    category: "Burgers",
    images: [
      "/src/assets/menu/burger.jpg",
      "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1586816001966-79b736744398?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800"
    ],
    prepTime: 15,
    rating: 4.9,
    ingredients: ["Wagyu Beef", "Truffle Mayo", "Aged Cheddar", "Caramelized Onions", "Brioche Bun"],
    preparationStyle: "Patty is smash-seared for a crusty edge and juicy center.",
    chefRecommendation: "Do not alter the ingredients—the balance is curated perfectly.",
    isAvailable: true,
    calories: 950,
    dietaryPreference: "Non-Veg",
    spiceLevel: "None",
    badge: "Chef Recommended"
  },
  {
    _id: "m26",
    name: "Smoky Chicken Burger",
    description: "Grilled chicken breast, smoked gouda, BBQ sauce, and crispy lettuce.",
    price: 349,
    category: "Burgers",
    images: [
      "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1586816001966-79b736744398?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=800"
    ],
    prepTime: 12,
    rating: 4.7,
    ingredients: ["Grilled Chicken", "Smoked Gouda", "BBQ Sauce", "Lettuce", "Brioche Bun"],
    preparationStyle: "Chicken is brined overnight and flame-grilled.",
    chefRecommendation: "Pair with a side of sweet potato fries.",
    isAvailable: true,
    calories: 780,
    dietaryPreference: "Non-Veg",
    spiceLevel: "Medium",
    badge: null
  },
  {
    _id: "m27",
    name: "Grilled Club Sandwich",
    description: "Triple-layered sandwich with roasted turkey, bacon, lettuce, tomato, and mayo.",
    price: 299,
    category: "Burgers",
    images: [
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1481070555726-e2fe8357725c?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800"
    ],
    prepTime: 10,
    rating: 4.6,
    ingredients: ["Roasted Turkey", "Bacon", "Lettuce", "Tomato", "Mayo", "Sourdough Bread"],
    preparationStyle: "Toasted sourdough with generously stacked premium meats.",
    chefRecommendation: "Classic, reliable, and filling.",
    isAvailable: true,
    calories: 650,
    dietaryPreference: "Non-Veg",
    spiceLevel: "None",
    badge: null
  },
  {
    _id: "m28",
    name: "Crispy Paneer Burger",
    description: "Crispy fried paneer patty with spicy mayo and fresh veggies on a toasted bun.",
    price: 329,
    category: "Burgers",
    images: [
      "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1586816001966-79b736744398?auto=format&fit=crop&q=80&w=800"
    ],
    prepTime: 12,
    rating: 4.8,
    ingredients: ["Crispy Paneer Patty", "Spicy Mayo", "Lettuce", "Tomato", "Brioche Bun"],
    preparationStyle: "Paneer is flash-fried for a crispy exterior and soft, melting center.",
    chefRecommendation: "The spicy mayo cuts through the richness beautifully.",
    isAvailable: true,
    calories: 720,
    dietaryPreference: "Veg",
    spiceLevel: "Medium",
    badge: "Popular"
  },

  // PREMIUM BEVERAGES
  {
    _id: "m29",
    name: "Fresh Mint Mojito",
    description: "Refreshing mocktail with muddled fresh mint, lime, and sparkling water.",
    price: 189,
    category: "Fresh Juice",
    images: [
      "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1541544537156-7627a7a4aa1c?auto=format&fit=crop&q=80&w=800"
    ],
    prepTime: 4,
    rating: 4.7,
    ingredients: ["Fresh Mint", "Lime Juice", "Simple Syrup", "Sparkling Water"],
    preparationStyle: "Mint is gently muddled, not crushed, to avoid bitterness.",
    chefRecommendation: "The ultimate palate cleanser after a rich meal.",
    isAvailable: true,
    calories: 120,
    dietaryPreference: "Vegan",
    spiceLevel: "None",
    badge: null
  },
  {
    _id: "m30",
    name: "Belgian Hot Chocolate",
    description: "Thick, rich hot chocolate made from melted premium Belgian dark chocolate.",
    price: 249,
    category: "Tea",
    images: [
      "/src/assets/menu/hot_chocolate.png",
      "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1588611195655-6750387b9264?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1553177595-4de2bb0842b9?auto=format&fit=crop&q=80&w=800"
    ],
    prepTime: 5,
    rating: 4.9,
    ingredients: ["Belgian Dark Chocolate", "Whole Milk", "Marshmallows"],
    preparationStyle: "Made with actual melted chocolate bars, not powder, for a thicker consistency.",
    chefRecommendation: "Drink slowly; it's practically a dessert itself.",
    isAvailable: true,
    calories: 380,
    dietaryPreference: "Veg",
    spiceLevel: "None",
    badge: "Popular"
  },
  {
    _id: "m31",
    name: "Mango Passion Smoothie",
    description: "Tropical blend of fresh mangoes, passion fruit, and a hint of coconut water.",
    price: 269,
    category: "Fresh Juice",
    images: [
      "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&q=80&w=800"
    ],
    prepTime: 4,
    rating: 4.8,
    ingredients: ["Fresh Mango", "Passion Fruit", "Coconut Water"],
    preparationStyle: "Blended without ice to maintain pure fruit density and flavor.",
    chefRecommendation: "A refreshing, vibrant choice on a warm afternoon.",
    isAvailable: true,
    calories: 180,
    dietaryPreference: "Vegan",
    spiceLevel: "None",
    badge: null
  },

  // CHEF SPECIALS
  {
    _id: "m32",
    name: "Luxury Breakfast Platter",
    description: "An opulent morning spread featuring smoked salmon, avocado, poached eggs, and artisan bread.",
    price: 849,
    category: "Chef Specials",
    images: [
      "/src/assets/menu/breakfast_platter.png",
      "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=800"
    ],
    prepTime: 18,
    rating: 4.9,
    ingredients: ["Smoked Salmon", "Avocado", "Poached Eggs", "Sourdough Bread", "Hollandaise"],
    preparationStyle: "Eggs poached to a perfect medium-soft center, salmon delicately cold-smoked.",
    chefRecommendation: "The hollandaise sauce is made fresh every 2 hours—enjoy it generously.",
    isAvailable: true,
    calories: 850,
    dietaryPreference: "Non-Veg",
    spiceLevel: "None",
    badge: "Today's Special"
  },
  {
    _id: "m33",
    name: "Premium Steak Plate",
    description: "Perfectly seared Ribeye steak served with truffle mashed potatoes and asparagus.",
    price: 1499,
    category: "Chef Specials",
    images: [
      "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800"
    ],
    prepTime: 25,
    rating: 5.0,
    ingredients: ["Ribeye Steak", "Truffle Mashed Potatoes", "Asparagus", "Red Wine Jus"],
    preparationStyle: "Pan-seared and basted in garlic butter, rested for 10 minutes before serving.",
    chefRecommendation: "Best enjoyed Medium-Rare to preserve the marble flavor.",
    isAvailable: true,
    calories: 1100,
    dietaryPreference: "Non-Veg",
    spiceLevel: "None",
    badge: "Chef Recommended"
  }
];

// Get all menu items
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(mockMenuItems);
    }
    
    let items = await MenuItem.find({});
    if (items.length === 0) {
      // Seed the database with mock items if empty
      const itemsToInsert = mockMenuItems.map(item => {
        const { _id, ...rest } = item; // Remove string IDs
        return rest;
      });
      await MenuItem.insertMany(itemsToInsert);
      items = await MenuItem.find({});
    }
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create menu item (Admin only)
router.post('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const newItem = { _id: `m${mockMenuItems.length + 100}`, ...req.body };
      mockMenuItems.push(newItem);
      return res.status(201).json(newItem);
    }
    const item = new MenuItem(req.body);
    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update menu item fully (Admin only)
router.put('/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const index = mockMenuItems.findIndex(item => item._id === req.params.id);
      if (index === -1) return res.status(404).json({ message: 'Item not found' });
      mockMenuItems[index] = { ...mockMenuItems[index], ...req.body };
      return res.json(mockMenuItems[index]);
    }
    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Toggle availability status (Admin only)
router.patch('/:id/availability', async (req, res) => {
  try {
    const { isAvailable } = req.body;
    if (mongoose.connection.readyState !== 1) {
      const index = mockMenuItems.findIndex(item => item._id === req.params.id);
      if (index === -1) return res.status(404).json({ message: 'Item not found' });
      mockMenuItems[index].isAvailable = isAvailable;
      return res.json(mockMenuItems[index]);
    }
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { isAvailable },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete menu item (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const index = mockMenuItems.findIndex(item => item._id === req.params.id);
      if (index === -1) return res.status(404).json({ message: 'Item not found' });
      mockMenuItems.splice(index, 1);
      return res.json({ message: 'Item deleted successfully' });
    }
    const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
