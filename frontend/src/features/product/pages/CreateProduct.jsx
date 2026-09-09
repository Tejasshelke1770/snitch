import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import useProduct from "../hook/useProduct";

const CURRENCIES = [
  { code: "INR", symbol: "₹", label: "INR (₹) - Indian Rupee" },
  { code: "USD", symbol: "$", label: "USD ($) - US Dollar" },
  { code: "EUR", symbol: "€", label: "EUR (€) - Euro" },
  { code: "GBP", symbol: "£", label: "GBP (£) - British Pound" },
];

const PRESET_TAGS = [
  "500 GSM",
  "French Terry",
  "Acid Wash Patina",
  "Oversized Drop-Shoulder",
  "Double-Layer Hood",
  "Crafted in Atelier",
];

const MAX_IMAGES = 7;

const CreateProduct = () => {
  const navigate = useNavigate();
  const { handleCreateProduct, loading, error: apiError } = useProduct();
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priceAmount: "",
    priceCurrency: "INR",
  });

  // Images state: array of { id, file, previewUrl, name, size }
  const [images, setImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState("");

  // Clean up object URLs on unmount or when images change
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.previewUrl) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
    };
  }, [images]);

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Add preset technical tags to description
  const handleAddTag = (tag) => {
    setFormData((prev) => {
      const current = prev.description.trim();
      const updated = current ? `${current} • ${tag}` : tag;
      return { ...prev, description: updated };
    });
    if (formErrors.description) {
      setFormErrors((prev) => ({ ...prev, description: "" }));
    }
  };

  // Process selected image files
  const processFiles = (fileList) => {
    setWarningMessage("");
    const newFiles = Array.from(fileList).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (newFiles.length === 0) {
      setWarningMessage("Please select valid image files (JPG, PNG, WebP).");
      return;
    }

    const availableSlots = MAX_IMAGES - images.length;
    if (availableSlots <= 0) {
      setWarningMessage(`Maximum ${MAX_IMAGES} images reached.`);
      return;
    }

    let filesToAdd = newFiles;
    if (newFiles.length > availableSlots) {
      setWarningMessage(
        `Only ${availableSlots} more image slot${availableSlots > 1 ? "s" : ""} available. Extra images were skipped.`,
      );
      filesToAdd = newFiles.slice(0, availableSlots);
    }

    const newImageObjects = filesToAdd.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2),
      previewUrl: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImageObjects]);

    if (formErrors.images) {
      setFormErrors((prev) => ({ ...prev, images: "" }));
    }
  };

  // Handle file input change
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = "";
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Remove individual image
  const handleRemoveImage = (idToRemove) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === idToRemove);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((img) => img.id !== idToRemove);
    });
    setWarningMessage("");
  };

  // Make an image the primary cover (move to index 0)
  const handleMakeCover = (index) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return copy;
    });
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = "Product title is required.";
    } else if (formData.title.trim().length < 3) {
      errors.title = "Title must be at least 3 characters.";
    }

    if (!formData.description.trim()) {
      errors.description = "Product technical description is required.";
    } else if (formData.description.trim().length < 10) {
      errors.description =
        "Please provide more details (minimum 10 characters).";
    }

    if (!formData.priceAmount) {
      errors.priceAmount = "Retail price amount is required.";
    } else {
      const priceNum = parseFloat(formData.priceAmount);
      if (isNaN(priceNum) || priceNum <= 0) {
        errors.priceAmount = "Please enter a valid positive price.";
      }
    }

    if (!formData.priceCurrency) {
      errors.priceCurrency = "Currency is required.";
    }

    if (images.length === 0) {
      errors.images = "At least one product image is required (up to 7).";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setWarningMessage("");

    if (!validateForm()) {
      window.scrollTo({ top: 100, behavior: "smooth" });
      return;
    }

    // Build FormData payload
    const payload = new FormData();
    payload.append("title", formData.title.trim());
    payload.append("description", formData.description.trim());
    payload.append("priceAmount", formData.priceAmount);
    payload.append("priceAmout", formData.priceAmount); // Alias for safety
    payload.append("priceCurrency", formData.priceCurrency);

    // Append images
    images.forEach((img) => {
      if (img.file) {
        payload.append("images", img.file);
      }
    });

    const result = await handleCreateProduct(payload);

    if (result?.success) {
      setSuccessMessage("Product created and published to Snitch catalog!");
      setFormData({
        title: "",
        description: "",
        priceAmount: "",
        priceCurrency: "INR",
      });
      setImages([]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const activeCurrency =
    CURRENCIES.find((c) => c.code === formData.priceCurrency) || CURRENCIES[0];

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
              <span>Back to Catalog</span>
            </Link>

            <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <span className="text-sm font-bold tracking-[0.3em] text-white uppercase">
                SNITCH
              </span>
              {/* <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full bg-zinc-900 border border-amber-500/20 text-amber-300 font-mono text-[10px] tracking-wider uppercase">
                ATELIER // CMS
              </span> */}
            </div>
          </div>
          <div className="flex gap-10 items-center justify-end ">
            {/* Center: Live Status Indicator */}
            <div className="hidden max-w-fit lg:flex items-center gap-2 bg-[#121216] border border-zinc-800 px-3.5 py-1 rounded-full">
              <span
                className={`w-2 h-2 rounded-full ${
                  images.length > 0 && formData.title
                    ? "bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse"
                    : "bg-zinc-600"
                }`}
              />
              <span className="text-[11px] font-mono tracking-wider text-zinc-400">
                {images.length > 0 && formData.title
                  ? "Draft • Ready to publish"
                  : "Draft • In progress"}
              </span>
            </div>

            {/* Right: Quick CTA Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to discard your draft changes?",
                    )
                  ) {
                    setFormData({
                      title: "",
                      description: "",
                      priceAmount: "",
                      priceCurrency: "INR",
                    });
                    setImages([]);
                    setFormErrors({});
                  }
                }}
                className="hidden sm:inline-flex px-4 py-2 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 font-medium text-xs tracking-wide transition-all duration-200 cursor-pointer"
              >
                Reset Draft
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-zinc-950 font-semibold text-xs tracking-wide transition-all duration-200 shadow-[0_0_25px_rgba(245,158,11,0.25)] hover:shadow-[0_0_35px_rgba(245,158,11,0.4)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-zinc-950"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    <span>Publish Product</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT CANVAS */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* EDITORIAL PAGE HEADER */}
        <div className="mb-8 lg:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-[11px] uppercase tracking-[0.25em] text-amber-400 font-mono font-semibold">
                NEW APPAREL RELEASE
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              Create Product
            </h1>
            <p className="text-zinc-400 text-sm mt-1.5 leading-relaxed max-w-xl">
              Curate technical specifications, imagery, and pricing for the
              exclusive Snitch luxury streetwear collection.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
            <span className="px-2.5 py-1 rounded-md bg-[#121216] border border-zinc-800">
              Limit: 7 Stills
            </span>
            <span>&bull;</span>
            <span className="text-amber-400/90 font-medium">Aureate Noir</span>
          </div>
        </div>

        {/* NOTIFICATION BANNERS */}
        {successMessage && (
          <div className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-white">{successMessage}</p>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  The new garment has been recorded in the atelier catalog.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage("")}
              className="text-zinc-400 hover:text-white p-1"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {apiError && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-sm flex items-center gap-3">
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
              <p className="font-semibold text-rose-300">Submission Error</p>
              <p className="text-xs text-rose-400/90">{apiError}</p>
            </div>
          </div>
        )}

        {warningMessage && (
          <div className="mb-8 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2.5">
            <svg
              className="w-4 h-4 text-amber-400 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{warningMessage}</span>
          </div>
        )}

        {/* TWO-COLUMN GRID: 7 COLS (CONTENT & IMAGES) / 5 COLS (PRICING & STATUS) */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ================= LEFT / PRIMARY COLUMN (7 COLS) ================= */}
            <div className="lg:col-span-7 space-y-8">
              {/* SECTION 1: PRODUCT SPECIFICATIONS */}
              <section className="bg-[#121216] rounded-2xl border border-zinc-800 p-6 sm:p-8 relative shadow-[0_4px_30px_rgba(0,0,0,0.3)] hover:border-zinc-700/80 transition-all duration-300">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <h2 className="text-base sm:text-lg font-semibold text-white tracking-wide">
                      General Specifications
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                    Step 01 // Narrative
                  </span>
                </div>

                <div className="space-y-6">
                  {/* Title Field */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label
                        htmlFor="title"
                        className="block text-xs font-semibold uppercase tracking-wider text-zinc-300"
                      >
                        Product Title <span className="text-amber-400">*</span>
                      </label>
                      <span className="text-[11px] font-mono text-zinc-500">
                        {formData.title.length} / 90 chars
                      </span>
                    </div>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      maxLength={90}
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., Heavyweight Oversized Acid-Wash Hoodie"
                      className={`w-full bg-[#181820] text-white placeholder:text-zinc-600 px-4 py-3.5 rounded-xl border transition-all duration-200 outline-none text-sm ${
                        formErrors.title
                          ? "border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                          : "border-zinc-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/10"
                      }`}
                    />
                    {formErrors.title ? (
                      <p className="text-xs text-rose-400 mt-1.5 ml-0.5">
                        {formErrors.title}
                      </p>
                    ) : (
                      <p className="text-[11px] text-zinc-500 mt-1.5">
                        Specify distinct silhouette, wash treatment, and fabric
                        profile.
                      </p>
                    )}
                  </div>

                  {/* Description Field */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label
                        htmlFor="description"
                        className="block text-xs font-semibold uppercase tracking-wider text-zinc-300"
                      >
                        Technical Narrative & Details{" "}
                        <span className="text-amber-400">*</span>
                      </label>
                      <span className="text-[11px] font-mono text-zinc-500">
                        {formData.description.length} chars
                      </span>
                    </div>

                    <textarea
                      id="description"
                      name="description"
                      rows={5}
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe composition (e.g. 500 GSM French Terry), fit (boxy dropped shoulder), wash treatment, ribbed cuff trims, and atelier debossed hardware..."
                      className={`w-full bg-[#181820] text-white placeholder:text-zinc-600 p-4 rounded-xl border transition-all duration-200 outline-none text-sm leading-relaxed ${
                        formErrors.description
                          ? "border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                          : "border-zinc-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/10"
                      }`}
                    />
                    {formErrors.description && (
                      <p className="text-xs text-rose-400 mt-1.5 ml-0.5">
                        {formErrors.description}
                      </p>
                    )}

                    {/* Quick Preset Tags */}
                    <div className="mt-3 pt-3 border-t border-zinc-800/60">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mr-2">
                        Quick Add Attributes:
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {PRESET_TAGS.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleAddTag(tag)}
                            className="px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-400/40 text-[11px] text-zinc-400 hover:text-amber-300 transition-colors cursor-pointer"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 2: PRODUCT GALLERY (UP TO 7 IMAGES) */}
              <section className="bg-[#121216] rounded-2xl border border-zinc-800 p-6 sm:p-8 relative shadow-[0_4px_30px_rgba(0,0,0,0.3)] hover:border-zinc-700/80 transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-zinc-800/80">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <h2 className="text-base sm:text-lg font-semibold text-white tracking-wide">
                        Product Gallery
                      </h2>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                      Upload up to 7 editorial stills. Slot 1 serves as the
                      catalog cover photo.
                    </p>
                  </div>

                  {/* Slot Counter Badge */}
                  <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 font-mono text-xs">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        images.length > 0 ? "bg-amber-400" : "bg-zinc-600"
                      }`}
                    />
                    <span className="text-zinc-300">
                      <strong className="text-amber-400">
                        {images.length}
                      </strong>{" "}
                      of {MAX_IMAGES} Filled
                    </span>
                  </div>
                </div>

                {/* Error if no image uploaded */}
                {formErrors.images && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{formErrors.images}</span>
                  </div>
                )}

                {/* VISUAL 7-SLOT MEDIA GRID */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  {/* Render 7 Slots */}
                  {Array.from({ length: MAX_IMAGES }).map((_, index) => {
                    const img = images[index];
                    const isCover = index === 0;

                    if (img) {
                      // Uploaded Image Card
                      return (
                        <div
                          key={img.id}
                          className={`relative group aspect-[4/5] rounded-xl overflow-hidden bg-zinc-900 border transition-all duration-300 ${
                            isCover
                              ? "border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.15)] col-span-2 sm:col-span-1 row-span-1"
                              : "border-zinc-800 hover:border-zinc-700"
                          }`}
                        >
                          <img
                            src={img.previewUrl}
                            alt={img.name || `Product angle ${index + 1}`}
                            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                          />

                          {/* Slot / Cover Tag */}
                          <div className="absolute top-2 left-2 z-10">
                            {isCover ? (
                              <span className="px-2 py-0.5 rounded-full bg-black/80 border border-amber-400 text-amber-300 font-mono text-[9px] tracking-wider uppercase backdrop-blur-md flex items-center gap-1 shadow-md">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                Cover
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-black/70 border border-zinc-800 text-[10px] font-mono text-zinc-400 backdrop-blur-sm">
                                {index + 1}/{MAX_IMAGES}
                              </span>
                            )}
                          </div>

                          {/* Image Actions Overlay */}
                          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 p-2 backdrop-blur-xs">
                            {!isCover && (
                              <button
                                type="button"
                                onClick={() => handleMakeCover(index)}
                                className="px-2.5 py-1 rounded-lg bg-amber-400/90 hover:bg-amber-300 text-zinc-950 text-[11px] font-semibold tracking-wide transition-colors cursor-pointer shadow"
                                title="Set as primary cover"
                              >
                                Set as Cover
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRemoveImage(img.id)}
                              className="p-1.5 rounded-lg bg-zinc-900/90 hover:bg-rose-500 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                              title="Delete image"
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>

                            <span className="text-[10px] font-mono text-zinc-400 truncate max-w-full px-1">
                              {img.size} MB
                            </span>
                          </div>
                        </div>
                      );
                    }

                    // Empty Slot
                    return (
                      <div
                        key={`empty-slot-${index}`}
                        onClick={() => fileInputRef.current?.click()}
                        className={`group relative aspect-[4/5] rounded-xl border border-dashed transition-all duration-200 flex flex-col items-center justify-center p-3 text-center cursor-pointer ${
                          isCover && images.length === 0
                            ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-400 hover:bg-amber-500/10"
                            : "border-zinc-800 hover:border-amber-400/50 bg-[#16161c]/40 hover:bg-[#181820]"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 group-hover:border-amber-500/30 group-hover:bg-amber-500/10 text-zinc-400 group-hover:text-amber-400 flex items-center justify-center mb-1.5 transition-colors">
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
                        </div>
                        <span className="text-[11px] font-medium text-zinc-400 group-hover:text-white transition-colors">
                          {isCover ? "Cover Photo" : `Slot ${index + 1}`}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-600 group-hover:text-zinc-500 mt-0.5">
                          {index + 1} of {MAX_IMAGES}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* DRAG & DROP INTERACTIVE UPLOAD BANNER */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border border-dashed rounded-xl p-6 transition-all duration-200 flex flex-col sm:flex-row items-center justify-between gap-4 ${
                    dragOver
                      ? "border-amber-400 bg-amber-500/10 scale-[1.01]"
                      : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/30"
                  }`}
                >
                  <div className="flex items-center gap-4 text-center sm:text-left">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-400 flex items-center justify-center shrink-0 shadow">
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
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Drag and drop editorial product photos
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        High resolution JPG, PNG, or WebP (up to 10MB each)
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={images.length >= MAX_IMAGES}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 border border-zinc-700 text-white text-xs font-semibold tracking-wide transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {images.length >= MAX_IMAGES
                      ? "Max Limit Reached"
                      : "Browse Files"}
                  </button>

                  {/* Hidden multi-file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </section>
            </div>

            {/* ================= RIGHT / SECONDARY COLUMN (5 COLS) ================= */}
            <div className="lg:col-span-5 space-y-8">
              {/* SECTION 3: PRICING & VALUATION */}
              <section className="bg-[#121216] rounded-2xl border border-zinc-800 p-6 sm:p-8 relative shadow-[0_4px_30px_rgba(0,0,0,0.3)] hover:border-zinc-700/80 transition-all duration-300">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <h2 className="text-base sm:text-lg font-semibold text-white tracking-wide">
                      Pricing & Valuation
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400/90 font-medium">
                    Atelier Tier
                  </span>
                </div>

                <div className="space-y-5">
                  {/* Currency Selector */}
                  <div>
                    <label
                      htmlFor="priceCurrency"
                      className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2"
                    >
                      Price Currency <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="priceCurrency"
                        name="priceCurrency"
                        value={formData.priceCurrency}
                        onChange={handleChange}
                        className="w-full bg-[#181820] text-white py-3 pl-3.5 pr-10 rounded-xl border border-zinc-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/10 outline-none text-sm appearance-none cursor-pointer"
                      >
                        {CURRENCIES.map((curr) => (
                          <option
                            key={curr.code}
                            value={curr.code}
                            className="bg-[#121216] text-white"
                          >
                            {curr.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
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
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Price Amount */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label
                        htmlFor="priceAmount"
                        className="block text-xs font-semibold uppercase tracking-wider text-zinc-300"
                      >
                        Retail Price Amount{" "}
                        <span className="text-amber-400">*</span>
                      </label>
                      <span className="text-[11px] font-mono text-zinc-500">
                        Format: Numeric
                      </span>
                    </div>

                    <div className="relative flex items-center">
                      <div className="absolute left-4 font-mono font-bold text-base text-amber-400 pointer-events-none">
                        {activeCurrency.symbol}
                      </div>
                      <input
                        id="priceAmount"
                        name="priceAmount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.priceAmount}
                        onChange={handleChange}
                        placeholder="e.g., 4999.00"
                        className={`w-full bg-[#181820] text-white placeholder:text-zinc-600 pl-10 pr-4 py-3.5 rounded-xl border font-mono text-sm transition-all duration-200 outline-none ${
                          formErrors.priceAmount
                            ? "border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                            : "border-zinc-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/10"
                        }`}
                      />
                    </div>
                    {formErrors.priceAmount ? (
                      <p className="text-xs text-rose-400 mt-1.5 ml-0.5">
                        {formErrors.priceAmount}
                      </p>
                    ) : (
                      <p className="text-[11px] text-zinc-500 mt-1.5">
                        All local sales taxes and duties are computed at
                        checkout.
                      </p>
                    )}
                  </div>

                  {/* Pricing Overview Pill */}
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                        Listing Display
                      </span>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Catalog Price Tag
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold font-mono text-amber-300">
                        {activeCurrency.symbol}
                        {formData.priceAmount ? formData.priceAmount : "0.00"}
                      </span>
                      <p className="text-[10px] font-mono text-zinc-500 uppercase">
                        {formData.priceCurrency}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 4: PUBLISH READINESS & ACTION CARD */}
              <section className="bg-[#121216] rounded-2xl border border-zinc-800 p-6 sm:p-8 relative shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-zinc-800/80">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
                    Publish Checklist
                  </h2>
                  <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                    SNITCH RUNWAY
                  </span>
                </div>

                {/* Validation checklist status */}
                <div className="space-y-2.5 mb-6 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-zinc-800/40">
                    <span className="text-zinc-400">Product Title</span>
                    <span
                      className={`font-mono text-[11px] ${
                        formData.title.trim()
                          ? "text-amber-400 flex items-center gap-1"
                          : "text-zinc-600"
                      }`}
                    >
                      {formData.title.trim() ? "✓ Filled" : "Pending"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-zinc-800/40">
                    <span className="text-zinc-400">Garment Narrative</span>
                    <span
                      className={`font-mono text-[11px] ${
                        formData.description.trim()
                          ? "text-amber-400 flex items-center gap-1"
                          : "text-zinc-600"
                      }`}
                    >
                      {formData.description.trim() ? "✓ Detailed" : "Pending"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-zinc-800/40">
                    <span className="text-zinc-400">Retail Pricing</span>
                    <span
                      className={`font-mono text-[11px] ${
                        formData.priceAmount
                          ? "text-amber-400 flex items-center gap-1"
                          : "text-zinc-600"
                      }`}
                    >
                      {formData.priceAmount ? "✓ Set" : "Pending"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-zinc-400">Media Stills</span>
                    <span
                      className={`font-mono text-[11px] ${
                        images.length > 0
                          ? "text-amber-400 flex items-center gap-1"
                          : "text-zinc-600"
                      }`}
                    >
                      {images.length > 0
                        ? `✓ ${images.length}/7 Uploaded`
                        : "0/7 Required"}
                    </span>
                  </div>
                </div>

                {/* Primary Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-zinc-950 font-semibold text-sm tracking-wide transition-all duration-200 shadow-[0_0_30px_rgba(245,158,11,0.25)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-zinc-950"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Creating Product...</span>
                    </>
                  ) : (
                    <>
                      <span>Publish to Snitch Store</span>
                      <svg
                        className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
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
                    </>
                  )}
                </button>

                <p className="text-[11px] text-zinc-500 text-center mt-3">
                  Once published, this item will immediately sync with the
                  storefront inventory.
                </p>
              </section>
            </div>
          </div>
        </form>
      </main>

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

export default CreateProduct;
