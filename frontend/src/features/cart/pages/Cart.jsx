import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import useCart from "../hook/useCart";

// Format currency into Indian Rupees (₹)
const formatINR = (val) => {
  const num = Number(val?.amount ?? val ?? 0);
  if (isNaN(num)) return "₹0";
  return `₹${num.toLocaleString("en-IN")}`;
};

// Safe image helper
const extractImageUrl = (img) => {
  if (!img) {
    return "https://ik.imagekit.io/0etg1a8vc/snitch/51c-J0lt7KL._AC_SR480_440__dRAJAT-HK.jpg";
  }
  if (typeof img === "string") return img;
  return (
    img.url ||
    "https://ik.imagekit.io/0etg1a8vc/snitch/51c-J0lt7KL._AC_SR480_440__dRAJAT-HK.jpg"
  );
};


const Cart = () => {
  const {
    cartItems: items,
    loading,
    error,
    handleGetCart,
    handleIncreaseCartItemQuantity,
  } = useCart();
  const navigate = useNavigate();
  // const [items, setItems] = useState([]);

  useEffect(() => {
    handleGetCart();
  }, []);

  // Toast notification feedback
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Quantity updates
  const handleQuantityChange = async (item) => {
    const { success, error } = await handleIncreaseCartItemQuantity({
      productId: item.product._id,
      varientId: item.variant,
    });
    if (success) {
      // handleGetCart();
    }
    if (error) {
      setToastMessage(error);
    }
  };

  // Remove single item
  const handleRemoveItem = (id) => {
    // setItems((prev) => prev.filter((item) => item.id !== id));
    showToast("Item removed from cart");
  };

  // Clear entire cart
  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to empty your cart?")) {
      // setItems([]);
      showToast("Cart cleared");
    }
  };

  // Price calculations
  const totalItemCount = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [items]);

  const FREE_SHIPPING_LIMIT = 2999;
  const isFreeShipping = subtotal >= FREE_SHIPPING_LIMIT;
  const shippingCharge = subtotal > 0 && !isFreeShipping ? 199 : 0;

  const grandTotal = Math.max(0, subtotal + shippingCharge);

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-[#f4efe6] font-sans antialiased selection:bg-amber-400 selection:text-zinc-950 flex flex-col relative">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/4 w-[36rem] h-[36rem] bg-amber-500/[0.03] rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -right-32 w-[32rem] h-[32rem] bg-amber-600/[0.02] rounded-full blur-[140px]" />
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900/95 border border-amber-500/40 text-white px-4 py-2.5 rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.2)] text-xs font-semibold flex items-center gap-2.5 backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MAIN CONTENT CANVAS */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 z-10">
        {/* ================================================================ */}
        {/* EMPTY STATE */}
        {/* ================================================================ */}
        {items.length === 0 ? (
          <div className="py-16 md:py-24 text-center max-w-md mx-auto space-y-6">
            <div className="w-24 h-24 rounded-full bg-zinc-900/90 border border-amber-500/30 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(245,158,11,0.12)] relative">
              <svg
                className="w-10 h-10 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-amber-400/80 animate-ping" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">
                Your Cart is Empty
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Looks like you haven't added anything to your bag yet. Explore
                our latest drops and curate your collection.
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_30px_rgba(245,158,11,0.35)] cursor-pointer"
              >
                <span>Discover Products</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        ) : (
          /* ================================================================ */
          /* ACTIVE CART 2-COLUMN VIEW (Items List + Order Summary) */
          /* ================================================================ */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: ITEMS LIST */}
            <section className="lg:col-span-8 space-y-5">
              {/* Section Heading & Clear Cart Action */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight uppercase">
                    Your Cart
                  </h1>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-500/30">
                    {totalItemCount} {totalItemCount === 1 ? "Item" : "Items"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="text-xs font-mono text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Clear Cart
                </button>
              </div>

              {/* Items Cards */}
              <div className="space-y-4">
                {items.map((item) => {
                  const lineTotal = item.price.amount * item.quantity;

                  return (
                    <article
                      key={item.id}
                      className="p-4 sm:p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/30 transition-all duration-200 shadow-sm relative group"
                    >
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start">
                        {/* Thumbnail */}
                        <div className="w-24 sm:w-28 h-28 sm:h-32 rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0 relative">
                          <img
                            src={extractImageUrl(item.image)}
                            alt={item.title}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 space-y-2 w-full">
                          <div className="flex justify-between items-start gap-3">
                            <div>
                              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
                                {item.product.title}
                              </h2>
                              {item.size && (
                                <p className="text-xs text-zinc-400 mt-1 font-mono">
                                  Size:{" "}
                                  <span className="text-amber-400 font-bold">
                                    {item.size}
                                  </span>
                                  {item.color ? ` • Color: ${item.color}` : ""}
                                </p>
                              )}
                            </div>

                            {/* Price / Line Total */}
                            <div className="text-right">
                              <p className="text-sm sm:text-base font-bold font-mono text-amber-400">
                                {formatINR(lineTotal)}
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-[10px] font-mono text-zinc-500">
                                  {formatINR(item.price.amount)} each
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Stepper Controls & Remove Button */}
                          <div className="flex justify-between items-center pt-3 border-t border-zinc-800/80 mt-3">
                            {/* Stepper */}
                            <div className="flex items-center border border-zinc-700 bg-zinc-950 rounded-lg overflow-hidden">
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuantityChange(item.id, -1)
                                }
                                aria-label="Decrease quantity"
                                className="w-8 h-8 flex items-center justify-center text-zinc-300 hover:text-amber-400 hover:bg-zinc-800 text-sm font-bold transition-colors cursor-pointer"
                              >
                                −
                              </button>
                              <span className="w-8 text-center text-xs font-mono font-bold text-white">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item)}
                                aria-label="Increase quantity"
                                className="w-8 h-8 flex items-center justify-center text-zinc-300 hover:text-amber-400 hover:bg-zinc-800 text-sm font-bold transition-colors cursor-pointer"
                              >
                                +
                              </button>
                            </div>

                            {/* Remove Item Button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* RIGHT COLUMN: ORDER SUMMARY SIDEBAR */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 sm:p-6 shadow-xl backdrop-blur-xl relative">
                <h2 className="text-base font-extrabold text-white tracking-wider uppercase pb-3 border-b border-zinc-800">
                  Order Summary
                </h2>

                {/* Cost Breakdown */}
                <div className="space-y-2.5 pt-3 text-xs font-mono">
                  <div className="flex justify-between text-zinc-400">
                    <span>
                      Subtotal ({totalItemCount}{" "}
                      {totalItemCount === 1 ? "item" : "items"})
                    </span>
                    <span className="text-white">{formatINR(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-zinc-400">
                    <span>Shipping</span>
                    <span
                      className={
                        isFreeShipping
                          ? "text-emerald-400 font-bold"
                          : "text-white"
                      }
                    >
                      {isFreeShipping ? "FREE" : formatINR(shippingCharge)}
                    </span>
                  </div>

                  {/* Grand Total */}
                  <div className="flex justify-between items-baseline pt-4 border-t border-zinc-800 text-white">
                    <span className="text-xs font-extrabold uppercase tracking-wider">
                      Total
                    </span>
                    <span className="text-xl font-extrabold text-amber-400 font-mono">
                      {formatINR(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  type="button"
                  onClick={() => showToast("Proceeding to checkout...")}
                  className="mt-6 w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_30px_rgba(245,158,11,0.35)] transition-all cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-zinc-800/80 bg-[#060608] py-6 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wider text-zinc-300 uppercase">
              SNITCH
            </span>
            <span>• All Rights Reserved</span>
          </div>
          <p className="text-[11px] font-mono text-zinc-500">
            © {new Date().getFullYear()} SNITCH Inc.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Cart;
