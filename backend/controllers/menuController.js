const MenuItem = require("../models/MenuItem");

// Default menu to seed if DB is empty
const DEFAULT_MENU = [
  { name: "Idli Sambar",    price: 30, category: "breakfast" },
  { name: "Poha",           price: 25, category: "breakfast" },
  { name: "Masala Dosa",    price: 45, category: "breakfast" },
  { name: "Dal Rice",       price: 60, category: "lunch"     },
  { name: "Rajma Chawal",   price: 70, category: "lunch"     },
  { name: "Veg Thali",      price: 90, category: "lunch"     },
  { name: "Roti Sabzi",     price: 55, category: "dinner"    },
  { name: "Paneer Curry",   price: 80, category: "dinner"    },
  { name: "Samosa",         price: 15, category: "snack"     },
  { name: "Tea",            price: 10, category: "snack"     },
  { name: "Cold Coffee",    price: 35, category: "snack"     },
];

exports.getMenu = async (req, res) => {
  try {
    let items = await MenuItem.find().sort({ category: 1, name: 1 });
    // Auto-seed default menu on first load
    if (items.length === 0) {
      items = await MenuItem.insertMany(DEFAULT_MENU);
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
