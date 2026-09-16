import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router";
import useProduct from "../hook/useProduct";
import useCart from "../../cart/hook/useCart";

const AVAILABLE_SIZES = ["S", "M", "L", "XL", "XXL"];

const extractImageUrl = (img) => {
  if (!img) return "";
  if (typeof img === "string") return img;
  return img.url || "";
};

// Safely extract key-value pairs from variant attributes (Object or Map)
const getVariantAttributes = (variant) => {
  if (!variant?.attributes) return [];
  if (variant.attributes instanceof Map) {
    return Array.from(variant.attributes.entries());
  }
  if (typeof variant.attributes === "object") {
    return Object.entries(variant.attributes);
  }
  return [];
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { handleGetProductById } = useProduct();
  const { handleAddItem, handleGetCart } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [toastMessage, setToastMessage] = useState(null);
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);

  // Accordion state
  const [expandedSection, setExpandedSection] = useState("details");

  // Local storage synced cart state
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem("snitch_cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Fetch product by ID
  useEffect(() => {
    const getProduct = async () => {
      try {
        if (id) {
          const res = await handleGetProductById(id);
          setProduct(res);

          // If product has variants, default to the first variant
          if (
            res?.variants &&
            Array.isArray(res.variants) &&
            res.variants.length > 0
          ) {
            setSelectedVariantId(res.variants[0]._id);
            const variantSize =
              res.variants[0].attributes?.size ||
              (res.variants[0].attributes instanceof Map
                ? res.variants[0].attributes.get("size")
                : null);
            if (variantSize) {
              setSelectedSize(String(variantSize).toUpperCase());
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
      }
    };

    getProduct();
  }, [id]);

  // Sync cart items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("snitch_cart", JSON.stringify(cartItems));
    } catch (err) {
      console.error("Failed to save cart to localStorage", err);
    }
  }, [cartItems]);

  const variantsList = useMemo(() => {
    return Array.isArray(product?.variants) ? product.variants : [];
  }, [product]);

  // Active selected variant object with fallback to first variant
  const currentVariant = useMemo(() => {
    if (variantsList.length === 0) return null;
    return (
      variantsList.find((v) => v._id === selectedVariantId) || variantsList[0]
    );
  }, [variantsList, selectedVariantId]);

  // Reset image index whenever the variant changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [selectedVariantId]);

  // Fallback images: use variant images if available and non-empty, else fallback to product images
  const imagesList = useMemo(() => {
    if (
      currentVariant?.images &&
      Array.isArray(currentVariant.images) &&
      currentVariant.images.length > 0
    ) {
      return currentVariant.images;
    }
    return Array.isArray(product?.images) ? product.images : [];
  }, [product, currentVariant]);

  const activeImage = useMemo(() => {
    if (imagesList[selectedImageIndex]) {
      return extractImageUrl(imagesList[selectedImageIndex]);
    }
    return imagesList[0] ? extractImageUrl(imagesList[0]) : "";
  }, [imagesList, selectedImageIndex]);

  // Fallback price: use variant price if provided, else fallback to main product price
  const currentPrice = useMemo(() => {
    const hasVariantPrice =
      currentVariant?.price?.amount !== undefined &&
      currentVariant?.price?.amount !== null;
    const amount = hasVariantPrice
      ? currentVariant.price.amount
      : (product?.price?.amount ?? 0);
    const currency =
      currentVariant?.price?.currency || product?.price?.currency || "INR";
    return {
      amount: Number(amount),
      formatted: `₹${Number(amount).toLocaleString("en-IN")}`,
      currency,
    };
  }, [product, currentVariant]);

  // Fallback stock: use variant stock if defined, else null (unspecified / fallback)
  const currentStock = useMemo(() => {
    if (
      currentVariant &&
      currentVariant.stock !== undefined &&
      currentVariant.stock !== null
    ) {
      return Number(currentVariant.stock);
    }
    return null;
  }, [currentVariant]);

  const totalCartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Select size and synchronize with variant if one matches
  const handleSelectSize = (size) => {
    setSelectedSize(size);
    if (variantsList.length > 0) {
      const matchingVariant = variantsList.find((v) => {
        const s =
          v.attributes?.size ||
          (v.attributes instanceof Map ? v.attributes.get("size") : null);
        return s && String(s).toUpperCase() === size.toUpperCase();
      });
      if (matchingVariant) {
        setSelectedVariantId(matchingVariant._id);
      }
    }
  };

  // Select variant directly and sync size if variant defines a size attribute
  const handleSelectVariant = (variant) => {
    setSelectedVariantId(variant._id);
    const variantSize =
      variant.attributes?.size ||
      (variant.attributes instanceof Map
        ? variant.attributes.get("size")
        : null);
    if (variantSize) {
      setSelectedSize(String(variantSize).toUpperCase());
    }
  };

  // Add to Cart handler (with variant attributes and fallback values)
  const handleAddItemToCart = () => {
    if (!product) return;

    if (currentStock === 0) {
      showToast("Selected variant is currently out of stock");
      return;
    }

    const variantAttrs = currentVariant
      ? getVariantAttributes(currentVariant)
      : [];
    const attrsSummary =
      variantAttrs.length > 0
        ? variantAttrs.map(([k, v]) => `${k}: ${v}`).join(", ")
        : null;

    const cartKey = `${product._id}-${selectedSize}-${currentVariant?._id || "base"}`;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.key === cartKey);

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [
        ...prev,
        {
          key: cartKey,
          productId: product._id,
          variantId: currentVariant?._id || null,
          title: product.title,
          price: currentPrice.amount,
          currency: currentPrice.currency,
          size: selectedSize,
          quantity: quantity,
          image:
            extractImageUrl(imagesList[0]) ||
            extractImageUrl(product.images?.[0]),
          attributes: attrsSummary,
        },
      ];
    });

    handleAddItem({
      productId: product._id,
      variantId: currentVariant?._id,
      quantity: quantity,
    });

    setIsAddedSuccess(true);
    showToast(
      `Added ${quantity} × ${product.title} (${selectedSize}${
        attrsSummary ? ` • ${attrsSummary}` : ""
      }) to Bag`,
    );
    setTimeout(() => setIsAddedSuccess(false), 2000);
  };

  const nextImage = () => {
    if (imagesList.length > 0) {
      setSelectedImageIndex((prev) => (prev + 1) % imagesList.length);
    }
  };

  const prevImage = () => {
    if (imagesList.length > 0) {
      setSelectedImageIndex(
        (prev) => (prev - 1 + imagesList.length) % imagesList.length,
      );
    }
  };

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-[#f4efe6] font-sans antialiased selection:bg-amber-400 selection:text-zinc-950 flex flex-col relative overflow-x-hidden">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/3 w-[30rem] h-[30rem] bg-amber-500/[0.03] rounded-full blur-[130px]" />
        <div className="absolute top-1/2 -right-24 w-[24rem] h-[24rem] bg-amber-600/[0.025] rounded-full blur-[130px]" />
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-zinc-900/95 border border-amber-500/40 text-amber-300 text-xs font-medium shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="flex h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-zinc-400 hover:text-white text-xs ml-1.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* COMPACT NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[#09090b]/90 backdrop-blur-xl border-b border-zinc-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Brand Anchor */}
          <div className="flex items-center gap-4">
            <Link to="/" className="group flex items-center gap-1.5">
              <span className="text-lg sm:text-xl font-black tracking-[0.25em] text-white group-hover:text-amber-400 transition-colors uppercase">
                SNITCH
              </span>
            </Link>
          </div>

          {/* Quick Back & Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-zinc-400 hover:text-amber-300 transition-colors py-1.5 px-2.5 rounded-md hover:bg-zinc-800/60"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>Back</span>
            </button>

            {/* Shopping Bag Trigger Button */}
            <button
              id="header-bag-trigger"
              onClick={() => navigate("/cart")}
              className="relative p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-300 hover:text-amber-400 transition-colors"
              aria-label="Open Shopping Bag"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-zinc-950 text-[9px] font-extrabold flex items-center justify-center shadow">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* COMPACT BREADCRUMB */}
      <nav
        aria-label="Breadcrumb"
        className="max-w-5xl mx-auto w-full px-4 sm:px-6 pt-3 pb-1 text-[11px] text-zinc-500 flex items-center gap-1.5"
      >
        <Link to="/" className="hover:text-amber-400 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-zinc-400">Products</span>
        <span>/</span>
        <span className="text-amber-400/90 truncate max-w-[160px] sm:max-w-none">
          {product.title}
        </span>
      </nav>

      {/* MAIN PRODUCT DETAILS SECTION */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
          {/* ========================================================== */}
          {/* LEFT COLUMN: COMPACT MULTI-IMAGE GALLERY */}
          {/* ========================================================== */}
          <section className="md:col-span-5 lg:col-span-5 flex flex-col gap-3 max-w-sm mx-auto w-full">
            {/* Main Stage Image Frame */}
            <div className="relative w-full aspect-[4/5] max-h-[380px] sm:max-h-[410px] bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800/80 shadow-xl group flex items-center justify-center">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.title}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 select-none"
                  loading="eager"
                />
              ) : (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-600 text-xs">
                  No Image Available
                </div>
              )}

              {/* Prev / Next navigation buttons on image */}
              {imagesList.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    aria-label="Previous Image"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-zinc-950/70 hover:bg-zinc-900 border border-zinc-700/60 text-white flex items-center justify-center backdrop-blur-md transition-transform hover:scale-110 active:scale-95 shadow"
                  >
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
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={nextImage}
                    aria-label="Next Image"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-zinc-950/70 hover:bg-zinc-900 border border-zinc-700/60 text-white flex items-center justify-center backdrop-blur-md transition-transform hover:scale-110 active:scale-95 shadow"
                  >
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </>
              )}

              {/* Badges on hero image */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider bg-zinc-900/90 border border-amber-500/30 text-amber-300 backdrop-blur-md">
                  Original Edition
                </span>
              </div>

              {/* Image Counter Badge */}
              {imagesList.length > 0 && (
                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-zinc-950/80 text-zinc-300 border border-zinc-800 backdrop-blur-md">
                  {selectedImageIndex + 1} / {imagesList.length}
                </div>
              )}
            </div>

            {/* Thumbnail Carousel Bar */}
            {imagesList.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
                {imagesList.map((img, idx) => {
                  const url = extractImageUrl(img);
                  const isSelected = idx === selectedImageIndex;
                  return (
                    <button
                      key={img._id || idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-14 h-18 sm:w-16 sm:h-20 rounded-lg overflow-hidden shrink-0 border transition-all duration-150 bg-zinc-900 ${
                        isSelected
                          ? "border-amber-400 ring-2 ring-amber-400/30 shadow-md scale-[1.02]"
                          : "border-zinc-800 hover:border-zinc-600 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={url}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* ========================================================== */}
          {/* RIGHT COLUMN: REFINED PRODUCT DETAILS & ACTION PANEL */}
          {/* ========================================================== */}
          <section className="md:col-span-7 lg:col-span-7 flex flex-col gap-4">
            {/* Product Title & Rating */}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight capitalize">
                {product.title}
              </h1>

              {/* Rating & Reviews */}
              <div className="mt-1.5 flex items-center gap-2 text-xs">
                <div className="flex items-center gap-0.5 text-amber-400 text-[11px]">
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span className="text-amber-400/50">★</span>
                  <span className="font-bold text-white ml-1 text-xs">4.8</span>
                </div>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400 text-[11px]">128 Ratings</span>
                <span className="text-zinc-600">•</span>
                {currentStock !== null ? (
                  currentStock === 0 ? (
                    <span className="text-rose-400 text-[11px] font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Out of Stock
                    </span>
                  ) : currentStock < 10 ? (
                    <span className="text-amber-400 text-[11px] font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      Only {currentStock} left!
                    </span>
                  ) : (
                    <span className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      In Stock ({currentStock} available)
                    </span>
                  )
                ) : (
                  <span className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    In Stock
                  </span>
                )}
              </div>
            </div>

            {/* Pricing Section */}
            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 flex flex-col gap-0.5">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {currentPrice.formatted}
                </span>
                <span className="text-[11px] font-mono uppercase text-amber-400/90 font-medium">
                  {currentPrice.currency}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Inclusive of all taxes. Free express domestic delivery.
              </p>
            </div>

            {/* Product Description */}
            {product.description && (
              <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                <p className="line-clamp-3">{product.description}</p>
              </div>
            )}

            {/* Size Selector */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center text-xs">
                <span className="text-zinc-300 font-medium text-[11px] uppercase tracking-wide">
                  Select Size:{" "}
                  <span className="text-amber-400 font-bold">
                    {selectedSize}
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {AVAILABLE_SIZES.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSelectSize(size)}
                      className={`h-9 rounded-lg text-xs font-bold transition-all duration-150 flex items-center justify-center border cursor-pointer ${
                        isSelected
                          ? "bg-amber-400 text-zinc-950 border-amber-400 shadow-sm"
                          : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ========================================================== */}
            {/* VARIANT SELECTOR (Directly below size selection) */}
            {/* ========================================================== */}
            {variantsList.length > 0 && (
              <div className="flex flex-col gap-2.5 pt-3 pb-1 border-t border-zinc-800/80">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-300 font-medium text-[11px] uppercase tracking-wide">
                      Select Variant / Edition:
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-amber-400 border border-amber-500/20 font-semibold">
                      {variantsList.length} options
                    </span>
                  </div>
                  {currentVariant && (
                    <span className="text-[10px] text-zinc-400 truncate max-w-[200px]">
                      {getVariantAttributes(currentVariant)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" • ") || "Active Variant"}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {variantsList.map((variant, idx) => {
                    const isSelected =
                      (currentVariant?._id || variantsList[0]._id) ===
                      variant._id;

                    // Fallback to product images if variant has no images
                    const vImg =
                      extractImageUrl(variant.images?.[0]) ||
                      extractImageUrl(product.images?.[0]);

                    // Fallback to product price if variant has no price
                    const vPrice =
                      variant.price?.amount !== undefined &&
                      variant.price?.amount !== null
                        ? variant.price.amount
                        : (product.price?.amount ?? 0);

                    // Fallback stock indicator
                    const vStock =
                      variant.stock !== undefined && variant.stock !== null
                        ? Number(variant.stock)
                        : null;

                    const attrs = getVariantAttributes(variant);

                    return (
                      <button
                        key={variant._id || idx}
                        type="button"
                        onClick={() => handleSelectVariant(variant)}
                        className={`relative p-2.5 rounded-xl text-left transition-all duration-200 border flex items-center gap-3 cursor-pointer group ${
                          isSelected
                            ? "bg-gradient-to-br from-zinc-900 via-zinc-900 to-amber-950/25 border-amber-400/90 ring-1 ring-amber-400/40 shadow-lg shadow-amber-950/20"
                            : "bg-zinc-900/60 hover:bg-zinc-850 border-zinc-800/90 hover:border-zinc-700 text-zinc-300"
                        }`}
                      >
                        {/* Selected Checkmark Badge */}
                        {isSelected && (
                          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center shadow-md z-10">
                            <svg
                              className="w-2.5 h-2.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3.5"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        )}

                        {/* Variant Thumbnail Preview with Fallback indication */}
                        <div className="w-12 h-14 rounded-lg bg-zinc-950 overflow-hidden border border-zinc-800 shrink-0 relative">
                          {vImg ? (
                            <img
                              src={vImg}
                              alt={`Variant ${idx + 1}`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] text-zinc-600">
                              Base
                            </div>
                          )}
                          {variant.images && variant.images.length > 0 ? (
                            <div className="absolute bottom-0.5 right-0.5 px-1 rounded bg-black/80 text-[8px] text-zinc-300 font-mono">
                              {variant.images.length} img
                            </div>
                          ) : (
                            <div className="absolute bottom-0.5 right-0.5 px-1 rounded bg-zinc-900/90 text-[7px] text-zinc-500 font-mono">
                              fallback
                            </div>
                          )}
                        </div>

                        {/* Variant Details & Attribute Pills */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-xs font-bold text-white tracking-tight">
                              ₹{Number(vPrice).toLocaleString("en-IN")}
                            </span>
                            {vStock !== null && (
                              <span
                                className={`text-[9px] font-medium ${
                                  vStock === 0
                                    ? "text-rose-400"
                                    : vStock < 10
                                      ? "text-amber-400"
                                      : "text-emerald-400"
                                }`}
                              >
                                {vStock === 0
                                  ? "Out of Stock"
                                  : vStock < 10
                                    ? `${vStock} left`
                                    : `${vStock} in stock`}
                              </span>
                            )}
                          </div>

                          {/* Multiple Attributes display */}
                          <div className="flex flex-wrap gap-1">
                            {attrs.length > 0 ? (
                              attrs.map(([key, val]) => (
                                <span
                                  key={key}
                                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                    isSelected
                                      ? "bg-amber-400/15 text-amber-300 border border-amber-400/30"
                                      : "bg-zinc-800/80 text-zinc-300 border border-zinc-700/50"
                                  }`}
                                >
                                  <span className="text-zinc-400 capitalize">
                                    {key}:
                                  </span>
                                  <span className="font-semibold text-white">
                                    {String(val)}
                                  </span>
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-zinc-500 italic">
                                Standard variant
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Stepper */}
            <div className="flex items-center gap-3 pt-0.5">
              <span className="text-[11px] text-zinc-400 uppercase tracking-wide">
                Quantity:
              </span>
              <div className="flex items-center rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors text-xs cursor-pointer"
                >
                  −
                </button>
                <span className="w-8 text-center font-mono font-bold text-xs text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => {
                      const maxAllowed =
                        currentStock !== null ? Math.max(1, currentStock) : 10;
                      return Math.min(maxAllowed, q + 1);
                    })
                  }
                  className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors text-xs cursor-pointer"
                >
                  +
                </button>
              </div>
              {currentStock !== null &&
                quantity >= currentStock &&
                currentStock > 0 && (
                  <span className="text-[10px] text-amber-400">
                    Max stock reached
                  </span>
                )}
            </div>

            {/* ========================================================== */}
            {/* THE TWO REQUIRED BUTTONS: ADD TO CART & BUY NOW */}
            {/* Note: "dont add funtionality to buy now button" */}
            {/* ========================================================== */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
              {/* Button 1: Add to Cart (Fully functional) */}
              <button
                id="add-to-cart-button"
                type="button"
                onClick={handleAddItemToCart}
                disabled={currentStock === 0}
                className={`w-full sm:flex-1 h-10.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 border shadow ${
                  currentStock === 0
                    ? "bg-zinc-900 border-zinc-800 text-zinc-500 cursor-not-allowed"
                    : isAddedSuccess
                      ? "bg-emerald-600 border-emerald-500 text-white scale-[0.98]"
                      : "bg-zinc-900 hover:bg-zinc-800 border-zinc-700 hover:border-zinc-600 text-white hover:text-amber-300 active:scale-[0.98] cursor-pointer"
                }`}
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
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <span>
                  {currentStock === 0
                    ? "Out of Stock"
                    : isAddedSuccess
                      ? "✓ Added"
                      : "Add to Cart"}
                </span>
              </button>

              {/* Button 2: Buy Now (NO functionality as explicitly requested) */}
              <button
                id="buy-now-button"
                type="button"
                onClick={() => {
                  /* Explicit requirement: dont add functionality to buy now button */
                }}
                className="w-full sm:flex-1 h-10.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 shadow-md cursor-pointer"
              >
                <span>Buy Now</span>
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </div>

            {/* Trust Perks / Badges */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80 text-center">
              <div className="p-2 rounded-lg bg-zinc-900/40 border border-zinc-800/60 flex flex-col items-center gap-0.5">
                <svg
                  className="w-3.5 h-3.5 text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span className="text-[10px] font-medium text-zinc-300">
                  100% Genuine
                </span>
              </div>

              <div className="p-2 rounded-lg bg-zinc-900/40 border border-zinc-800/60 flex flex-col items-center gap-0.5">
                <svg
                  className="w-3.5 h-3.5 text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span className="text-[10px] font-medium text-zinc-300">
                  7-Day Returns
                </span>
              </div>

              <div className="p-2 rounded-lg bg-zinc-900/40 border border-zinc-800/60 flex flex-col items-center gap-0.5">
                <svg
                  className="w-3.5 h-3.5 text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-[10px] font-medium text-zinc-300">
                  Free Shipping
                </span>
              </div>
            </div>

            {/* Accordion / Specifications */}
            <div className="space-y-1.5 pt-1">
              {/* Item 1: Specifications */}
              <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedSection(
                      expandedSection === "details" ? null : "details",
                    )
                  }
                  className="w-full px-3 py-2 text-left flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-zinc-300 hover:text-white"
                >
                  <span>Product Specifications</span>
                  <span>{expandedSection === "details" ? "−" : "+"}</span>
                </button>
                {expandedSection === "details" && (
                  <div className="px-3 pb-3 text-[11px] text-zinc-400 space-y-1.5 border-t border-zinc-800/60 pt-2">
                    {currentVariant &&
                      getVariantAttributes(currentVariant).map(([k, v]) => (
                        <div
                          key={k}
                          className="flex justify-between py-0.5 border-b border-zinc-800/40 capitalize"
                        >
                          <span className="text-zinc-500">{k}</span>
                          <span className="text-amber-300/90 font-medium">
                            {String(v)}
                          </span>
                        </div>
                      ))}
                    <div className="flex justify-between py-0.5 border-b border-zinc-800/40">
                      <span className="text-zinc-500">Fabric</span>
                      <span className="text-zinc-300 font-medium">
                        100% Combed Cotton
                      </span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-zinc-800/40">
                      <span className="text-zinc-500">Fit</span>
                      <span className="text-zinc-300 font-medium">
                        Relaxed Atelier Fit
                      </span>
                    </div>
                    {product.seller && (
                      <div className="flex justify-between py-0.5 border-b border-zinc-800/40">
                        <span className="text-zinc-500">Seller Ref</span>
                        <span className="text-zinc-300 font-mono text-[10px]">
                          {product.seller}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Item 2: Shipping & Returns */}
              <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedSection(
                      expandedSection === "shipping" ? null : "shipping",
                    )
                  }
                  className="w-full px-3 py-2 text-left flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-zinc-300 hover:text-white"
                >
                  <span>Shipping & Returns</span>
                  <span>{expandedSection === "shipping" ? "−" : "+"}</span>
                </button>
                {expandedSection === "shipping" && (
                  <div className="px-3 pb-3 text-[11px] text-zinc-400 space-y-1 border-t border-zinc-800/60 pt-2 leading-relaxed">
                    <p>
                      • Dispatched in 24–48 hours in discreet signature
                      packaging.
                    </p>
                    <p>
                      • Free express shipping on all prepaid orders across
                      India.
                    </p>
                    <p>
                      • 7 days exchange or doorstep pickup refund guarantee.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>



      {/* COMPACT FOOTER */}
      <footer className="mt-auto border-t border-zinc-800/80 bg-zinc-950/80 py-5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500">
          <div className="flex items-center gap-1.5">
            <span className="font-bold tracking-wider text-zinc-300 uppercase">
              SNITCH
            </span>
            <span>• Atelier Luxury E-Commerce</span>
          </div>
          <p>© {new Date().getFullYear()} SNITCH Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ProductDetails;
