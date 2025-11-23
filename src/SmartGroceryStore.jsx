import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbw0rSM-NKvRGJfLis5THYdB9hu0AtCUuzdVg8LOTD3g3RHWUsOxnap6NxHMX_KnuWTk/exec";
const PINK = "#E5156B";
const BLUE = "#174060";
const CATEGORIES = {
  Grocery: [
    { id: "butter", name: "Butter", price: 3.5, img: "Butter.webp" },
    { id: "rice", name: "Rice", price: 3.0, img: "Rice.webp" },
    { id: "lentils", name: "Lentils", price: 2.5, img: "Lentils.webp" },
    { id: "sugar", name: "Sugar", price: 1.8, img: "Sugar.webp" },
    { id: "spice", name: "Spice", price: 2.2, img: "Spice.webp" },
    { id: "vinegar", name: "Vinegar", price: 1.7, img: "Vinegar.webp" },
  ],
  Medicines: [
    { id: "antacid", name: "Antacid", price: 2.3, img: "Antacid.webp" },
    { id: "paracetamol", name: "Paracetamol", price: 1.0, img: "Paracetamol.webp" },
  ],
  Snacks: [
    { id: "chocolate", name: "Chocolate", price: 4.0, img: "Chocolate.webp" },
    { id: "potato_chips", name: "Potato chips", price: 1.8, img: "Potato chips.webp" },
    { id: "biscuit", name: "Biscuit", price: 1.5, img: "Biscuit.webp" },
    { id: "bread", name: "Bread", price: 2.0, img: "Bread.webp" },
    { id: "noodles", name: "Noodles", price: 1.2, img: "Noodles.webp" },
  ],
  Drinks: [
    { id: "fruit_juice", name: "Fruit juice", price: 2.0, img: "Juice.webp" },
    { id: "cold_drinks", name: "Cold drinks", price: 1.5, img: "Drinks.webp" },
  ],
  Oil: [{ id: "cooking_oil", name: "Cooking oil", price: 4.5, img: "Oil.webp" }],
};

const ALL_PRODUCTS = Object.values(CATEGORIES).flat();

function formatUSD(v) {
  return v.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
export default function SmartGrocery() {
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [thankYouVisible, setThankYouVisible] = useState(false);
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Visa");
  const [deliveryMethod, setDeliveryMethod] = useState("Drone");
  const categoryRefs = useRef(
    Object.fromEntries(Object.keys(CATEGORIES).map((c) => [c, React.createRef()]))
  );
  const addToCart = (product) => {
    setCart((prev) => {
      const f = prev.find((p) => p.id === product.id);
      if (f) return prev.map((p) => (p.id === product.id ? { ...p, qty: p.qty + 1 } : p));
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }];
    });
  };
  const changeQty = (id, delta) => {
    setCart((prev) =>
      prev.flatMap((p) => {
        if (p.id !== id) return p;
        const newQty = p.qty + delta;
        if (newQty <= 0) return [];
        return [{ ...p, qty: newQty }];
      })
    );
  };
  const clearCart = () => setCart([]);
  const subtotal = cart.reduce((a, b) => a + b.price * b.qty, 0);
  const shipping = subtotal > 0 ? 2.99 : 0;
  const totalAmount = subtotal + shipping;
  const openCategory = (cat) =>
    categoryRefs.current[cat]?.current?.scrollIntoView({ behavior: "smooth" });
  /* input handlers */
  const handleUserIdChange = (v) => setUserId(v.replace(/\D/g, ""));
  const handleAddressChange = (v) => {
    if (deliveryMethod === "Drone") {
      setAddress(v.replace(/\D/g, ""));
    } else {
      setAddress(v);
    }
  };
//  g- sheet payload builder
  const buildProductColumns = () => {
    const map = {
      Chocolate: 0,
      "Potato chips": 0,
      Biscuit: 0,
      Bread: 0,
      Noodles: 0,
      Butter: 0,
      Antacid: 0,
      Paracetamol: 0,
      Rice: 0,
      Lentils: 0,
      Sugar: 0,
      Spice: 0,
      "Cooking oil": 0,
      "Cold drinks": 0,
      "Fruit juice": 0,
      Vinegar: 0,
    };
    cart.forEach((it) => {
      const prod = ALL_PRODUCTS.find((p) => p.id === it.id);
      if (!prod) return;
      const key = Object.keys(map).find((k) => k.toLowerCase() === prod.name.toLowerCase());
      if (key) map[key] = it.qty;
    });
    return map;
  };
  const buildSheetPayload = () => ({
    Timestamp: new Date().toISOString(),
    Name: name.trim(),
    "User ID": userId.trim(),
    Address: deliveryMethod === "Drone" ? address.trim() : "",
    Method: paymentMethod,
    "Total amount": totalAmount.toFixed(2),
    ...buildProductColumns(),
    Status: "Pending",
    items: cart,
  });
// submit order
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // === VALIDATION ===
    if (!name.trim()) return alert("Please enter your name");
    if (!userId.trim()) return alert("Please enter your User ID");
    if (!/^\d+$/.test(userId)) return alert("User ID must contain numbers only");

    if (deliveryMethod === "Drone") {
      if (!address.trim()) return alert("Drone delivery requires an address");
      if (!/^\d+$/.test(address)) return alert("Drone address must be numbers only");
    }

    if (cart.length === 0) return alert("Your cart is empty");

    const payload = buildSheetPayload();
    setLoading(true);

    try {
      await fetch(SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      //  Resets everything
      setCart([]);
      setName("");
      setUserId("");
      setAddress("");
      setPaymentMethod("Visa");
      setDeliveryMethod("Drone");

      setShowCheckout(false);
      setShowCartDrawer(false);

      // Then show thank you
      setThankYouVisible(true);
      setTimeout(() => setThankYouVisible(false), 3200);

    } catch (err) {
      console.error(err);
      alert("Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen antialiased" style={{ background: "linear-gradient(180deg,#fffafc,#fffefe)" }}>
      {/* header */}
      <header className="sticky top-2 z-50 bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <img src="Logo.webp" width="62" className="rounded" />
            <div>
              <div className="font-extrabold text-lg lg:text-x" style={{ color: BLUE }}>
                Smart Grocery Store
              </div>
              <p className="text-sm lg:text-sm text-gray-500">Smarter • Faster • Easier way to shop</p>
            </div>
          </div>
          {/* CART ICON WITH BADGE */}
          <button
            className="relative p-3 rounded-lg border bg-white active:scale-95"
            onClick={() => setShowCartDrawer(true)}
          >
            🛒
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 text-xs bg-pink-600 text-white px-2 py-0.5 rounded-full">
                {cart.length}
              </span>
            )}
          </button>
        </div>
        {/* Category nav */}
        <div className="overflow-x-auto border-t py-2 px-4 flex gap-3 md:gap-6 lg:mx-40">
          {Object.keys(CATEGORIES).map((cat) => (
            <button
              key={cat}
              className="text-sm px-3 py-1 rounded-full bg-white border"
              onClick={() => openCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>
      {/* hero */}
      <section className="max-w-7xl mx-auto px-4 mt-8 grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-4xl font-extrabold mb-4" style={{ color: BLUE }}>
            Get Fresh Groceries, Delivered Smartly
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            Shop grocery items,your favourite snacks ,& medicine in emergency with smooth checkout and Drone delivery.
          </p>
          <div className="flex mt-10 gap-3">
            <button
              onClick={() => openCategory("Grocery")}
              className="px-4 py-2 rounded-md text-white font-semibold"
              style={{ background: PINK }}
            >
              Shop Grocery
            </button>
            <button
              onClick={() => openCategory("Medicines")}
              className="px-4 py-2 rounded-md border font-semibold"
              style={{ color: BLUE }}
            >
              Shop Medicines
            </button>
          </div>
        </div>
        <img
          src="Project Pic.webp"
          className="w-full h-72 object-cover rounded-xl shadow"
        />
      </section>
      {/* product grid */}
      <main className="max-w-7xl mx-auto px-4 mt-10">
        {Object.entries(CATEGORIES).map(([cat, items]) => (
          <section key={cat} ref={categoryRefs.current[cat]} className="mb-14">
            <h3 className="text-2xl font-bold mb-4" style={{ color: BLUE }}>
              {cat}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((p) => (
                <div key={p.id} className="bg-white border rounded-xl shadow-sm p-3">
                  <img
                    src={p.img}
                    className="w-full h-36 object-cover rounded-lg mb-3"
                  />
                  <div className="font-semibold" style={{ color: BLUE }}>
                    {p.name}
                  </div>
                  <div className="text-sm font-semibold mb-2" style={{ color: PINK }}>
                    {formatUSD(p.price)}
                  </div>
                  <button
                    onClick={() => addToCart(p)}
                    className="w-full py-2 rounded-lg text-white font-semibold"
                    style={{ background: PINK }}
                  >
                    Add to cart
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
      {/* mobile car drawer */}
      <AnimatePresence>
        {showCartDrawer && (
          <>
            {/* Background overlay */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-[70]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCartDrawer(false)}
            />
            {/* Sliding drawer */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 z-[80] shadow-2xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 140 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold" style={{ color: BLUE }}>
                  Your Cart
                </h3>
                <button onClick={() => setShowCartDrawer(false)}>✖</button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {cart.length === 0 && (
                  <p className="text-gray-500 text-sm">Cart is empty</p>
                )}
                {cart.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center border-b py-2"
                  >
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-gray-500">
                        {p.qty} × {formatUSD(p.price)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="px-2 py-1 border rounded"
                        onClick={() => changeQty(p.id, -1)}
                      >
                        -
                      </button>
                      <span>{p.qty}</span>
                      <button
                        className="px-2 py-1 border rounded"
                        onClick={() => changeQty(p.id, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <div className="flex justify-between font-medium mb-1">
                  <span>Subtotal</span>
                  <span>{formatUSD(subtotal)}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span>Shipping</span>
                  <span>{formatUSD(shipping)}</span>
                </div>
                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full py-3 rounded-lg font-semibold text-white"
                  style={{ background: PINK }}
                >
                  Checkout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* thanks popup */}
      <AnimatePresence>
        {thankYouVisible && (
          <motion.div
            className="fixed right-4 top-32 bg-white p-4 rounded-xl shadow-xl border-l-4"
            style={{ borderColor: PINK }}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
          >
            <div className="font-bold" style={{ color: BLUE }}>
              Thanks for shopping!
            </div>
            <p className="text-gray-600 text-sm">
              Your order has been received!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      {/* footer */}
      <footer className="mt-20 text-center py-10 text-sm text-gray-500">
        © {new Date().getFullYear()} Team Increvo — Smart Grocery Store
      </footer>

      {/* checkout modal */}
      <AnimatePresence>
      {showCheckout && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-end justify-center md:items-center"
      onClick={() => setShowCheckout(false)}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white w-full md:w-[480px] rounded-t-3xl md:rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold" style={{ color: BLUE }}>
            Checkout
          </h2>
          <button
            onClick={() => setShowCheckout(false)}
            className="text-gray-500 hover:text-gray-800 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handlePlaceOrder} className="space-y-5">
          {/* name*/}
          <div>
            <label className="text-sm text-gray-600">Full Name</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Santiago Albarto"
            />
          </div>

          {/* user id */}
          <div>
            <label className="text-sm text-gray-600">User ID (numbers only)</label>
            <input
              required
              type="text"
              inputMode="numeric"
              value={userId}
              onChange={(e) => handleUserIdChange(e.target.value)}
              className="mt-1 w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="019283746"
            />
          </div>

          {/* delivery method */}
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Delivery Method</label>
            <div className="grid grid-cols-2 gap-3">
              {["Drone", "StorePickup"].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setDeliveryMethod(method)}
                  className={`py-3 rounded-xl border-2 font-medium transition-all ${
                    deliveryMethod === method
                      ? "border-pink-600 bg-pink-50 text-pink-700"
                      : "border-gray-300"
                  }`}
                >
                  {method === "Drone" ? "Drone Delivery" : "Store Pickup"}
                </button>
              ))}
            </div>
          </div>

          {/* address */}
          <div>
            <label className="text-sm text-gray-600">
              Address {deliveryMethod === "Drone" ? "(numbers only)" : "(optional)"}
            </label>
            <textarea
              required={deliveryMethod === "Drone"}
              value={address}
              onChange={(e) => handleAddressChange(e.target.value)}
              rows={2}
              className="mt-1 w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder={
                deliveryMethod === "Drone"
                  ? "e.g. 472819 (your drone drop code)"
                  : "Road 12, Block C, Bashundhara"
              }
            />
          </div>

          {/* payment mathod */}
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Payment Method</label>
            <div className="grid grid-cols-3 gap-3">
              {["Visa", "MasterCard", "Amex"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`py-3 rounded-xl border-2 font-medium transition-all ${
                    paymentMethod === m
                      ? "border-pink-600 bg-pink-50 text-pink-700"
                      : "border-gray-300"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatUSD(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{formatUSD(shipping)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total</span>
              <span style={{ color: PINK }}>{formatUSD(totalAmount)}</span>
            </div>
          </div>

          {/* bsuttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowCheckout(false)}
              className="flex-1 py-4 border border-gray-300 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 rounded-xl font-bold text-white shadow-lg disabled:opacity-70"
              style={{ background: PINK }}
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
    
      )}
      </AnimatePresence>
    </div>
    
  );
}