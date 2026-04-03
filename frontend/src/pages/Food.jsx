import { useEffect, useState } from "react";
import API from "../api";

const CATEGORY_ICON = { breakfast: "🌅", lunch: "🍱", dinner: "🌙", snack: "☕" };

const ITEM_EMOJI = {
  // Breakfast
  "Idli Sambar": "🫓", "Masala Dosa": "🫓", "Poha": "🍚", "Upma": "🍜",
  "Aloo Paratha": "🫓", "Bread Omelette": "🍳", "Puri Bhaji": "🫓",
  "Rava Idli": "🫓", "Medu Vada": "🍩", "Cornflakes with Milk": "🥣",
  "Egg Omelette": "🍳", "Boiled Eggs (2 pcs)": "🥚", "Chicken Keema Paratha": "🫓",
  // Lunch
  "Dal Rice": "🍚", "Rajma Chawal": "🍚", "Veg Thali": "🍽️",
  "Chole Bhature": "🫓", "Paneer Butter Masala": "🍛", "Veg Biryani": "🍛",
  "Kadhi Chawal": "🍚", "Mix Veg Curry + Roti": "🍛", "Egg Curry Rice": "🍳",
  "South Indian Meals": "🍽️",
  "Chicken Biryani": "🍗", "Mutton Curry Rice": "🍖", "Fish Fry + Rice": "🐟",
  "Egg Fried Rice": "🍳", "Non-Veg Thali": "🍽️",
  // Dinner
  "Roti Sabzi": "🫓", "Paneer Curry": "🍛", "Dal Makhani + Rice": "🍚",
  "Veg Pulao": "🍛", "Butter Naan + Gravy": "🫓", "Fried Rice": "🍛",
  "Palak Paneer + Roti": "🍛", "Egg Bhurji + Roti": "🍳",
  "Khichdi + Papad": "🍚", "Chicken Curry Rice": "🍗",
  "Chicken Curry + Roti": "🍗", "Mutton Biryani": "🍖", "Fish Curry Rice": "🐟",
  "Egg Masala + Roti": "🍳", "Chicken Fried Rice": "🍗",
  // Snack
  "Samosa": "🥟", "Tea": "☕", "Cold Coffee": "🧃", "Veg Sandwich": "🥪",
  "Maggi Noodles": "🍜", "Bread Pakora": "🥞", "Lassi": "🥛",
  "Fresh Lime Soda": "🍋", "Banana Shake": "🍌", "Pav Bhaji": "🍞",
  "Chicken Roll": "🌯", "Egg Puff": "🥐", "Chicken Nuggets": "🍗",
};

export default function Food({ user }) {
  const [orders, setOrders]   = useState([]);
  const [menu, setMenu]       = useState([]);
  const [cart, setCart]       = useState({});
  const [mealType, setMealType] = useState("lunch");
  const [tab, setTab]         = useState("order");
  const [menuForm, setMenuForm] = useState({ name: "", price: "", category: "lunch" });
  const [editItem, setEditItem] = useState(null); // item being edited

  useEffect(() => {
    API.get("/food").then(r => setOrders(r.data)).catch(() => {});
    API.get("/menu").then(r => setMenu(r.data)).catch(() => {});
  }, []);

  const addToCart = (item) => setCart(c => ({ ...c, [item._id]: { ...item, qty: (c[item._id]?.qty || 0) + 1 } }));
  const removeFromCart = (id) => {
    const updated = { ...cart };
    if (updated[id]?.qty > 1) updated[id].qty--;
    else delete updated[id];
    setCart(updated);
  };

  const cartItems = Object.values(cart).filter(i => i.qty > 0);
  const total = cartItems.reduce((s, i) => s + i.price * i.qty, 0);

  const placeOrder = async () => {
    if (!cartItems.length) return alert("Cart is empty");
    try {
      const res = await API.post("/food", {
        items: cartItems.map(i => ({ name: i.name, price: i.price, qty: i.qty })),
        totalAmount: total, mealType, studentName: user.name,
      });
      setOrders([res.data, ...orders]);
      setCart({}); setTab("orders");
      alert("Order placed successfully!");
    } catch (err) { alert(err?.response?.data?.message || "Failed to place order"); }
  };

  // Admin: save new or edited item
  const saveMenuItem = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        const res = await API.put(`/menu/${editItem._id}`, menuForm);
        setMenu(menu.map(m => m._id === editItem._id ? res.data : m));
        setEditItem(null);
      } else {
        const res = await API.post("/menu", menuForm);
        setMenu([...menu, res.data]);
      }
      setMenuForm({ name: "", price: "", category: "lunch" });
    } catch (err) { alert(err?.response?.data?.message || "Failed to save"); }
  };

  const deleteMenuItem = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await API.delete(`/menu/${id}`);
      setMenu(menu.filter(m => m._id !== id));
      const updated = { ...cart }; delete updated[id]; setCart(updated);
    } catch (err) { alert("Failed to delete"); }
  };

  const toggleAvailable = async (item) => {
    const res = await API.put(`/menu/${item._id}`, { available: !item.available });
    setMenu(menu.map(m => m._id === item._id ? res.data : m));
  };

  const startEdit = (item) => {
    setEditItem(item);
    setMenuForm({ name: item.name, price: item.price, category: item.category });
    setTab("menu");
  };

  const filteredMenu = menu.filter(m => m.category === mealType && m.available !== false);
  const statusBadge = (s) => s === "delivered" ? "badge-success" : s === "ready" ? "badge-info" : "badge-warning";

  return (
    <div className="page">
      <div className="section-header">
        <h2 className="section-title">🍽️ Canteen & Food</h2>
        <div className="tabs" style={{ margin: 0 }}>
          <button className={`tab ${tab === "order" ? "active" : ""}`} onClick={() => setTab("order")}>Order Food</button>
          <button className={`tab ${tab === "orders" ? "active" : ""}`} onClick={() => setTab("orders")}>My Orders</button>
          {user.role !== "student" && (
            <>
              <button className={`tab ${tab === "manage" ? "active" : ""}`} onClick={() => setTab("manage")}>Manage Orders</button>
              <button className={`tab ${tab === "menu" ? "active" : ""}`} onClick={() => { setTab("menu"); setEditItem(null); setMenuForm({ name: "", price: "", category: "lunch" }); }}>📝 Edit Menu</button>
            </>
          )}
        </div>
      </div>

      {tab === "order" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
          <div>
            <div className="tabs">
              {["breakfast", "lunch", "dinner", "snack"].map(m => (
                <button key={m} className={`tab ${mealType === m ? "active" : ""}`}
                  onClick={() => setMealType(m)} style={{ textTransform: "capitalize" }}>{m}</button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
              {filteredMenu.map(item => (
                <div key={item._id} className="card" style={{ textAlign: "center", padding: "14px 10px" }}>
                  <div style={{ fontSize: "1.8rem", marginBottom: 6 }}>
                    {ITEM_EMOJI[item.name] || CATEGORY_ICON[item.category]}
                  </div>
                  <p style={{ fontWeight: 600, fontSize: "0.82rem", marginBottom: 2, lineHeight: 1.3 }}>{item.name}</p>
                  <p style={{ color: "var(--text3)", fontSize: "0.78rem", margin: "4px 0 10px", fontFamily: "JetBrains Mono, monospace", fontWeight: 700 }}>₹{item.price}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <button className="btn btn-outline btn-sm" style={{ padding: "3px 10px", fontSize: "1rem" }} onClick={() => removeFromCart(item._id)}>−</button>
                    <span style={{ fontWeight: 700, minWidth: 22, textAlign: "center", fontFamily: "JetBrains Mono, monospace" }}>{cart[item._id]?.qty || 0}</span>
                    <button className="btn btn-primary btn-sm" style={{ padding: "3px 10px", fontSize: "1rem" }} onClick={() => addToCart(item)}>+</button>
                  </div>
                </div>
              ))}
              {filteredMenu.length === 0 && (
                <div className="empty" style={{ gridColumn: "1/-1" }}><div className="empty-icon">🍱</div><p>No items available for this meal</p></div>
              )}
            </div>
          </div>

          <div className="card" style={{ height: "fit-content", position: "sticky", top: 80 }}>
            <h3 style={{ marginBottom: 16, fontSize: "0.95rem" }}>🛒 Cart</h3>
            {cartItems.length === 0 ? (
              <p style={{ color: "var(--text3)", fontSize: "0.875rem", textAlign: "center", padding: "20px 0" }}>Cart is empty</p>
            ) : (
              <>
                {cartItems.map(i => (
                  <div key={i.name} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: "0.875rem" }}>
                    <span>{i.name} × {i.qty}</span>
                    <span style={{ fontWeight: 600 }}>₹{i.price * i.qty}</span>
                  </div>
                ))}
                <div style={{ borderTop: "1px solid #e5e7eb", marginTop: 12, paddingTop: 12, display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                  <span>Total</span><span>₹{total}</span>
                </div>
                <button className="btn btn-success" style={{ width: "100%", justifyContent: "center", marginTop: 14 }} onClick={placeOrder}>
                  Place Order
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {(tab === "orders" || tab === "manage") && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Items</th><th>Meal</th><th>Total</th><th>Status</th><th>Date</th>
                {tab === "manage" && <th>Update</th>}
              </tr></thead>
              <tbody>
                {orders.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--text3)", padding: 32 }}>No orders</td></tr>}
                {orders.map(o => (
                  <tr key={o._id}>
                    <td>{o.studentName}</td>
                    <td>{o.items?.map(i => `${i.name}×${i.qty}`).join(", ")}</td>
                    <td style={{ textTransform: "capitalize" }}>{o.mealType}</td>
                    <td style={{ fontWeight: 600 }}>₹{o.totalAmount}</td>
                    <td><span className={`badge ${statusBadge(o.status)}`}>{o.status}</span></td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    {tab === "manage" && (
                      <td>
                        <select value={o.status} onChange={async e => {
                          const res = await API.put(`/food/${o._id}`, { status: e.target.value });
                          setOrders(orders.map(x => x._id === o._id ? res.data : x));
                        }} style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border2)", fontSize: "0.8rem" }}>
                          <option value="ordered">Ordered</option>
                          <option value="ready">Ready</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* ── ADMIN: EDIT MENU ── */}
      {tab === "menu" && user.role === "admin" && (
        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20, alignItems: "start" }}>

          {/* Add / Edit form */}
          <div className="card">
            <h3 style={{ marginBottom: 16, fontSize: "0.95rem" }}>{editItem ? "✏️ Edit Item" : "+ Add New Item"}</h3>
            <form onSubmit={saveMenuItem}>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label>Item Name</label>
                <input required placeholder="e.g. Chole Bhature" value={menuForm.name}
                  onChange={e => setMenuForm({ ...menuForm, name: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label>Price (₹)</label>
                <input required type="number" min="1" placeholder="e.g. 60" value={menuForm.price}
                  onChange={e => setMenuForm({ ...menuForm, price: Number(e.target.value) })} />
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Category</label>
                <select value={menuForm.category} onChange={e => setMenuForm({ ...menuForm, category: e.target.value })}>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary" type="submit" style={{ flex: 1, justifyContent: "center" }}>
                  {editItem ? "Save Changes" : "Add Item"}
                </button>
                {editItem && (
                  <button type="button" className="btn btn-outline" onClick={() => { setEditItem(null); setMenuForm({ name: "", price: "", category: "lunch" }); }}>Cancel</button>
                )}
              </div>
            </form>
          </div>

          {/* Current menu list grouped by category */}
          <div style={{ display: "grid", gap: 16 }}>
            {["breakfast", "lunch", "dinner", "snack"].map(cat => {
              const items = menu.filter(m => m.category === cat);
              if (!items.length) return null;
              return (
                <div key={cat} className="card">
                  <p style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: 12, textTransform: "capitalize", color: "var(--text)" }}>
                    {CATEGORY_ICON[cat]} {cat}
                  </p>
                  <div style={{ display: "grid", gap: 8 }}>
                    {items.map(item => (
                      <div key={item._id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, background: "var(--surface2)", opacity: item.available === false ? 0.5 : 1 }}>
                        <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>{ITEM_EMOJI[item.name] || CATEGORY_ICON[item.category]}</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 600, fontSize: "0.875rem" }}>{item.name}</p>
                          <p style={{ fontSize: "0.75rem", color: "var(--text3)", fontFamily: "JetBrains Mono, monospace" }}>₹{item.price}</p>
                        </div>
                        <button
                          onClick={() => toggleAvailable(item)}
                          className={`btn btn-xs ${item.available !== false ? "btn-success" : "btn-outline"}`}
                          title={item.available !== false ? "Mark unavailable" : "Mark available"}>
                          {item.available !== false ? "✅ Available" : "❌ Unavailable"}
                        </button>
                        <button className="btn btn-outline btn-xs" onClick={() => startEdit(item)}>✏️</button>
                        <button className="btn btn-danger btn-xs" onClick={() => deleteMenuItem(item._id)}>🗑️</button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
