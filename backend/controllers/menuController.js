const MenuItem = require("../models/MenuItem");

// Default menu — 10 items per meal category
const DEFAULT_MENU = [
  // ── BREAKFAST (Non-Veg) ──
  { name: "Egg Omelette",         price: 40,  category: "breakfast" },
  { name: "Boiled Eggs (2 pcs)",  price: 30,  category: "breakfast" },
  { name: "Chicken Keema Paratha",price: 70,  category: "breakfast" },

  // ── BREAKFAST ──
  { name: "Idli Sambar",          price: 30,  category: "breakfast" },
  { name: "Masala Dosa",          price: 45,  category: "breakfast" },
  { name: "Poha",                 price: 25,  category: "breakfast" },
  { name: "Upma",                 price: 25,  category: "breakfast" },
  { name: "Aloo Paratha",         price: 40,  category: "breakfast" },
  { name: "Bread Omelette",       price: 35,  category: "breakfast" },
  { name: "Puri Bhaji",           price: 40,  category: "breakfast" },
  { name: "Rava Idli",            price: 30,  category: "breakfast" },
  { name: "Medu Vada",            price: 30,  category: "breakfast" },
  { name: "Cornflakes with Milk", price: 35,  category: "breakfast" },

  // ── LUNCH (Non-Veg) ──
  { name: "Chicken Biryani",      price: 130, category: "lunch" },
  { name: "Mutton Curry Rice",    price: 150, category: "lunch" },
  { name: "Fish Fry + Rice",      price: 120, category: "lunch" },
  { name: "Egg Fried Rice",       price: 90,  category: "lunch" },
  { name: "Non-Veg Thali",        price: 160, category: "lunch" },

  // ── LUNCH ──
  { name: "Dal Rice",             price: 60,  category: "lunch" },
  { name: "Rajma Chawal",         price: 70,  category: "lunch" },
  { name: "Veg Thali",            price: 90,  category: "lunch" },
  { name: "Chole Bhature",        price: 75,  category: "lunch" },
  { name: "Paneer Butter Masala", price: 95,  category: "lunch" },
  { name: "Veg Biryani",          price: 85,  category: "lunch" },
  { name: "Kadhi Chawal",         price: 65,  category: "lunch" },
  { name: "Mix Veg Curry + Roti", price: 70,  category: "lunch" },
  { name: "Egg Curry Rice",       price: 80,  category: "lunch" },
  { name: "South Indian Meals",   price: 100, category: "lunch" },

  // ── DINNER (Non-Veg) ──
  { name: "Chicken Curry + Roti", price: 130, category: "dinner" },
  { name: "Mutton Biryani",       price: 160, category: "dinner" },
  { name: "Fish Curry Rice",      price: 130, category: "dinner" },
  { name: "Egg Masala + Roti",    price: 85,  category: "dinner" },
  { name: "Chicken Fried Rice",   price: 120, category: "dinner" },

  // ── DINNER ──
  { name: "Roti Sabzi",           price: 55,  category: "dinner" },
  { name: "Paneer Curry",         price: 80,  category: "dinner" },
  { name: "Dal Makhani + Rice",   price: 75,  category: "dinner" },
  { name: "Veg Pulao",            price: 70,  category: "dinner" },
  { name: "Butter Naan + Gravy",  price: 85,  category: "dinner" },
  { name: "Fried Rice",           price: 75,  category: "dinner" },
  { name: "Palak Paneer + Roti",  price: 90,  category: "dinner" },
  { name: "Egg Bhurji + Roti",    price: 70,  category: "dinner" },
  { name: "Khichdi + Papad",      price: 55,  category: "dinner" },
  { name: "Chicken Curry Rice",   price: 110, category: "dinner" },

  // ── SNACK (Non-Veg) ──
  { name: "Chicken Roll",         price: 60,  category: "snack" },
  { name: "Egg Puff",             price: 25,  category: "snack" },
  { name: "Chicken Nuggets",      price: 70,  category: "snack" },

  // ── SNACK ──
  { name: "Samosa",               price: 15,  category: "snack" },
  { name: "Tea",                  price: 10,  category: "snack" },
  { name: "Cold Coffee",          price: 35,  category: "snack" },
  { name: "Veg Sandwich",         price: 30,  category: "snack" },
  { name: "Maggi Noodles",        price: 30,  category: "snack" },
  { name: "Bread Pakora",         price: 20,  category: "snack" },
  { name: "Lassi",                price: 25,  category: "snack" },
  { name: "Fresh Lime Soda",      price: 20,  category: "snack" },
  { name: "Banana Shake",         price: 40,  category: "snack" },
  { name: "Pav Bhaji",            price: 50,  category: "snack" },
];

exports.getMenu = async (req, res) => {
  try {
    let items = await MenuItem.find().sort({ category: 1, name: 1 });
    // Auto-seed if DB has fewer items than the default menu
    if (items.length < DEFAULT_MENU.length) {
      const existingNames = new Set(items.map(i => i.name.toLowerCase()));
      const toAdd = DEFAULT_MENU.filter(d => !existingNames.has(d.name.toLowerCase()));
      if (toAdd.length > 0) {
        const added = await MenuItem.insertMany(toAdd);
        items = [...items, ...added].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
      }
    }
    res.json(items);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createItem = async (req, res) => {
  try {
    res.status(201).json(await MenuItem.create(req.body));
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.deleteItem = async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
