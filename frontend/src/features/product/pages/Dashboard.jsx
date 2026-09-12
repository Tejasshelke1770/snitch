import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router";
import useProduct from "../hook/useProduct";

const Dashboard = () => {
  const { handleGetProductsBySeller, products = [], loading, error } = useProduct();

  // View state: "grid" or "table"
  const [viewMode, setViewMode] = useState("grid");

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [currencyFilter, setCurrencyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Quick View modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Copy feedback state
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    handleGetProductsBySeller();
  }, []);

  // Safe products list
  const safeProducts = useMemo(() => {
    return Array.isArray(products) ? products : [];
  }, [products]);

  // Copy ID helper
  const handleCopyId = (id, e) => {
    if (e) e.stopPropagation();
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open Quick View Modal
  const openQuickView = (product, e) => {
    if (e) e.stopPropagation();
    setSelectedProduct(product);
    setActiveImageIndex(0);
  };

  const handleCloseQuickView = () => {
    setSelectedProduct(null);
    setActiveImageIndex(0);
  };

  // Format currency
  const formatCurrency = (amount, currency = "INR") => {
    if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
    const num = Number(amount);
    const symbols = {
      INR: "₹",
      USD: "$",
      EUR: "€",
      GBP: "£",
    };
    const symbol = symbols[currency] || `${currency} `;
    try {
      return `${symbol}${num.toLocaleString("en-IN")}`;
    } catch {
      return `${symbol}${num}`;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Computed metrics
  const metrics = useMemo(() => {
    const totalCount = safeProducts.length;
    const totalValuation = safeProducts.reduce((acc, curr) => {
      const amount = Number(curr?.price?.amount) || 0;
      return acc + amount;
    }, 0);
    const avgPrice =
      totalCount > 0 ? Math.round(totalValuation / totalCount) : 0;

    // Most recent drop date
    const sortedDates = [...safeProducts].sort((a, b) => {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    const latestDate = sortedDates[0]?.createdAt
      ? formatDate(sortedDates[0].createdAt)
      : "None yet";

    return {
      totalCount,
      totalValuation,
      avgPrice,
      latestDate,
    };
  }, [safeProducts]);

  // Filtered and Sorted products
  const filteredProducts = useMemo(() => {
    return safeProducts
      .filter((item) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title?.toLowerCase().includes(q);
          const matchDesc = item.description?.toLowerCase().includes(q);
          const matchId = item._id?.toLowerCase().includes(q);
          const matchPrice = item.price?.amount?.toString().includes(q);
          if (!matchTitle && !matchDesc && !matchId && !matchPrice) {
            return false;
          }
        }
        // Currency filter
        if (currencyFilter !== "all") {
          if (item.price?.currency !== currencyFilter) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === "oldest") {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        if (sortBy === "price-high") {
          return (
            (Number(b.price?.amount) || 0) - (Number(a.price?.amount) || 0)
          );
        }
        if (sortBy === "price-low") {
          return (
            (Number(a.price?.amount) || 0) - (Number(b.price?.amount) || 0)
          );
        }
        if (sortBy === "title-asc") {
          return (a.title || "").localeCompare(b.title || "");
        }
        return 0;
      });
  }, [safeProducts, searchQuery, currencyFilter, sortBy]);

  // Available unique currencies
  const availableCurrencies = useMemo(() => {
    const set = new Set();
    safeProducts.forEach((p) => {
      if (p.price?.currency) set.add(p.price.currency);
    });
    return Array.from(set);
  }, [safeProducts]);

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-[#f4efe6] font-sans antialiased selection:bg-amber-400 selection:text-zinc-950 flex flex-col">
      {/* Background Ambient Warm Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
      </div>

      {/* STICKY TOP ATELIER NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[#09090b]/85 backdrop-blur-xl border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          {/* Left: Return to Catalog & Brand Identity */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              to="/"
              className="group flex items-center gap-2 text-zinc-400 hover:text-amber-400 transition-colors duration-200 text-xs sm:text-sm font-medium"
            >
              <svg
                className="w-4 h-4 transition-transform group-hover:-translate-x-1"
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
              <span>Back to Store</span>
            </Link>

            <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <span className="text-sm font-bold tracking-[0.3em] text-white uppercase">
                SNITCH
              </span>
              <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full bg-zinc-900 border border-amber-500/20 text-amber-300 font-mono text-[10px] tracking-wider uppercase">
                ATELIER // SELLER HUB
              </span>
            </div>
          </div>

          {/* Right: Quick CTA Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleGetProductsBySeller()}
              disabled={loading}
              title="Sync Latest Inventory"
              className="p-2 sm:px-3.5 sm:py-2 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 font-medium text-xs tracking-wide transition-all duration-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <svg
                className={`w-3.5 h-3.5 text-amber-400 ${loading ? "animate-spin" : ""}`}
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
              <span className="hidden sm:inline">Sync Inventory</span>
            </button>

            <Link
              to="/seller/create-products"
              className="px-4 sm:px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-zinc-950 font-semibold text-xs tracking-wide transition-all duration-200 shadow-[0_0_25px_rgba(245,158,11,0.25)] hover:shadow-[0_0_35px_rgba(245,158,11,0.4)] flex items-center gap-2 cursor-pointer"
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
                  strokeWidth="2.4"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>+ Create Product</span>
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT CANVAS */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* EDITORIAL PAGE HEADER */}
        <div className="mb-8 lg:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[11px] uppercase tracking-[0.25em] text-amber-400 font-mono font-semibold">
                SELLER PRODUCT INVENTORY
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              Garment Catalog & Matrix
            </h1>
            <p className="text-zinc-400 text-sm mt-1.5 leading-relaxed max-w-xl">
              Inspect your live apparel drops, verify technical details, track
              catalog valuation, and manage customer-facing listings.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono ">
            <span className="px-3 py-1.5 rounded-md bg-[#121216] border border-zinc-800">
              Live Drops:{" "}
              <strong className="text-amber-400">{safeProducts.length}</strong>
            </span>
            <span>&bull;</span>
            <span className="text-amber-400/90 font-medium">
              Aureate Obsidian
            </span>
          </div>
        </div>

        {/* ERROR NOTIFICATION BANNER */}
        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-sm flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-rose-300">
                  Catalog Sync Notice
                </p>
                <p className="text-xs text-rose-400/90 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleGetProductsBySeller()}
              className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-xs font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* 4 STAT SUMMARY CARDS (Aureate Obsidian Style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Stat 1: Total Garments */}
          <div className="relative p-5 rounded-2xl bg-[#121216] border border-zinc-800 hover:border-amber-400/40 transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.25)]">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider">
                Total Garments
              </span>
              <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400 flex items-center justify-center">
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
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
                {metrics.totalCount}
              </span>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Active Vault
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Verified styles on storefront
            </p>
          </div>

          {/* Stat 2: Catalog Valuation */}
          <div className="relative p-5 rounded-2xl bg-[#121216] border border-zinc-800 hover:border-amber-400/40 transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.25)]">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider">
                Catalog Valuation
              </span>
              <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400 flex items-center justify-center">
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-400">
                {formatCurrency(metrics.totalValuation, "INR")}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Combined retail listing price
            </p>
          </div>

          {/* Stat 3: Average Garment Price */}
          <div className="relative p-5 rounded-2xl bg-[#121216] border border-zinc-800 hover:border-amber-400/40 transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.25)]">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider">
                Avg. Garment Price
              </span>
              <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400 flex items-center justify-center">
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
                {formatCurrency(metrics.avgPrice, "INR")}
              </span>
              <span className="text-[10px] font-mono text-zinc-400">/ SKU</span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Across all atelier drops
            </p>
          </div>

          {/* Stat 4: Latest Drop Date */}
          <div className="relative p-5 rounded-2xl bg-[#121216] border border-zinc-800 hover:border-amber-400/40 transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.25)]">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider">
                Latest Release
              </span>
              <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400 flex items-center justify-center">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold font-mono text-amber-300 truncate">
                {metrics.latestDate}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Most recently published item
            </p>
          </div>
        </div>

        {/* 3. CONTROL MATRIX BAR (Search, Filters, Sort, View Toggle) */}
        <div className="bg-[#121216] rounded-2xl border border-zinc-800 p-4 sm:p-5 mb-8 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
            {/* Search and Currency Filter */}
            <div className="flex flex-1 flex-col sm:flex-row gap-3 items-center">
              {/* Search Bar */}
              <div className="relative w-full sm:w-80">
                <svg
                  className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, description, or ID..."
                  className="w-full bg-[#181820] text-white placeholder:text-zinc-600 pl-10 pr-8 py-2.5 rounded-xl border border-zinc-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 text-xs sm:text-sm outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Currency Dropdown */}
              {availableCurrencies.length > 1 && (
                <div className="w-full sm:w-auto">
                  <select
                    value={currencyFilter}
                    onChange={(e) => setCurrencyFilter(e.target.value)}
                    className="w-full sm:w-auto bg-[#181820] text-white text-xs py-2.5 px-3.5 rounded-xl border border-zinc-800 focus:border-amber-400 outline-none cursor-pointer"
                  >
                    <option value="all">All Currencies</option>
                    {availableCurrencies.map((curr) => (
                      <option key={curr} value={curr}>
                        {curr}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Sorting & Display View Toggles */}
            <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-zinc-800/80">
              {/* Sort Selector */}
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="hidden sm:inline font-mono">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#181820] text-white text-xs py-2.5 px-3 rounded-xl border border-zinc-800 focus:border-amber-400 outline-none cursor-pointer"
                >
                  <option value="newest">Recently Added (Newest)</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="title-asc">Title: A to Z</option>
                </select>
              </div>

              {/* View Switcher: Grid vs Table */}
              <div className="flex items-center bg-[#181820] p-1 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  title="Luxury Card Grid"
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-amber-400 text-zinc-950 shadow"
                      : "text-zinc-400 hover:text-white"
                  }`}
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
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  title="Table Matrix View"
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "table"
                      ? "bg-amber-400 text-zinc-950 shadow"
                      : "text-zinc-400 hover:text-white"
                  }`}
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
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Status Sub-row & Counter */}
          <div className="flex flex-wrap items-center justify-between mt-3 pt-3 border-t border-zinc-800/60 text-xs font-mono text-zinc-500">
            <div className="flex items-center gap-2">
              <span>
                Showing{" "}
                <strong className="text-amber-400">
                  {filteredProducts.length}
                </strong>{" "}
                of {safeProducts.length} garments
              </span>
              <span>&bull;</span>
              <span className="inline-flex items-center gap-1.5 text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live In Storefront
              </span>
            </div>

            {(searchQuery ||
              currencyFilter !== "all" ||
              sortBy !== "newest") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCurrencyFilter("all");
                  setSortBy("newest");
                }}
                className="text-amber-400 hover:text-amber-300 underline cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* LOADING SKELETON STATE */}
        {loading && safeProducts.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-[#121216] border border-zinc-800 overflow-hidden animate-pulse"
              >
                <div className="h-64 sm:h-72 bg-zinc-900/80" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-zinc-800 rounded w-3/4" />
                  <div className="h-3 bg-zinc-900 rounded w-full" />
                  <div className="h-3 bg-zinc-900 rounded w-1/2" />
                  <div className="pt-4 border-t border-zinc-800/80 flex justify-between">
                    <div className="h-4 bg-zinc-800 rounded w-1/4" />
                    <div className="h-4 bg-zinc-800 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE - NO PRODUCTS AT ALL */}
        {!loading && safeProducts.length === 0 && (
          <div className="p-8 sm:p-14 rounded-2xl bg-[#121216] border border-zinc-800 text-center relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 shadow">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.6"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
              No Products in Atelier Catalog
            </h3>
            <p className="text-zinc-400 text-sm max-w-md mx-auto mt-2 leading-relaxed">
              You haven't published any streetwear garments yet. Create your
              first product complete with technical specifications, high-res
              stills, and pricing.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                to="/seller/create-products"
                className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-xs tracking-wider uppercase transition-all shadow-[0_0_25px_rgba(245,158,11,0.25)] flex items-center gap-2 cursor-pointer"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>+ Create Your First Product</span>
              </Link>
            </div>
          </div>
        )}

        {/* EMPTY STATE - NO SEARCH MATCHES */}
        {!loading &&
          safeProducts.length > 0 &&
          filteredProducts.length === 0 && (
            <div className="p-10 rounded-2xl bg-[#121216] border border-zinc-800 text-center">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center mx-auto mb-3">
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">
                No Matching Garments
              </h3>
              <p className="text-zinc-400 text-xs mt-1">
                No products found matching "{searchQuery}". Try a different
                keyword or reset filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCurrencyFilter("all");
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-medium transition-colors cursor-pointer"
              >
                Clear Search Query
              </button>
            </div>
          )}

        {/* 4. LUXURY PRODUCT CARD GRID VIEW */}
        {!loading && viewMode === "grid" && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const coverImage = product.images?.[0]?.url;
              const imageCount = product.images?.length || 0;
              const isCopied = copiedId === product._id;

              return (
                <div
                  key={product._id}
                  onClick={() => openQuickView(product)}
                  className="group relative rounded-2xl bg-[#121216] border border-zinc-800 hover:border-amber-400/50 transition-all duration-300 flex flex-col overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.3)] hover:-translate-y-1 cursor-pointer"
                >
                  {/* Visual Presentation Container */}
                  <div className="relative aspect-[4/5] w-full bg-zinc-900 overflow-hidden">
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt={product.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/60 text-zinc-600">
                        <svg
                          className="w-12 h-12 mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-xs font-mono">
                          No Image Stills
                        </span>
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121216] via-transparent to-black/30 pointer-events-none" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start z-10">
                      <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-amber-500/30 text-amber-300 text-[10px] font-mono font-semibold tracking-wider uppercase flex items-center gap-1.5 shadow">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        Active Drop
                      </span>
                      {imageCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 text-zinc-300 text-[10px] font-mono">
                          {imageCount} {imageCount === 1 ? "Still" : "Stills"}
                        </span>
                      )}
                    </div>

                    {/* Floating Quick Action Buttons (Hover) */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col gap-2 z-10">
                      <button
                        type="button"
                        onClick={(e) => openQuickView(product, e)}
                        className="p-2 rounded-xl bg-black/80 text-amber-400 hover:bg-amber-400 hover:text-zinc-950 border border-amber-500/30 shadow-lg backdrop-blur transition-all cursor-pointer"
                        title="Quick View Details"
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleCopyId(product._id, e)}
                        className="p-2 rounded-xl bg-black/80 text-zinc-300 hover:text-amber-400 border border-zinc-800 shadow-lg backdrop-blur transition-all cursor-pointer"
                        title={isCopied ? "Copied!" : "Copy Product ID"}
                      >
                        {isCopied ? (
                          <svg
                            className="w-4 h-4 text-emerald-400"
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
                        ) : (
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
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Price Badge on bottom right of image */}
                    <div className="absolute bottom-3 right-3 bg-[#09090b]/90 backdrop-blur-md px-3 py-1 rounded-xl border border-amber-500/20 z-10">
                      <span className="font-mono font-bold text-sm text-amber-300">
                        {formatCurrency(
                          product.price?.amount,
                          product.price?.currency,
                        )}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 ml-1 uppercase">
                        {product.price?.currency || "INR"}
                      </span>
                    </div>
                  </div>

                  {/* Card Info Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Sub-header with creation date & truncated ID */}
                      <div className="flex items-center justify-between text-xs font-mono text-zinc-500 mb-2">
                        <span
                          className="truncate max-w-[140px]"
                          title={product._id}
                        >
                          ID: #{product._id?.slice(-6)}
                        </span>
                        <span>{formatDate(product.createdAt)}</span>
                      </div>

                      {/* Product Title */}
                      <h3 className="text-base font-semibold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                        {product.title}
                      </h3>

                      {/* Description preview */}
                      <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {product.description ||
                          "No technical description recorded."}
                      </p>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="mt-4 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => handleCopyId(product._id, e)}
                        className="text-[11px] font-mono text-zinc-400 hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isCopied ? "Copied ID" : "Copy ID"}</span>
                      </button>

                      <span className="text-amber-400 text-xs font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Inspect Spec &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 5. TABLE MATRIX VIEW (Alternative Table Layout) */}
        {!loading && viewMode === "table" && filteredProducts.length > 0 && (
          <div className="overflow-x-auto bg-[#121216] rounded-2xl border border-zinc-800 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400 text-[11px] font-mono uppercase tracking-wider">
                  <th className="py-4 px-4 sm:px-6">Garment & Narrative</th>
                  <th className="py-4 px-4">Product ID</th>
                  <th className="py-4 px-4">Retail Valuation</th>
                  <th className="py-4 px-4">Media Stills</th>
                  <th className="py-4 px-4">Release Date</th>
                  <th className="py-4 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-xs">
                {filteredProducts.map((product) => {
                  const coverImage = product.images?.[0]?.url;
                  const isCopied = copiedId === product._id;

                  return (
                    <tr
                      key={product._id}
                      onClick={() => openQuickView(product)}
                      className="hover:bg-zinc-800/30 transition-colors cursor-pointer"
                    >
                      {/* Garment & Thumbnail */}
                      <td className="py-3.5 px-4 sm:px-6 flex items-center gap-3">
                        <div className="w-12 h-14 rounded-xl bg-zinc-900 overflow-hidden shrink-0 border border-zinc-800">
                          {coverImage ? (
                            <img
                              src={coverImage}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600 text-[10px]">
                              N/A
                            </div>
                          )}
                        </div>
                        <div className="max-w-xs">
                          <p className="font-semibold text-white hover:text-amber-300 transition-colors truncate">
                            {product.title}
                          </p>
                          <p className="text-zinc-500 text-[11px] truncate mt-0.5">
                            {product.description}
                          </p>
                        </div>
                      </td>

                      {/* Product ID */}
                      <td className="py-3.5 px-4 font-mono text-zinc-400 text-[11px]">
                        <button
                          type="button"
                          onClick={(e) => handleCopyId(product._id, e)}
                          className="hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Click to copy ID"
                        >
                          <span>#{product._id?.slice(-8)}</span>
                          <span className="text-[10px] text-zinc-600">
                            {isCopied ? "✓" : "📋"}
                          </span>
                        </button>
                      </td>

                      {/* Retail Price */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-amber-300">
                        {formatCurrency(
                          product.price?.amount,
                          product.price?.currency,
                        )}
                      </td>

                      {/* Media Stills */}
                      <td className="py-3.5 px-4 text-zinc-300 font-mono">
                        <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px]">
                          {product.images?.length || 0} stills
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px]">
                        {formatDate(product.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={(e) => openQuickView(product, e)}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-amber-400 hover:text-zinc-950 text-zinc-300 transition-colors cursor-pointer"
                          title="View Details"
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
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
      </main>

      {/* QUICK VIEW SPECIFICATION MODAL */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={handleCloseQuickView}
        >
          <div
            className="relative w-full max-w-3xl bg-[#121216] border border-zinc-800 rounded-3xl overflow-hidden shadow-[0_10px_50px_rgba(0,0,0,0.7)] my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/40">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-semibold">
                    GARMENT SPECIFICATION
                  </span>
                  <h3 className="text-base sm:text-lg font-semibold text-white truncate max-w-md mt-0.5">
                    {selectedProduct.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseQuickView}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Image Showcase */}
              {selectedProduct.images && selectedProduct.images.length > 0 ? (
                <div>
                  {/* Primary Featured Image */}
                  <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl bg-zinc-900 overflow-hidden border border-zinc-800 mb-3">
                    <img
                      src={selectedProduct.images[activeImageIndex]?.url}
                      alt={selectedProduct.title}
                      className="w-full h-full object-contain object-center"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm border border-zinc-800 font-mono text-[10px] text-zinc-300">
                      Still {activeImageIndex + 1} of{" "}
                      {selectedProduct.images.length}
                    </div>
                  </div>

                  {/* Thumbnail Row */}
                  {selectedProduct.images.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                      {selectedProduct.images.map((img, idx) => (
                        <button
                          key={img._id || idx}
                          type="button"
                          onClick={() => setActiveImageIndex(idx)}
                          className={`relative w-16 h-16 rounded-xl overflow-hidden border shrink-0 transition-all cursor-pointer ${
                            activeImageIndex === idx
                              ? "border-amber-400 ring-2 ring-amber-400/20"
                              : "border-zinc-800 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={img.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-center text-zinc-500 font-mono text-xs">
                  No visual assets uploaded for this product
                </div>
              )}

              {/* Price & Status Pill */}
              <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                    Retail Price
                  </span>
                  <div className="text-2xl font-bold font-mono text-amber-400 mt-0.5">
                    {formatCurrency(
                      selectedProduct.price?.amount,
                      selectedProduct.price?.currency,
                    )}
                    <span className="text-xs text-zinc-500 ml-1.5 font-normal">
                      {selectedProduct.price?.currency}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                    ● Live Catalog
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleCopyId(selectedProduct._id, e)}
                    className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 hover:border-amber-400/50 text-zinc-300 text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>
                      {copiedId === selectedProduct._id
                        ? "Copied!"
                        : "Copy SKU ID"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Technical Description */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                  Technical Specifications & Narrative
                </h4>
                <div className="p-4 rounded-xl bg-[#181820] border border-zinc-800 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedProduct.description ||
                    "No narrative details provided."}
                </div>
              </div>

              {/* System Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-xs">
                  <span className="font-mono text-zinc-500 uppercase text-[10px]">
                    Product Mongo ID
                  </span>
                  <p className="font-mono text-zinc-300 break-all mt-1">
                    {selectedProduct._id}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-xs">
                  <span className="font-mono text-zinc-500 uppercase text-[10px]">
                    Seller Account ID
                  </span>
                  <p className="font-mono text-zinc-300 break-all mt-1">
                    {selectedProduct.seller || "N/A"}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-xs">
                  <span className="font-mono text-zinc-500 uppercase text-[10px]">
                    Created At
                  </span>
                  <p className="font-mono text-zinc-300 mt-1">
                    {selectedProduct.createdAt
                      ? new Date(selectedProduct.createdAt).toLocaleString()
                      : "N/A"}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-xs">
                  <span className="font-mono text-zinc-500 uppercase text-[10px]">
                    Last Updated
                  </span>
                  <p className="font-mono text-zinc-300 mt-1">
                    {selectedProduct.updatedAt
                      ? new Date(selectedProduct.updatedAt).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-500">
                SNITCH ATELIER RECORD
              </span>
              <button
                type="button"
                onClick={handleCloseQuickView}
                className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold tracking-wide transition-colors cursor-pointer"
              >
                Close Spec
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-zinc-800/80 bg-[#09090b] py-6 px-4 sm:px-6 lg:px-8 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>&copy; 2026 SNITCH CLOTHING ATELIER. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-4 text-zinc-400">
            <span className="hover:text-amber-400 transition-colors cursor-pointer">
              Privacy Policy
            </span>
            <span>&bull;</span>
            <span className="hover:text-amber-400 transition-colors cursor-pointer">
              Seller Terms
            </span>
            <span>&bull;</span>
            <span className="hover:text-amber-400 transition-colors cursor-pointer">
              Atelier Guidelines
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
