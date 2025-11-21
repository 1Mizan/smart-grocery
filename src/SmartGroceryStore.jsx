// // src/pages/SmartGrocery.jsx
// // TailwindCSS required in your Vite + React project.
// // Replace SHEET_URL with your Google Apps Script Web App endpoint (POST).

// import React, { useEffect, useRef, useState } from "react";

// /* ============================
//   CONFIG
//    - Replace with your Apps Script Web App URL that writes POST body to Google Sheet.
//    - Example Apps Script expects JSON with fields similar to the payload below.
// ============================ */
// const SHEET_URL = ""; // <- replace with your Apps Script URL

// // Color tokens used in the component:
// const PINK = "#E5156B";
// const BLUE = "#174060";

// /* ============================
//   STORE PRODUCTS (exact categories requested)
//   Grocery: butter, rice, lentils, sugar, spice, vinegar
//   Medicines: antacid, paracetamol
//   Snacks: chocolates, potato chips, biscuit, bread, noodles
//   Drinks: fruit juice, cold drinks
//   Oil: cooking oil
// ============================ */
// const CATEGORIES = {
//   Grocery: [
//     { id: "g_butter", name: "Butter", price: 2.5, img: "https://images.unsplash.com/photo-1563805042-7684d3e2b6b4" },
//     { id: "g_rice", name: "Rice", price: 8.0, img: "https://images.unsplash.com/photo-1528825871115-3581a5387919" },
//     { id: "g_lentils", name: "Lentils", price: 3.5, img: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2" },
//     { id: "g_sugar", name: "Sugar", price: 1.8, img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587" },
//     { id: "g_spice", name: "Spice", price: 2.2, img: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38" },
//     { id: "g_vinegar", name: "Vinegar", price: 2.0, img: "https://images.unsplash.com/photo-1604908177522-7b9b4a0d3b8f" },
//   ],
//   Medicines: [
//     { id: "m_antacid", name: "Antacid", price: 1.5, img: "https://images.unsplash.com/photo-1580281657521-4e3405d57a1d" },
//     { id: "m_paracetamol", name: "Paracetamol", price: 1.2, img: "https://images.unsplash.com/photo-1599058918143-8e2c2d82d9f3" },
//   ],
//   Snacks: [
//     { id: "s_chocolates", name: "Chocolates", price: 3.5, img: "https://images.unsplash.com/photo-1571939228382-7c2672ccdc31" },
//     { id: "s_potato_chips", name: "Potato chips", price: 1.5, img: "https://images.unsplash.com/photo-1505250469679-203ad9ced0cb" },
//     { id: "s_biscuit", name: "Biscuit", price: 1.0, img: "https://images.unsplash.com/photo-1542444459-db3e6f6f9f6a" },
//     { id: "s_bread", name: "Bread", price: 1.8, img: "https://images.unsplash.com/photo-1548365328-8b1f0b3b4f8f" },
//     { id: "s_noodles", name: "Noodles", price: 0.9, img: "https://images.unsplash.com/photo-1604908177607-57c5d1e7df2b" },
//   ],
//   Drinks: [
//     { id: "d_fruit_juice", name: "Fruit juice", price: 2.5, img: "https://images.unsplash.com/photo-1572449043412-9f0b5b8e3c63" },
//     { id: "d_cold_drinks", name: "Cold drinks", price: 1.5, img: "https://images.unsplash.com/photo-1576765607924-3d4b26e5d4b9" },
//   ],
//   Oil: [
//     { id: "o_cooking_oil", name: "Cooking oil", price: 6.0, img: "https://images.unsplash.com/photo-1586201375761-83865001e8a8" },
//   ],
// };

// // create a flat array of all products for payload column generation:
// const ALL_PRODUCTS = Object.values(CATEGORIES).flat();

// /* ============================
//   UTILITIES
// ============================ */
// function formatUSD(v) {
//   return (v).toLocaleString("en-US", { style: "currency", currency: "USD" });
// }

// /* ============================
//   MAIN COMPONENT
// ============================ */
// export default function SmartGrocery() {
//   const [cart, setCart] = useState([]); // {id,name,price,qty}
//   const [showCheckout, setShowCheckout] = useState(false);
//   const [checkoutLoading, setCheckoutLoading] = useState(false);
//   const [customer, setCustomer] = useState({ name: "", userId: "", address: "" });
//   const [paymentMethod, setPaymentMethod] = useState("Visa"); // 'Visa'|'MasterCard'|'Amex'
//   const [deliveryMethod, setDeliveryMethod] = useState("Drone"); // 'Drone'|'StorePickup'
//   const [thankYouVisible, setThankYouVisible] = useState(false);

//   // initialize refs up-front so openCategory never runs into undefined
//   const categoryRefs = useRef(
//     Object.fromEntries(Object.keys(CATEGORIES).map((cat) => [cat, React.createRef()]))
//   );

//   // If you want to use a container ref later:
//   const containerRef = useRef(null);

//   // Add to cart
//   const addToCart = (product) => {
//     setCart((prev) => {
//       const found = prev.find((i) => i.id === product.id);
//       if (found) return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
//       return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }];
//     });
//   };

//   const changeQty = (id, delta) => {
//     setCart((prev) =>
//       prev.flatMap((it) => {
//         if (it.id !== id) return it;
//         const newQty = it.qty + delta;
//         if (newQty <= 0) return [];
//         return [{ ...it, qty: newQty }];
//       })
//     );
//   };

//   const removeItem = (id) => setCart((prev) => prev.filter((i) => i.id !== id));

//   const subtotal = cart.reduce((s, p) => s + p.price * p.qty, 0);
//   const shipping = subtotal > 0 ? 2.99 : 0;
//   const total = +(subtotal + shipping);

//   // Smooth scroll to category
//   const openCategory = (cat) => {
//     const ref = categoryRefs.current[cat];
//     if (ref && ref.current) {
//       ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
//     }
//   };

//   // Checkout UI helpers
//   const openCheckout = () => setShowCheckout(true);
//   const closeCheckout = () => {
//     setShowCheckout(false);
//     setCheckoutLoading(false);
//   };

//   // username (numbers only) handler
//   const handleUserIdChange = (v) => {
//     const sanitized = v.replace(/\D/g, "");
//     setCustomer((prev) => ({ ...prev, userId: sanitized }));
//   };

//   // address change: if Drone delivery we keep numbers-only (as requested)
//   const handleAddressChange = (v) => {
//     if (deliveryMethod === "Drone") {
//       const numeric = v.replace(/\D/g, "");
//       setCustomer((prev) => ({ ...prev, address: numeric }));
//     } else {
//       setCustomer((prev) => ({ ...prev, address: v }));
//     }
//   };

//   // Build product quantity map for Google Sheet columns
//   const buildProductQuantities = () => {
//     const map = {};
//     ALL_PRODUCTS.forEach((p) => (map[p.name] = 0));
//     cart.forEach((item) => {
//       const prod = ALL_PRODUCTS.find((p) => p.id === item.id);
//       if (prod) map[prod.name] = item.qty;
//     });
//     return map;
//   };

//   const handleOrderSubmit = async (e) => {
//     e.preventDefault();

//     if (!customer.name.trim() || !customer.userId.trim() || !customer.address.trim()) {
//       alert("Please fill name, username (numbers only) and address.");
//       return;
//     }
//     if (cart.length === 0) {
//       alert("Cart is empty.");
//       return;
//     }

//     // basic username numeric validation
//     if (!/^\d+$/.test(customer.userId.trim())) {
//       alert("Username must contain numbers only.");
//       return;
//     }

//     setCheckoutLoading(true);

//     // payload tailored for Google Sheets (flattened product columns + items array)
//     const productQuantities = buildProductQuantities();

//     const payload = {
//       timestamp: new Date().toISOString(),
//       name: customer.name.trim(),
//       userId: customer.userId.trim(),
//       address: customer.address.trim(),
//       paymentMethod,
//       deliveryMethod,
//       total: total.toFixed(2),
//       // flattened product quantities (like columns in your sheet screenshot)
//       productQuantities,
//       // array of items (id, name, price, qty)
//       items: cart.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
//     };

//     // Send to Google Sheets via Apps Script (replace SHEET_URL above)
//     try {
//       if (!SHEET_URL || SHEET_URL.trim() === "") {
//         console.warn("SHEET_URL not configured. Replace SHEET_URL with your Apps Script URL to store orders.");
//       } else {
//         const res = await fetch(SHEET_URL, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload),
//         });
//         if (!res.ok) {
//           console.warn("Sheet submission returned non-ok:", res.status);
//         }
//       }
//     } catch (err) {
//       console.warn("Failed to send to Google Sheets:", err);
//     }

//     // UI flow: show thank you & reset
//     setTimeout(() => {
//       setCheckoutLoading(false);
//       setThankYouVisible(true);
//       setCart([]);
//       setShowCheckout(false);
//       setCustomer({ name: "", userId: "", address: "" });
//       setPaymentMethod("Visa");
//       setDeliveryMethod("Drone");
//       setTimeout(() => setThankYouVisible(false), 3500);
//     }, 900);
//   };

//   return (
//     <div ref={containerRef} className="min-h-screen antialiased" style={{ background: "linear-gradient(180deg,#fffafc,#fffefe)" }}>
//       {/* HEADER */}
//       <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b" style={{ borderColor: "#f0f0f0" }}>
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             <div className="flex items-center gap-4">
//               <div className="rounded-md p-2" style={{ background: "#fff0f4" }}>
//                 <img src="Logo.webp" alt="Smart Grocery Store Logo" width="76" height="76" />
//               </div>
//               <div>
//                 <div className="font-extrabold text-xl" style={{ color: BLUE }}>Smart Grocery Store</div>
//                 <div className="text-sm text-gray-500">Smarter • Faster • Easier Way to Shop</div>
//               </div>
//             </div>

//             <nav className="hidden md:flex items-center gap-6">
//               {Object.keys(CATEGORIES).map((cat) => (
//                 <button
//                   key={cat}
//                   onClick={() => openCategory(cat)}
//                   className="text-sm font-medium px-2 py-1 rounded hover:underline"
//                   style={{ color: BLUE }}
//                 >
//                   {cat}
//                 </button>
//               ))}
//             </nav>

//             <div className="flex items-center gap-4">
//               <div className="hidden sm:flex flex-col text-right mr-2">
//                 <span className="text-sm font-medium" style={{ color: BLUE }}>{cart.length} items</span>
//                 <span className="text-xs text-gray-500">{formatUSD(total)}</span>
//               </div>
//               <button onClick={openCheckout} className="px-4 py-2 rounded-md text-white font-semibold shadow" style={{ background: PINK }}>
//                 Checkout
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* mobile categories: horizontally scrollable */}
//         <div className="md:hidden overflow-x-auto border-t py-2" style={{ borderColor: "#f5f5f5" }}>
//           <div className="flex gap-3 px-4">
//             {Object.keys(CATEGORIES).map((cat) => (
//               <button
//                 key={cat}
//                 onClick={() => openCategory(cat)}
//                 className="px-3 py-1 rounded-full text-sm border"
//                 style={{ borderColor: "#eee", background: "#fff" }}
//               >
//                 {cat}
//               </button>
//             ))}
//           </div>
//         </div>
//       </header>

//       {/* HERO */}
//       <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
//           <div>
//             <h2 className="text-4xl font-extrabold mb-4" style={{ color: BLUE }}>Get Fresh groceries, Get delivered smartly</h2>
//             <p className="text-lg text-gray-700 mb-6">Shop from categories above — Grocery, Medicines, Snacks, Drinks, Oil. Mobile-first responsive design and smooth checkout flow.</p>
//             <div className="flex gap-3">
//               <a onClick={() => openCategory("Grocery")} className="cursor-pointer inline-block px-5 py-2 rounded-md font-semibold" style={{ background: PINK, color: "#fff" }}>Shop Grocery</a>
//               <a onClick={() => openCategory("Medicines")} className="cursor-pointer inline-block px-5 py-2 rounded-md border" style={{ color: BLUE, borderColor: "#e6e6e6" }}>Shop Medicines</a>
//             </div>
//           </div>
//           <div className="rounded-lg overflow-hidden shadow" style={{ background: "#fff" }}>
//             <img src="https://images.unsplash.com/photo-1507679799987-c73779587ccf" alt="hero" className="w-full h-64 object-cover" />
//           </div>
//         </div>
//       </section>

//       {/* CATEGORIES + PRODUCTS */}
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pb-24">
//         {Object.entries(CATEGORIES).map(([cat, items]) => (
//           <section key={cat} ref={categoryRefs.current[cat]} id={`cat-${cat}`} className="mb-14">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-2xl font-bold" style={{ color: BLUE }}>{cat}</h3>
//               <div className="text-sm text-gray-500">{items.length} products</div>
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//               {items.map((product) => (
//                 <article key={product.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col">
//                   <div className="h-44 w-full overflow-hidden bg-gray-50">
//                     <img src={`${product.img}?auto=format&fit=crop&w=800&q=60`} alt={product.name} className="w-full h-full object-cover transition-transform duration-200 hover:scale-105" />
//                   </div>
//                   <div className="p-4 flex flex-col flex-grow">
//                     <div className="flex justify-between items-start gap-2 mb-2">
//                       <h4 className="text-lg font-semibold" style={{ color: BLUE }}>{product.name}</h4>
//                       <div className="text-sm font-semibold" style={{ color: PINK }}>{formatUSD(product.price)}</div>
//                     </div>

//                     <p className="text-xs text-gray-500 mb-4">Premium quality — perfect for daily use.</p>

//                     <div className="mt-auto flex items-center gap-3">
//                       <button onClick={() => addToCart(product)} className="flex-1 py-2 rounded-lg text-white font-semibold" style={{ background: PINK }}>
//                         Add to cart
//                       </button>
//                       <button onClick={() => addToCart(product)} className="px-3 py-2 rounded-lg border text-sm hidden sm:inline" style={{ borderColor: "#eee" }}>
//                         +1
//                       </button>
//                     </div>
//                   </div>
//                 </article>
//               ))}
//             </div>
//           </section>
//         ))}
//       </main>

//       {/* CART SUMMARY (floating on right for desktop) */}
//       <aside className="fixed right-4 bottom-8 hidden lg:block w-80 shadow-lg rounded-xl overflow-hidden" style={{ background: "#fff" }}>
//         <div className="p-4 border-b" style={{ borderColor: "#f2f2f2" }}>
//           <div className="flex justify-between items-center">
//             <div>
//               <div className="text-sm text-gray-500">Your Cart</div>
//               <div className="font-semibold" style={{ color: BLUE }}>{cart.length} items</div>
//             </div>
//             <div className="text-right">
//               <div className="text-sm text-gray-500">Total</div>
//               <div className="font-bold">{formatUSD(total)}</div>
//             </div>
//           </div>
//         </div>

//         <div className="p-3 max-h-64 overflow-y-auto">
//           {cart.length === 0 ? (
//             <div className="text-sm text-gray-500">Cart is empty</div>
//           ) : (
//             cart.map((item) => (
//               <div key={item.id} className="flex items-center justify-between gap-3 py-2 border-b" style={{ borderColor: "#f6f6f6" }}>
//                 <div>
//                   <div className="text-sm font-medium">{item.name}</div>
//                   <div className="text-xs text-gray-500">{item.qty} × {formatUSD(item.price)}</div>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <button onClick={() => changeQty(item.id, -1)} className="px-2 py-1 rounded border">-</button>
//                   <div className="px-2">{item.qty}</div>
//                   <button onClick={() => changeQty(item.id, +1)} className="px-2 py-1 rounded border">+</button>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>

//         <div className="p-4 border-t" style={{ borderColor: "#f2f2f2" }}>
//           <div className="flex justify-between mb-3"><span className="text-sm">Subtotal</span><span className="font-medium">{formatUSD(subtotal)}</span></div>
//           <div className="flex justify-between mb-4"><span className="text-sm">Shipping</span><span className="font-medium">{formatUSD(shipping)}</span></div>
//           <button onClick={() => setShowCheckout(true)} className="w-full py-2 rounded-lg font-semibold" style={{ background: PINK, color: "#fff" }}>Checkout</button>
//         </div>
//       </aside>

//       {/* MOBILE CART BAR */}
//       <div className="fixed left-0 right-0 bottom-0 z-50 lg:hidden">
//         <div className="max-w-7xl mx-auto px-4">
//           <div className="bg-white rounded-t-xl shadow-lg p-3 flex items-center justify-between">
//             <div>
//               <div className="text-sm text-gray-500">{cart.length} items</div>
//               <div className="font-semibold" style={{ color: BLUE }}>{formatUSD(total)}</div>
//             </div>
//             <div className="flex items-center gap-3">
//               <button onClick={() => setCart([])} className="px-3 py-2 rounded-md border text-sm">Clear</button>
//               <button onClick={() => setShowCheckout(true)} className="px-4 py-2 rounded-md font-semibold text-white" style={{ background: PINK }}>
//                 Checkout
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* CHECKOUT MODAL */}
//       {showCheckout && (
//         <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
//           <div className="bg-white w-[95%] sm:w-96 rounded-2xl shadow-xl p-5">
//             <h4 className="text-lg font-bold mb-3" style={{ color: BLUE }}>Checkout</h4>

//             <form onSubmit={handleOrderSubmit} className="space-y-3">
//               <div>
//                 <label className="text-sm text-gray-600">Full name</label>
//                 <input
//                   type="text"
//                   required
//                   value={customer.name}
//                   onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
//                   className="mt-1 w-full border rounded px-3 py-2 text-sm"
//                   placeholder="John Doe"
//                 />
//               </div>

//               <div>
//                 <label className="text-sm text-gray-600">Username (numbers only)</label>
//                 <input
//                   type="text"
//                   required
//                   value={customer.userId}
//                   onChange={(e) => handleUserIdChange(e.target.value)}
//                   className="mt-1 w-full border rounded px-3 py-2 text-sm"
//                   placeholder="123456"
//                   inputMode="numeric"
//                 />
//               </div>

//               <div>
//                 <label className="text-sm text-gray-600">Delivery method</label>
//                 <div className="flex gap-2 mt-2">
//                   <label className={`flex-1 border rounded px-3 py-2 text-center cursor-pointer ${deliveryMethod === "Drone" ? "ring-2 ring-offset-1" : ""}`} style={{ borderColor: "#eee" }}>
//                     <input type="radio" name="delivery" value="Drone" checked={deliveryMethod === "Drone"} onChange={() => setDeliveryMethod("Drone")} className="hidden" />
//                     <div className="text-sm font-medium">Drone Delivery</div>
//                     <div className="text-xs text-gray-500">If Drone selected, address accepts numbers only</div>
//                   </label>

//                   <label className={`flex-1 border rounded px-3 py-2 text-center cursor-pointer ${deliveryMethod === "StorePickup" ? "ring-2 ring-offset-1" : ""}`} style={{ borderColor: "#eee" }}>
//                     <input type="radio" name="delivery" value="StorePickup" checked={deliveryMethod === "StorePickup"} onChange={() => setDeliveryMethod("StorePickup")} className="hidden" />
//                     <div className="text-sm font-medium">Store Pickup</div>
//                     <div className="text-xs text-gray-500">No numeric-only restriction on address</div>
//                   </label>
//                 </div>
//               </div>

//               <div>
//                 <label className="text-sm text-gray-600">Address</label>
//                 <textarea
//                   required
//                   value={customer.address}
//                   onChange={(e) => handleAddressChange(e.target.value)}
//                   className="mt-1 w-full border rounded px-3 py-2 text-sm"
//                   placeholder={deliveryMethod === "Drone" ? "Enter numeric delivery code / location (numbers only)" : "House, Road, Area, City"}
//                 />
//               </div>

//               <div>
//                 <label className="text-sm text-gray-600">Payment method</label>
//                 <div className="flex gap-2 mt-2">
//                   <label className={`flex-1 border rounded px-3 py-2 text-center cursor-pointer ${paymentMethod === "Visa" ? "ring-2 ring-offset-1" : ""}`} style={{ borderColor: "#eee" }}>
//                     <input type="radio" name="pay" value="Visa" checked={paymentMethod === "Visa"} onChange={() => setPaymentMethod("Visa")} className="hidden" />
//                     <div className="text-sm font-medium">Visa</div>
//                     <div className="text-xs text-gray-500">Visa</div>
//                   </label>

//                   <label className={`flex-1 border rounded px-3 py-2 text-center cursor-pointer ${paymentMethod === "MasterCard" ? "ring-2 ring-offset-1" : ""}`} style={{ borderColor: "#eee" }}>
//                     <input type="radio" name="pay" value="MasterCard" checked={paymentMethod === "MasterCard"} onChange={() => setPaymentMethod("MasterCard")} className="hidden" />
//                     <div className="text-sm font-medium">MasterCard</div>
//                     <div className="text-xs text-gray-500">MasterCard</div>
//                   </label>

//                   <label className={`flex-1 border rounded px-3 py-2 text-center cursor-pointer ${paymentMethod === "Amex" ? "ring-2 ring-offset-1" : ""}`} style={{ borderColor: "#eee" }}>
//                     <input type="radio" name="pay" value="Amex" checked={paymentMethod === "Amex"} onChange={() => setPaymentMethod("Amex")} className="hidden" />
//                     <div className="text-sm font-medium">Amex</div>
//                     <div className="text-xs text-gray-500">Amex</div>
//                   </label>
//                 </div>
//               </div>

//               <div className="flex justify-between items-center mt-2">
//                 <div>
//                   <div className="text-xs text-gray-500">Subtotal</div>
//                   <div className="font-semibold">{formatUSD(subtotal)}</div>
//                 </div>
//                 <div>
//                   <div className="text-xs text-gray-500">Total</div>
//                   <div className="font-bold" style={{ color: PINK }}>{formatUSD(total)}</div>
//                 </div>
//               </div>

//               <div className="flex gap-2">
//                 <button type="button" onClick={closeCheckout} className="flex-1 py-2 rounded-md border">Cancel</button>
//                 <button type="submit" disabled={checkoutLoading} className="flex-1 py-2 rounded-md text-white" style={{ background: PINK }}>
//                   {checkoutLoading ? "Processing..." : "Place Order"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* THANK YOU TOAST */}
//       {thankYouVisible && (
//         <div item-center className="fixed right-4 top-20 z-80">
//           <div className="bg-white rounded-xl shadow-lg p-4 border-l-4" style={{ borderColor: PINK }}>
//             <div className="font-semibold" style={{ color: BLUE }}>Thanks for shopping!</div>
//             <div className="text-sm text-gray-500">Your order has been received. Our team will process it shortly.</div>
//           </div>
//         </div>
//       )}

//       {/* FOOTER: vision + about + team */}
//       <footer className="mt-20 bg-gradient-to-b from-[#f7f3f5] to-white border-t" style={{ borderColor: "#f4f4f4" }}>
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             <div>
//               <h5 className="text-lg font-bold" style={{ color: BLUE }}>About Smart Grocery</h5>
//               <p className="text-sm text-gray-600 mt-2">We combine automation, neat inventory management and fast delivery to bring convenience to your day-to-day shopping.</p>
//             </div>

//             <div>
//               <h5 className="text-lg font-bold" style={{ color: BLUE }}>Our Vision</h5>
//               <p className="text-sm text-gray-600 mt-2">Make grocery shopping stress-free for everyone: fast, reliable and sustainable.</p>
//             </div>

//             <div>
//               <h5 className="text-lg font-bold" style={{ color: BLUE }}>Team</h5>
//               <div className="mt-3 grid grid-cols-3 gap-2">
//                 <div className="text-center">
//                   <img src="https://i.pravatar.cc/60?img=12" className="w-12 h-12 rounded-full mx-auto" alt="A" />
//                   <div className="text-xs text-gray-700 mt-1">Mizan</div>
//                 </div>
//                 <div className="text-center">
//                   <img src="https://i.pravatar.cc/60?img=13" className="w-12 h-12 rounded-full mx-auto" alt="B" />
//                   <div className="text-xs text-gray-700 mt-1">Antu</div>
//                 </div>
//                 <div className="text-center">
//                   <img src="https://i.pravatar.cc/60?img=14" className="w-12 h-12 rounded-full mx-auto" alt="C" />
//                   <div className="text-xs text-gray-700 mt-1">Fuad</div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="mt-8 text-center text-sm text-gray-500">© {new Date().getFullYear()} Team Increvo — Smart Grocery Store</div>
//         </div>
//       </footer>
//     </div>
//   );
// }

// /* END */












import React, { useRef, useState } from "react";

/* CONFIG: set your Apps Script URL here (POST) */
const SHEET_URL = "https://script.google.com/macros/s/AKfycbw0rSM-NKvRGJfLis5THYdB9hu0AtCUuzdVg8LOTD3g3RHWUsOxnap6NxHMX_KnuWTk/exec";


/* Color tokens (kept same) */
const PINK = "#E5156B";
const BLUE = "#174060";

/* ===== PRODUCTS (exact names + prices you provided) =====
 Product list & prices must match the sheet columns exactly.
*/
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
    { id: "antacid", name: "Antacid", price: 2.3, img: "Antacid.Webp" },
    { id: "paracetamol", name: "Paracetamol", price: 1.0, img: "Paracetamol.webp" },
  ],
  Snacks: [
    { id: "chocolate", name: "Chocolate", price: 4.0, img: "Chocolate.webp" },
    { id: "potato_chips", name: "Potato chips", price: 1.8, img: "Potato chips.webp" },
    { id: "biscuit", name: "Biscuit", price: 1.5, img: "Biscuits.webp" },
    { id: "bread", name: "Bread", price: 2.0, img: "Bread.webp" },
    { id: "noodles", name: "Noodles", price: 1.2, img: "Noodles.webp" },
  ],
  Drinks: [
    { id: "fruit_juice", name: "Fruit juice", price: 2.0, img: "Juice.webp" },
    { id: "cold_drinks", name: "Cold drinks", price: 1.5, img: "Drink.webp" },
  ],
  Oil: [
    { id: "cooking_oil", name: "Cooking oil", price: 4.5, img: "Oil.webp" },
  ],
};

/* Flattened list for building sheet columns */
const ALL_PRODUCTS = Object.values(CATEGORIES).flat();

/* Utilities */
function formatUSD(v) {
  return (v).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

/* MAIN COMPONENT */
export default function SmartGrocery() {
  const [cart, setCart] = useState([]); // {id, name, price, qty}
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [userId, setUserId] = useState(""); // numbers only
  const [address, setAddress] = useState(""); // numbers only for Drone
  const [paymentMethod, setPaymentMethod] = useState("Visa"); // Visa | MasterCard | Amex
  const [deliveryMethod, setDeliveryMethod] = useState("Drone"); // Drone | StorePickup
  const [thankYouVisible, setThankYouVisible] = useState(false);

  // initialize refs so openCategory works from first render
  const categoryRefs = useRef(
    Object.fromEntries(Object.keys(CATEGORIES).map((c) => [c, React.createRef()]))
  );

  // CART utils
  const addToCart = (product) => {
    setCart((prev) => {
      const found = prev.find((p) => p.id === product.id);
      if (found) return prev.map((p) => (p.id === product.id ? { ...p, qty: p.qty + 1 } : p));
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }];
    });
  };

  const changeQty = (id, delta) => {
    setCart((prev) =>
      prev.flatMap((it) => {
        if (it.id !== id) return it;
        const newQty = it.qty + delta;
        if (newQty <= 0) return [];
        return [{ ...it, qty: newQty }];
      })
    );
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((s, p) => s + p.price * p.qty, 0);
  const shipping = subtotal > 0 ? 2.99 : 0;
  const totalAmount = +(subtotal + shipping);

  // Scroll to category
  const openCategory = (cat) => {
    const r = categoryRefs.current[cat];
    if (r && r.current) r.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // input handlers
  const handleUserIdChange = (v) => setUserId(v.replace(/\D/g, ""));
  const handleAddressChange = (v) => {
    // only numbers allowed if Drone
    if (deliveryMethod === "Drone") {
      setAddress(v.replace(/\D/g, ""));
    } else {
      setAddress(v); // free-form for other methods (but we use empty for StorePickup)
    }
  };

  // Build sheet product columns object (keys exactly as in your sheet)
  const buildProductColumns = () => {
    // map keys exactly as requested sheet header names:
    // Chocolate, Potato chips, Biscuit, Bread, Noodles, Butter, Antacid, Paracetamol, Rice, Lentils, Sugar, Spice, Cooking oil, Cold drinks, Fruit juice, Vinegar
    const map = {
      "Chocolate": 0,
      "Potato chips": 0,
      "Biscuit": 0,
      "Bread": 0,
      "Noodles": 0,
      "Butter": 0,
      "Antacid": 0,
      "Paracetamol": 0,
      "Rice": 0,
      "Lentils": 0,
      "Sugar": 0,
      "Spice": 0,
      "Cooking oil": 0,
      "Cold drinks": 0,
      "Fruit juice": 0,
      "Vinegar": 0,
    };

    cart.forEach((it) => {
      // find product by id in ALL_PRODUCTS to match name
      const p = ALL_PRODUCTS.find((ap) => ap.id === it.id);
      if (!p) return;
      // assign into the map by exact sheet name
      const name = p.name;
      // Some product names in ALL_PRODUCTS are like "Potato chips" etc — the map keys must match exactly.
      // We'll map by lower/upper normalization to find the correct key.
      const key = Object.keys(map).find(k => k.toLowerCase() === name.toLowerCase());
      if (key) map[key] = it.qty;
    });

    return map;
  };

  // Build final payload with exact keys for the sheet
  const buildSheetPayload = () => {
    const productCols = buildProductColumns();

    // Top-level keys exactly as your sheet header
    const payload = {
      "Timestamp": new Date().toISOString(),
      "Name": name.trim(),
      "User ID": userId.trim(),
      "Address": deliveryMethod === "Drone" ? address.trim() : "", // numbers only for drone, empty for store pickup
      "Method": paymentMethod, // Payment method -> Method
      "Total amount": totalAmount.toFixed(2),
      // product columns
      ...productCols,
      "Status": "Pending",
      // include items array for debugging/storage (Apps Script can choose to ignore)
      items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
    };

    return payload;
  };

  // Submit order
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // validations
    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }
    if (!userId.trim()) {
      alert("Please enter your username (numbers only).");
      return;
    }
    if (!/^\d+$/.test(userId.trim())) {
      alert("Username must be numbers only.");
      return;
    }
    if (deliveryMethod === "Drone") {
      if (!address.trim()) {
        alert("Drone delivery selected — address (numbers only) is required.");
        return;
      }
      if (!/^\d+$/.test(address.trim())) {
        alert("Address must be numbers only for Drone delivery.");
        return;
      }
    }

    if (cart.length === 0) {
      alert("Cart is empty.");
      return;
    }

    const payload = buildSheetPayload();

    setLoading(true);

    try {
  if (!SHEET_URL || SHEET_URL.trim() === "") {
    console.warn("Missing SHEET_URL!");
  } else {
    const res = await fetch(SHEET_URL, {
      method: "POST",
      mode: "no-cors", // IMPORTANT: Fixes Google Script CORS issue
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // res.ok is ALWAYS false in no-cors mode, so we don't check it
    console.log("Order sent to Google Sheet (no-cors, cannot read response).");
  }
} catch (err) {
  console.warn("Failed to send to sheet:", err);
  alert("Warning: failed to send order to sheet (see console).");
}
 finally {
      setLoading(false);
      setThankYouVisible(true);
      // reset minimal fields (keep product list unchanged)
      setCart([]);
      setName("");
      setUserId("");
      setAddress("");
      setPaymentMethod("Visa");
      setDeliveryMethod("Drone");
      setShowCheckout(false);
      setTimeout(() => setThankYouVisible(false), 3200);
    }
  };

  return (
    <div className="min-h-screen antialiased" style={{ background: "linear-gradient(180deg,#fffafc,#fffefe)" }}>
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b" style={{ borderColor: "#f0f0f0" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="rounded-md p-2" style={{ background: "#fff0f4" }}>
                <img src="Logo.webp" alt="Smart Grocery Store Logo" width="76" height="76" />
              </div>
              <div>
                <div className="font-extrabold text-xl" style={{ color: BLUE }}>Smart Grocery Store</div>
                <div className="text-sm text-gray-500">Smarter • Faster • Easier Way to Shop</div>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              {Object.keys(CATEGORIES).map((cat) => (
                <button key={cat} onClick={() => openCategory(cat)} className="text-sm font-medium px-2 py-1 rounded hover:underline" style={{ color: BLUE }}>
                  {cat}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col text-right mr-2">
                <span className="text-sm font-medium" style={{ color: BLUE }}>{cart.length} items</span>
                <span className="text-xs text-gray-500">{formatUSD(totalAmount)}</span>
              </div>
              <button onClick={() => setShowCheckout(true)} className="px-4 py-2 rounded-md text-white font-semibold shadow" style={{ background: PINK }}>
                Checkout
              </button>
            </div>
          </div>
        </div>

        {/* mobile categories */}
        <div className="md:hidden overflow-x-auto border-t py-2" style={{ borderColor: "#f5f5f5" }}>
          <div className="flex gap-3 px-4">
            {Object.keys(CATEGORIES).map((cat) => (
              <button key={cat} onClick={() => openCategory(cat)} className="px-3 py-1 rounded-full text-sm border" style={{ borderColor: "#eee", background: "#fff" }}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-4xl font-extrabold mb-4" style={{ color: BLUE }}>Get Fresh groceries, Get delivered smartly</h2>
            <p className="text-lg text-gray-700 mb-6">Shop Grocery & Medicines with smooth checkout flow.</p>
            <div className="flex gap-3">
              <a onClick={() => openCategory("Grocery")} className="cursor-pointer inline-block px-5 py-2 rounded-md font-semibold" style={{ background: PINK, color: "#fff" }}>Shop Grocery</a>
              <a onClick={() => openCategory("Medicines")} className="cursor-pointer inline-block px-5 py-2 rounded-md border" style={{ color: BLUE, borderColor: "#e6e6e6" }}>Shop Medicines</a>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden shadow" style={{ background: "#fff" }}>
            <img src="Project Pic.webp" alt="hero" className="w-full h-64 object-cover" />
          </div>
        </div>
      </section>

      {/* CATEGORIES & PRODUCTS */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 sm:mx-10 lg:px-8 mt-10 pb-24">
        {Object.entries(CATEGORIES).map(([cat, items]) => (
          <section key={cat} ref={categoryRefs.current[cat]} id={`cat-${cat}`} className="mb-14">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold" style={{ color: BLUE }}>{cat}</h3>
              <div className="text-sm text-gray-500">{items.length} products</div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((product) => (
                <article key={product.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col">
                  <div className="h-44 w-full overflow-hidden bg-gray-50">
                    <img src={`${product.img}?auto=format&fit=crop&w=800&q=60`} alt={product.name} className="w-full h-full object-cover transition-transform duration-200 hover:scale-105" />
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h4 className="text-lg font-semibold" style={{ color: BLUE }}>{product.name}</h4>
                      <div className="text-sm font-semibold" style={{ color: PINK }}>{formatUSD(product.price)}</div>
                    </div>

                    <p className="text-xs text-gray-500 mb-4">Premium quality — perfect for daily use.</p>

                    <div className="mt-auto flex items-center gap-3">
                      <button onClick={() => addToCart(product)} className="flex-1 py-2 rounded-lg text-white font-semibold" style={{ background: PINK }}>
                        Add to cart
                      </button>
                      <button onClick={() => addToCart(product)} className="px-3 py-2 rounded-lg border text-sm hidden sm:inline" style={{ borderColor: "#eee" }}>
                        +1
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* CART SUMMARY (desktop) */}
      <aside className="fixed right-4 bottom-40 hidden lg:block w-80 shadow-lg rounded-xl overflow-hidden" style={{ background: "#fff" }}>
        <div className="p-4 border-b" style={{ borderColor: "#f2f2f2" }}>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-500">Your Cart</div>
              <div className="font-semibold" style={{ color: BLUE }}>{cart.length} items</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total</div>
              <div className="font-bold">{formatUSD(totalAmount)}</div>
            </div>
          </div>
        </div>

        <div className="p-3 max-h-64 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="text-sm text-gray-500">Cart is empty</div>
          ) : (
            cart.map((it) => (
              <div key={it.id} className="flex items-center justify-between gap-3 py-2 border-b" style={{ borderColor: "#f6f6f6" }}>
                <div>
                  <div className="text-sm font-medium">{it.name}</div>
                  <div className="text-xs text-gray-500">{it.qty} × {formatUSD(it.price)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => changeQty(it.id, -1)} className="px-2 py-1 rounded border">-</button>
                  <div className="px-2">{it.qty}</div>
                  <button onClick={() => changeQty(it.id, +1)} className="px-2 py-1 rounded border">+</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t" style={{ borderColor: "#f2f2f2" }}>
          <div className="flex justify-between mb-3"><span className="text-sm">Subtotal</span><span className="font-medium">{formatUSD(subtotal)}</span></div>
          <div className="flex justify-between mb-4"><span className="text-sm">Shipping</span><span className="font-medium">{formatUSD(shipping)}</span></div>
          <button onClick={() => setShowCheckout(true)} className="w-full py-2 rounded-lg font-semibold" style={{ background: PINK, color: "#fff" }}>Checkout</button>
        </div>
      </aside>

      {/* MOBILE CART BAR */}
      <div className="fixed left-0 right-0 bottom-0 z-50 lg:hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-t-xl shadow-lg p-3 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">{cart.length} items</div>
              <div className="font-semibold" style={{ color: BLUE }}>{formatUSD(totalAmount)}</div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={clearCart} className="px-3 py-2 rounded-md border text-sm">Clear</button>
              <button onClick={() => setShowCheckout(true)} className="px-4 py-2 rounded-md font-semibold text-white" style={{ background: PINK }}>
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CHECKOUT MODAL */}
      {showCheckout && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
          <div className="bg-white w-[95%] sm:w-96 rounded-2xl shadow-xl p-5">
            <h4 className="text-lg font-bold mb-3" style={{ color: BLUE }}>Checkout</h4>

            <form onSubmit={handlePlaceOrder} className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Full name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2 text-sm" placeholder="John Wick" />
              </div>

              <div>
                <label className="text-sm text-gray-600">Username (numbers only)</label>
                <input type="text" required value={userId} onChange={(e) => handleUserIdChange(e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2 text-sm" placeholder="123456" inputMode="numeric" />
              </div>

              <div>
                <label className="text-sm text-gray-600">Delivery method</label>
                <div className="flex gap-2 mt-2">
                  <label className={`flex-1 border rounded px-3 py-2 text-center cursor-pointer ${deliveryMethod === "Drone" ? "ring-2 ring-offset-1" : ""}`} style={{ borderColor: "#eee" }}>
                    <input type="radio" name="delivery" value="Drone" checked={deliveryMethod === "Drone"} onChange={() => setDeliveryMethod("Drone")} className="hidden" />
                    <div className="text-sm font-medium">Drone Delivery</div>
                  </label>

                  <label className={`flex-1 border rounded px-3 py-2 text-center cursor-pointer ${deliveryMethod === "StorePickup" ? "ring-2 ring-offset-1" : ""}`} style={{ borderColor: "#eee" }}>
                    <input type="radio" name="delivery" value="StorePickup" checked={deliveryMethod === "StorePickup"} onChange={() => setDeliveryMethod("StorePickup")} className="hidden" />
                    <div className="text-sm font-medium">Store Pickup</div>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">Address {deliveryMethod === "Drone" ? "(numbers only)" : "(optional for pickup)"}</label>
                <textarea required={deliveryMethod === "Drone"} value={address} onChange={(e) => handleAddressChange(e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                  placeholder={deliveryMethod === "Drone" ? "Enter numeric delivery code / location (numbers only)" : "House, Road, Area, City (optional)"} />
              </div>

              <div>
                <label className="text-sm text-gray-600">Payment method</label>
                <div className="flex gap-2 mt-2">
                  <label className={`flex-1 border rounded px-3 py-2 text-center cursor-pointer ${paymentMethod === "Visa" ? "ring-2 ring-offset-1" : ""}`} style={{ borderColor: "#eee" }}>
                    <input type="radio" name="pay" value="Visa" checked={paymentMethod === "Visa"} onChange={() => setPaymentMethod("Visa")} className="hidden" />
                    <div className="text-sm font-medium">Visa</div>
                    <div className="text-xs text-gray-500">Visa</div>
                  </label>

                  <label className={`flex-1 border rounded px-3 py-2 text-center cursor-pointer ${paymentMethod === "MasterCard" ? "ring-2 ring-offset-1" : ""}`} style={{ borderColor: "#eee" }}>
                    <input type="radio" name="pay" value="MasterCard" checked={paymentMethod === "MasterCard"} onChange={() => setPaymentMethod("MasterCard")} className="hidden" />
                    <div className="text-sm font-medium">MasterCard</div>
                    <div className="text-xs text-gray-500">MasterCard</div>
                  </label>

                  <label className={`flex-1 border rounded px-3 py-2 text-center cursor-pointer ${paymentMethod === "Amex" ? "ring-2 ring-offset-1" : ""}`} style={{ borderColor: "#eee" }}>
                    <input type="radio" name="pay" value="Amex" checked={paymentMethod === "Amex"} onChange={() => setPaymentMethod("Amex")} className="hidden" />
                    <div className="text-sm font-medium">Amex</div>
                    <div className="text-xs text-gray-500">Amex</div>
                  </label>
                </div>
              </div>

              <div className="flex justify-between items-center mt-2">
                <div>
                  <div className="text-xs text-gray-500">Subtotal</div>
                  <div className="font-semibold">{formatUSD(subtotal)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Total</div>
                  <div className="font-bold" style={{ color: PINK }}>{formatUSD(totalAmount)}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => setShowCheckout(false)} className="flex-1 py-2 rounded-md border">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 py-2 rounded-md text-white" style={{ background: PINK }}>
                  {loading ? "Processing..." : "Place Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* THANK YOU TOAST */}
      {thankYouVisible && (
        <div className="fixed right-4 top-40 z-80">
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4" style={{ borderColor: PINK }}>
            <div className="font-semibold" style={{ color: BLUE }}>Thanks for shopping!</div>
            <div className="text-sm text-gray-500">Your order has been received .It will be at your doorstep soon.</div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-20 bg-gradient-to-b from-[#f7f3f5] to-white border-t border-[#f4f4f4]">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

      {/* About & Vision */}
      <div className="space-y-6">
        <div>
          <h5 className="text-lg font-bold" style={{ color: BLUE }}>About Smart Grocery</h5>
          <p className="text-sm text-gray-600 mt-2">
            We combine automation, neat inventory management, and fast delivery to bring convenience to your day-to-day shopping.
          </p>
        </div>

        <div>
          <h5 className="text-lg font-bold" style={{ color: BLUE }}>Our Vision</h5>
          <p className="text-sm text-gray-600 mt-2">
            Make grocery shopping stress-free for everyone: fast, reliable, and sustainable.
          </p>
        </div>
      </div>

      {/* Team */}
      <div>
        <h5 className="text-lg font-bold text-center md:text-left" style={{ color: BLUE }}>Our Team</h5>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-6 justify-items-center">
          
          {/* Team Member */}
          <div className="flex flex-col items-center">
            <img src="Mizan.webp" className="w-24 h-24 rounded-full object-cover" alt="Abdulla Al Mizan" />
            <span className="text-xs text-gray-700 mt-2 text-center">Abdulla Al Mizan</span>
          </div>

          <div className="flex flex-col items-center">
            <img src="Antu.webp" className="w-24 h-24 rounded-full object-cover" alt="Nafees Istay Taufic Antu" />
            <span className="text-xs text-gray-700 mt-2 text-center">Nafees Istay Taufic Antu</span>
          </div>

          <div className="flex flex-col items-center">
            <img src="Fuad.webp" className="w-24 h-24 rounded-full object-cover" alt="Sazzad Al Fuad" />
            <span className="text-xs text-gray-700 mt-2 text-center">Sazzad Al Fuad</span>
          </div>

        </div>
      </div>

    </div>

    {/* Footer Bottom */}
    <div className="mt-12 text-center text-sm text-gray-500">
      © {new Date().getFullYear()} Team Increvo — Smart Grocery Store
    </div>
  </div>
</footer>



    </div>
  );
}



