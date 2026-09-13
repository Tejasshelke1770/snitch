import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router";
import useProduct from "../hook/useProduct";

const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

// Helper to extract image URL safely
const extractImageUrl = (img) => {
  if (!img) return "";
  if (typeof img === "string") return img;
  return img.url || "";
};

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const {
    handleGetProductById,
    handleAddProductVariants,
    handleUpdateVariantStock,
    handleDeleteVariant,
  } = useProduct();

  // Core state - minimal & clean
  const [product, setProduct] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New variant form state
  const [variantForm, setVariantForm] = useState({
    size: "M",
    color: "",
    customAttrKey: "",
    customAttrVal: "",
    stock: 10,
    priceAmount: "",
    imageFiles: [],
    imagePreviews: [],
  });

  // Fetch product on mount
  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      if (productId) {
        const data = await handleGetProductById(productId);
        if (isMounted && data) {
          setProduct(data);
          // initialize default price in form
          setVariantForm((prev) => ({
            ...prev,
            priceAmount: data.price?.amount || "",
          }));
        }
      }
    };
    fetchProduct();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Compute aggregate statistics
  const totalStock = useMemo(() => {
    if (!product?.variants) return 0;
    return product.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
  }, [product]);

  const variantsList = useMemo(() => {
    return Array.isArray(product?.variants) ? product.variants : [];
  }, [product]);

  // Handle stock adjustments via steppers
  const handleStockStep = async (variantId, currentStock, delta) => {
    const nextStock = Math.max(0, currentStock + delta);
    if (nextStock === currentStock) return;

    // Optimistic UI update
    setProduct((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        variants: prev.variants.map((v) =>
          v._id === variantId ? { ...v, stock: nextStock } : v,
        ),
      };
    });

    const res = await handleUpdateVariantStock(
      product._id,
      variantId,
      nextStock,
    );
    if (res.success && res.product) {
      setProduct(res.product);
      showToast(`Stock updated to ${nextStock}`);
    } else {
      showToast("Failed to update stock");
    }
  };

  // Handle direct stock input change
  const handleDirectStockChange = async (variantId, val) => {
    const nextStock = Math.max(0, parseInt(val, 10) || 0);

    setProduct((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        variants: prev.variants.map((v) =>
          v._id === variantId ? { ...v, stock: nextStock } : v,
        ),
      };
    });

    const res = await handleUpdateVariantStock(
      product._id,
      variantId,
      nextStock,
    );
    if (res.success && res.product) {
      setProduct(res.product);
      showToast(`Stock updated to ${nextStock}`);
    }
  };

  // Handle variant deletion
  const handleDelete = async (variantId) => {
    if (!window.confirm("Are you sure you want to remove this variant?"))
      return;

    const res = await handleDeleteVariant(product._id, variantId);
    if (res.success && res.product) {
      setProduct(res.product);
      showToast("Variant removed");
    } else {
      showToast("Could not delete variant");
    }
  };

  // Handle variant form submit
  const handleCreateVariantSubmit = async (e) => {
    e.preventDefault();
    if (!product) return;

    // setIsSubmitting(true);

    const attributes = {};
    if (variantForm.size) attributes.size = variantForm.size;
    if (variantForm.color.trim()) attributes.color = variantForm.color.trim();
    if (variantForm.customAttrKey.trim() && variantForm.customAttrVal.trim()) {
      attributes[variantForm.customAttrKey.trim()] =
        variantForm.customAttrVal.trim();
    }

    const price = Number(variantForm.priceAmount) || product.price?.amount || 0;
    const stock = Number(variantForm.stock) || 0;

    const formData = new FormData();
    formData.append("stock", stock);
    formData.append("priceAmount", price);
    formData.append("priceCurrency", product.price?.currency);
    formData.append("attributes", JSON.stringify(attributes));

    if (variantForm.imageFiles && variantForm.imageFiles.length > 0) {
      variantForm.imageFiles.forEach((file) => {
        formData.append("images", file);
      });
    }
    const res = await handleAddProductVariants({
      productId: product._id,
      formData,
    });

    // setIsSubmitting(false);

    if (res.success && res.product) {
      setProduct(res.product);
      setIsAddModalOpen(false);
      showToast("Variant created successfully");
      // Reset form
      setVariantForm({
        size: "M",
        color: "",
        customAttrKey: "",
        customAttrVal: "",
        stock: 10,
        priceAmount: product.price?.amount || "",
        imageFiles: [],
        imagePreviews: [],
      });
    } else {
      showToast(res.error || "Failed to create variant");
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen w-full bg-[#09090b] text-[#f4efe6] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-zinc-400 font-mono">
            Loading Product Dossier...
          </p>
        </div>
      </div>
    );
  }

  const primaryImage = extractImageUrl(product.images?.[0]);

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-[#f4efe6] font-sans antialiased selection:bg-amber-400 selection:text-zinc-950 flex flex-col relative">
      {/* Warm Ambient Glow Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/3 w-[32rem] h-[32rem] bg-amber-500/[0.035] rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -right-24 w-[28rem] h-[28rem] bg-amber-600/[0.025] rounded-full blur-[140px]" />
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

      {/* ATELIER TOPBAR */}
      <header className="sticky top-0 z-40 bg-[#09090b]/90 backdrop-blur-xl border-b border-zinc-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Brand Identity & Breadcrumb */}
          <div className="flex items-center gap-4">
            <Link
              to="/seller/dashboard"
              className="group flex items-center gap-2"
            >
              <span className="text-lg font-black tracking-[0.25em] text-white group-hover:text-amber-400 transition-colors uppercase">
                SNITCH
              </span>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate("/seller/dashboard")}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors py-1.5 px-3 rounded-lg hover:bg-zinc-800/60"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>Dashboard</span>
            </button>

            <Link
              to={`/product/${product._id}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-amber-300 py-1.5 px-2.5 rounded-lg hover:bg-zinc-800/60 transition-colors"
            >
              <span>Store Preview</span>
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
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </Link>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-amber-400 hover:bg-amber-300 text-zinc-950 transition-all shadow-md shadow-amber-500/10 cursor-pointer"
            >
              <span className="text-sm leading-none">+</span>
              <span>Create Variant</span>
            </button>
          </div>
        </div>
      </header>

      {/* BREADCRUMB */}
      <nav
        aria-label="Breadcrumb"
        className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-3 pb-1 text-[11px] text-zinc-500 flex items-center gap-1.5"
      >
        <Link
          to="/seller/dashboard"
          className="hover:text-amber-400 transition-colors"
        >
          Seller Hub
        </Link>
        <span>/</span>
        <span className="text-amber-400 truncate max-w-[200px]">
          {product.title}
        </span>
        <span>/</span>
        <span className="text-zinc-400">Variant Matrix</span>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-5 space-y-6">
        {/* ========================================================== */}
        {/* PARENT PRODUCT DOSSIER / SUMMARY CARD */}
        {/* ========================================================== */}
        <div className="p-4 sm:p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-lg">
          <div className="flex items-center gap-4 min-w-0">
            {/* Primary Image Thumbnail */}
            <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden bg-zinc-950 border border-amber-500/20 shrink-0">
              {primaryImage ? (
                <img
                  src={primaryImage}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-600 font-mono">
                  No Image
                </div>
              )}
            </div>

            {/* Product Metadata */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400/90 font-semibold">
                  MASTER GARMENT
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  ID: {product._id?.slice(-8)}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate mt-0.5">
                {product.title}
              </h1>
              <p className="text-xs text-zinc-400 line-clamp-1 max-w-xl mt-0.5">
                {product.description}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="font-mono font-bold text-white">
                  ₹{(product.price?.amount || 0).toLocaleString("en-IN")}{" "}
                  <span className="text-[10px] text-amber-400/80 font-normal">
                    {product.price?.currency || "INR"} (Base MSRP)
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 md:border-l border-zinc-800/80 pt-3 md:pt-0 md:pl-6 shrink-0">
            <div className="flex-1 md:flex-none text-center px-3 py-1.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
              <p className="text-[10px] font-mono uppercase text-zinc-400">
                Variants
              </p>
              <p className="text-base font-mono font-bold text-white">
                {variantsList.length}
              </p>
            </div>
            <div className="flex-1 md:flex-none text-center px-3 py-1.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
              <p className="text-[10px] font-mono uppercase text-zinc-400">
                Total Stock
              </p>
              <p className="text-base font-mono font-bold text-amber-400">
                {totalStock}{" "}
                <span className="text-[10px] font-normal text-zinc-500">
                  units
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* VARIANT MATRIX TABLE SECTION */}
        {/* ========================================================== */}
        <div className="rounded-xl bg-zinc-900/40 border border-zinc-800/80 overflow-hidden shadow-lg">
          {/* Table Header Controls */}
          <div className="px-4 py-3.5 border-b border-zinc-800/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Variant Inventory Matrix
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-400">
                {variantsList.length} Active SKUs
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors flex items-center gap-1"
            >
              <span>+ Add Variant</span>
            </button>
          </div>

          {/* Table Content */}
          {variantsList.length === 0 ? (
            <div className="py-14 px-4 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-white">
                No variants configured yet
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm">
                Create variants to specify sizes, colorways, individual pricing,
                and warehouse stock units for this garment.
              </p>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="mt-2 h-9 px-4 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-colors"
              >
                + Create First Variant
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950/60 text-[10px] uppercase font-mono tracking-wider text-zinc-400 border-b border-zinc-800/80">
                  <tr>
                    <th className="py-3 px-4">Variant Image</th>
                    <th className="py-3 px-4">Attributes</th>
                    <th className="py-3 px-4">Variant Price</th>
                    <th className="py-3 px-4 text-center">Stock Quantity</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {variantsList.map((variant, idx) => {
                    const variantImg = extractImageUrl(variant.images?.[0]) || primaryImage;
                    const stockNum = Number(variant.stock) || 0;
                    const priceAmount = variant.price?.amount ?? product.price?.amount ?? 0;
                    const currency = variant.price?.currency || product.price?.currency;

                    // Parse attributes safely
                    let attrs = [];
                    if (variant.attributes) {
                      if (variant.attributes instanceof Map) {
                        attrs = Array.from(variant.attributes.entries());
                      } else if (typeof variant.attributes === "object") {
                        attrs = Object.entries(variant.attributes);
                      }
                    }

                    // Stock health status
                    const isOutOfStock = stockNum === 0;
                    const isLowStock = stockNum > 0 && stockNum < 10;

                    return (
                      <tr
                        key={variant._id || idx}
                        className="hover:bg-zinc-800/30 transition-colors"
                      >
                        {/* Variant Thumbnail */}
                        <td className="py-3 px-4">
                          <div className="w-12 h-14 rounded-lg bg-zinc-950 overflow-hidden border border-zinc-800 shrink-0">
                            {variantImg ? (
                              <img
                                src={variantImg}
                                alt="Variant preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[9px] text-zinc-600">
                                None
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Dynamic Attributes */}
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {attrs.length > 0 ? (
                              attrs.map(([key, val]) => (
                                <span
                                  key={key}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700/60 text-[10px]"
                                >
                                  <span className="text-zinc-400 capitalize">
                                    {key}:
                                  </span>
                                  <span className="font-semibold text-white uppercase">
                                    {val}
                                  </span>
                                </span>
                              ))
                            ) : (
                              <span className="text-zinc-500 italic text-[11px]">
                                Default
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Variant Price */}
                        <td className="py-3 px-4 font-mono font-semibold text-white">
                          ₹{priceAmount.toLocaleString("en-IN")}{" "}
                          <span className="text-[10px] text-zinc-500 font-normal">
                            {currency}
                          </span>
                        </td>

                        {/* Stock Management Controls */}
                        <td className="py-3 px-4">
                          <td className="py-3 px-4 font-mono font-semibold text-white">
                            {stockNum}
                          </td>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-4">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              Low ({stockNum})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              In Stock
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDelete(variant._id)}
                            className="p-1.5 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete Variant"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================== */}
      {/* CREATE VARIANT MODAL DIALOG */}
      {/* ========================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => !isSubmitting && setIsAddModalOpen(false)}
          />

          {/* Modal Box */}
          <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl z-10 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Create Product Variant
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Configure custom size, color attributes, and dedicated stock.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                disabled={isSubmitting}
                className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-900"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleCreateVariantSubmit}
              className="p-5 space-y-4"
            >
              {/* Size Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Size Attribute
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {COMMON_SIZES.map((size) => {
                    const isSelected = variantForm.size === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() =>
                          setVariantForm((prev) => ({ ...prev, size }))
                        }
                        className={`h-8 rounded-lg text-xs font-bold transition-all border ${
                          isSelected
                            ? "bg-amber-400 text-zinc-950 border-amber-400"
                            : "bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Attribute */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                  Colorway (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Obsidian Black, Acid Charcoal, Washed Olive"
                  value={variantForm.color}
                  onChange={(e) =>
                    setVariantForm((prev) => ({
                      ...prev,
                      color: e.target.value,
                    }))
                  }
                  className="w-full h-9 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Custom Attribute (Key / Value) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1">
                    Custom Attribute Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Fit, Material"
                    value={variantForm.customAttrKey}
                    onChange={(e) =>
                      setVariantForm((prev) => ({
                        ...prev,
                        customAttrKey: e.target.value,
                      }))
                    }
                    className="w-full h-8.5 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1">
                    Custom Value
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Boxy Oversized"
                    value={variantForm.customAttrVal}
                    onChange={(e) =>
                      setVariantForm((prev) => ({
                        ...prev,
                        customAttrVal: e.target.value,
                      }))
                    }
                    className="w-full h-8.5 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Stock & Price Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                    Initial Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={variantForm.stock}
                    onChange={(e) =>
                      setVariantForm((prev) => ({
                        ...prev,
                        stock: e.target.value,
                      }))
                    }
                    className="w-full h-9 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                    Variant Price (INR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder={String(product.price?.amount || 0)}
                    value={variantForm.priceAmount}
                    onChange={(e) =>
                      setVariantForm((prev) => ({
                        ...prev,
                        priceAmount: e.target.value,
                      }))
                    }
                    className="w-full h-9 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Variant Images Upload (Multiple) */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1">
                  Variant Images (Upload multiple images, optional)
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 0) {
                        const newPreviews = files.map((file) =>
                          URL.createObjectURL(file),
                        );
                        setVariantForm((prev) => ({
                          ...prev,
                          imageFiles: [...prev.imageFiles, ...files],
                          imagePreviews: [
                            ...prev.imagePreviews,
                            ...newPreviews,
                          ],
                        }));
                      }
                    }}
                    className="text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
                  />

                  {/* Previews Grid */}
                  {variantForm.imagePreviews.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {variantForm.imagePreviews.map((previewUrl, idx) => (
                        <div
                          key={idx}
                          className="relative w-12 h-14 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-900 group shrink-0"
                        >
                          <img
                            src={previewUrl}
                            alt={`Variant image preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setVariantForm((prev) => ({
                                ...prev,
                                imageFiles: prev.imageFiles.filter(
                                  (_, i) => i !== idx,
                                ),
                                imagePreviews: prev.imagePreviews.filter(
                                  (_, i) => i !== idx,
                                ),
                              }));
                            }}
                            className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/80 hover:bg-rose-600 text-white text-[9px] flex items-center justify-center transition-colors"
                            title="Remove image"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
                  className="h-9 px-4 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-9 px-4 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-amber-500/20 disabled:opacity-60"
                >
                  {isSubmitting ? "Creating..." : "Save Variant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-auto border-t border-zinc-800/80 bg-zinc-950/80 py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500">
          <div className="flex items-center gap-1.5">
            <span className="font-bold tracking-wider text-zinc-300 uppercase">
              SNITCH
            </span>
            <span>• Atelier Inventory Control</span>
          </div>
          <p>© {new Date().getFullYear()} SNITCH Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default EditProduct;
