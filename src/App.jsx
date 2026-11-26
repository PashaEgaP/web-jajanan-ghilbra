import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { calculateCartTotals, formatRupiah } from "./utils/cartCalculator";
import {
  buildGeneralWhatsAppUrl,
  buildProductWhatsAppUrl,
} from "./utils/whatsapp";

const CATEGORIES = [
  "Semua",
  "Seblak",
  "Sosis Bakar",
  "Kentang Goreng",
  "Otak-Otak Goreng",
  "Minuman",
];

const STORE_ADVANTAGES = [
  {
    num: "01",
    title: "Dimasak hangat saat pesanan masuk",
    detail:
      "Seblak, sosis bakar, sostel mini, kentang, dan otak-otak diproses setelah konfirmasi pesanan agar tekstur dan suhunya tetap terjaga.",
  },
  {
    num: "02",
    title: "Pilihan pedas dan cocolan sesuai selera",
    detail:
      "Atur level pedas kuah seblak atau pilih saus olesan sosis bakar langsung di catatan WhatsApp saat memesan.",
  },
  {
    num: "03",
    title: "Dari jajanan gurih sampai minuman dingin",
    detail:
      "Menu lengkap untuk camilan sore maupun teman makan siang tanpa harus memesan dari tempat yang berbeda.",
  },
  {
    num: "04",
    title: "Pesan langsung lewat WhatsApp tanpa aplikasi tambahan",
    detail:
      "Klik tombol pesan pada menu yang dipilih, format nama produk dan harga langsung terisi ke nomor WhatsApp Jajanan Ghilbra.",
  },
];

const INITIAL_REVIEWS = [
  {
    id: "review-1",
    buyer: "Nadia Putri",
    menuOrdered: "Seblak Original Rumahan",
    rating: 5,
    quote:
      "Kuahnya gurih berasa kencur dan pedasnya pas, dimakan hangat-hangat enak banget.",
  },
  {
    id: "review-2",
    buyer: "Rizky Pratama",
    menuOrdered: "Sosis Bakar Sedang & Es Teh Manis Rumahan",
    rating: 5,
    quote:
      "Sosis bakarnya matang merata dengan saus olesan yang mantap, pas buat camilan sore.",
  },
];

const REVIEWS_STORAGE_KEY = "jajanan_ghilbra_reviews_v1";
const OWNER_PIN = "1234"; // Ganti dengan PIN pribadi Anda

function loadInitialReviews() {
  try {
    const saved = window.localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!saved) return INITIAL_REVIEWS;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : INITIAL_REVIEWS;
  } catch {
    return INITIAL_REVIEWS;
  }
}

function getInitials(name) {
  const cleaned = String(name || "").trim();
  if (!cleaned) return "MB";
  const parts = cleaned.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function renderStars(rating) {
  const safeRating = Math.min(5, Math.max(1, Number(rating) || 5));
  return `${"★".repeat(safeRating)}${"☆".repeat(5 - safeRating)}`;
}

function useCart() {
  const [cart, setCart] = useState([]);

  const addItem = (menu, qtyToAdd = 1) => {
    const safeQty = Math.max(1, Number(qtyToAdd) || 1);
    setCart((prev) => {
      const found = prev.find((item) => item.id === menu.id);
      if (found) {
        return prev.map((item) =>
          item.id === menu.id ? { ...item, qty: item.qty + safeQty } : item,
        );
      }
      return [
        ...prev,
        {
          id: menu.id,
          name: menu.name,
          price: Number(menu.price) || 0,
          qty: safeQty,
        },
      ];
    });
  };

  const changeQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty + delta } : item,
        )
        .filter((item) => item.qty > 0),
    );
  };

  const clearCart = () => setCart([]);

  return { cart, addItem, changeQty, clearCart };
}

function ProductCard({
  product,
  quantities,
  onQuantityChange,
  onAddToCart,
  isFeatured,
}) {
  const qty = quantities[product.id] ?? 1;
  const cardClass = isFeatured ? "featured-card" : "product-card";
  const mediaClass = isFeatured ? "featured-card-media" : "product-media";
  const bodyClass = isFeatured ? "featured-card-body" : "product-body";
  const waUrl =
    typeof buildProductWhatsAppUrl === "function"
      ? buildProductWhatsAppUrl(product, qty)
      : buildGeneralWhatsAppUrl(
          `Halo Jajanan Ghilbra, saya ingin pesan ${product.name} (${qty}x).`,
        );

  const cardStyle = isFeatured
    ? undefined
    : {
        display: "flex",
        flexDirection: "column",
        height: "100%",
      };

  const bodyStyle = isFeatured
    ? undefined
    : {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        flex: 1,
        gap: "1rem",
      };

  return (
    <article className={cardClass} style={cardStyle}>
      <div className={mediaClass}>
        <img
          src={product.image}
          alt={product.imageAlt}
          width="480"
          height="360"
          loading="lazy"
        />
      </div>

      <div className={bodyClass} style={bodyStyle}>
        <div>
          <p className="product-category">{product.category}</p>
          <h3 className="product-name">{product.name}</h3>
          <p className="product-desc">{product.description}</p>
        </div>

        <div style={isFeatured ? undefined : { marginTop: "auto" }}>
          <div className="product-price-block">
            <span className="product-price">{formatRupiah(product.price)}</span>
            <span className="price-placeholder-tag">{product.priceNote}</span>
          </div>

          <div
            className="order-controls"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              gap: "0.5rem",
            }}
          >
            <div
              className="qty-stepper"
              aria-label={`Jumlah ${product.name}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <button
                type="button"
                className="qty-btn"
                onClick={() => onQuantityChange(product.id, -1)}
                aria-label={`Kurangi jumlah ${product.name}`}
                style={{
                  height: "2.15rem",
                  flex: "0 0 2.25rem",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                −
              </button>
              <span
                className="qty-value"
                style={{
                  height: "2.15rem",
                  flex: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {qty}
              </span>
              <button
                type="button"
                className="qty-btn"
                onClick={() => onQuantityChange(product.id, 1)}
                aria-label={`Tambah jumlah ${product.name}`}
                style={{
                  height: "2.15rem",
                  flex: "0 0 2.25rem",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                +
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.5rem",
                width: "100%",
              }}
            >
              <button
                type="button"
                className="btn-secondary"
                onClick={() => onAddToCart(product, qty)}
                style={{
                  height: "2.25rem",
                  padding: "0 0.65rem",
                  fontSize: "0.85rem",
                  lineHeight: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  whiteSpace: "nowrap",
                  width: "100%",
                }}
              >
                + Keranjang
              </button>

              <a
                className="btn-primary"
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  height: "2.25rem",
                  padding: "0 0.65rem",
                  fontSize: "0.85rem",
                  lineHeight: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  whiteSpace: "nowrap",
                  width: "100%",
                }}
              >
                Pesan WA
              </a>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function CartItemList({ cart, onChangeQty, onBackToMenu }) {
  if (cart.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "2.5rem 1rem",
        }}
      >
        <p
          style={{
            margin: "0 0 0.5rem",
            fontSize: "1.05rem",
            fontWeight: 600,
            color: "#1c1917",
          }}
        >
          Keranjang belanja masih kosong
        </p>
        <p
          style={{
            margin: "0 0 1.25rem",
            fontSize: "0.95rem",
            color: "#57534e",
          }}
        >
          Pilih menu favorit Anda terlebih dahulu dengan menekan tombol{" "}
          <strong>+ Keranjang</strong> pada katalog menu.
        </p>
        {onBackToMenu && (
          <button type="button" className="btn-primary" onClick={onBackToMenu}>
            Lihat Katalog Menu
          </button>
        )}
      </div>
    );
  }

  return (
    <ul
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
      }}
    >
      {cart.map((item, index) => {
        const subtotal = (Number(item.price) || 0) * (Number(item.qty) || 0);
        const isLast = index === cart.length - 1;
        return (
          <li
            key={item.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              padding: "0.95rem 0",
              borderBottom: isLast
                ? "none"
                : "1px solid rgba(120, 53, 15, 0.12)",
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <p
                style={{
                  margin: "0 0 0.25rem",
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "#1c1917",
                }}
              >
                {item.name}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.9rem",
                  color: "#57534e",
                }}
              >
                {formatRupiah(item.price)} × {item.qty} ={" "}
                <strong style={{ color: "#9a3412" }}>
                  {formatRupiah(subtotal)}
                </strong>
              </p>
            </div>

            <div
              className="qty-stepper"
              aria-label={`Atur jumlah ${item.name}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                className="qty-btn"
                onClick={() => onChangeQty(item.id, -1)}
                aria-label={`Kurangi pesanan ${item.name}`}
                style={{
                  height: "2.1rem",
                  width: "2.1rem",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                −
              </button>
              <span
                className="qty-value"
                style={{
                  height: "2.1rem",
                  minWidth: "2rem",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                }}
              >
                {item.qty}
              </span>
              <button
                type="button"
                className="qty-btn"
                onClick={() => onChangeQty(item.id, 1)}
                aria-label={`Tambah pesanan ${item.name}`}
                style={{
                  height: "2.1rem",
                  width: "2.1rem",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                +
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function TotalSummary({ cart, onCheckout }) {
  const { totalItems, totalPrice } = calculateCartTotals(cart);

  if (cart.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: "#fffdfb",
        border: "1px solid rgba(120, 53, 15, 0.16)",
        borderRadius: "16px",
        padding: "1.35rem 1.5rem",
        boxShadow: "0 8px 24px rgba(28, 25, 23, 0.05)",
      }}
    >
      <h3
        style={{
          margin: "0 0 1rem",
          paddingBottom: "0.75rem",
          borderBottom: "1px solid rgba(120, 53, 15, 0.12)",
          fontSize: "1.1rem",
          fontWeight: 700,
          color: "#1c1917",
        }}
      >
        Ringkasan Pembayaran
      </h3>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          marginBottom: "0.65rem",
          fontSize: "0.95rem",
          color: "#57534e",
        }}
      >
        <span>Total Item</span>
        <strong style={{ color: "#1c1917" }}>{totalItems} porsi</strong>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          paddingTop: "0.75rem",
          marginTop: "0.75rem",
          borderTop: "1px dashed rgba(120, 53, 15, 0.22)",
          fontSize: "1.05rem",
          fontWeight: 700,
          color: "#1c1917",
        }}
      >
        <span>Total Pembayaran</span>
        <strong style={{ fontSize: "1.25rem", color: "#9a3412" }}>
          {formatRupiah(totalPrice)}
        </strong>
      </div>

      <button
        type="button"
        onClick={() => onCheckout({ cart, totalItems, totalPrice })}
        className="btn-primary"
        style={{
          width: "100%",
          marginTop: "1.15rem",
          justifyContent: "center",
          padding: "0.8rem 1rem",
          fontSize: "0.95rem",
        }}
      >
        Pesan Semua via WA ({formatRupiah(totalPrice)})
      </button>

      <p
        style={{
          margin: "0.75rem 0 0",
          fontSize: "0.82rem",
          lineHeight: 1.45,
          color: "#78716c",
          textAlign: "center",
        }}
      >
        Daftar pesanan dan total harga akan otomatis terisi ke pesan WhatsApp
        Jajanan Ghilbra.
      </p>
    </div>
  );
}

function CartPage({
  cart,
  onChangeQty,
  onClearCart,
  onCheckout,
  onBackToMenu,
}) {
  return (
    <section
      id="halaman-keranjang"
      className="catalog-section"
      aria-labelledby="keranjang-page-heading"
    >
      <div className="container">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <p className="hero-kicker" style={{ marginBottom: "0.25rem" }}>
              Ringkasan Pesanan
            </p>
            <h1
              id="keranjang-page-heading"
              className="section-title"
              style={{ marginBottom: 0 }}
            >
              Keranjang Belanja Anda
            </h1>
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={onBackToMenu}
          >
            ← Kembali ke Menu
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              cart.length > 0
                ? "repeat(auto-fit, minmax(min(100%, 320px), 1fr))"
                : "1fr",
            gap: "1.5rem",
            alignItems: "start",
          }}
        >
          <div
            style={{
              backgroundColor: "#fffdfb",
              border: "1px solid rgba(120, 53, 15, 0.16)",
              borderRadius: "16px",
              padding: "1.35rem 1.5rem",
              boxShadow: "0 8px 24px rgba(28, 25, 23, 0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.75rem",
                paddingBottom: "0.75rem",
                marginBottom: "0.25rem",
                borderBottom: "1px solid rgba(120, 53, 15, 0.12)",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "#1c1917",
                }}
              >
                Daftar Item Dipilih ({cart.length} menu)
              </h2>

              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={onClearCart}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: "0.25rem 0.5rem",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#b91c1c",
                    cursor: "pointer",
                  }}
                >
                  Kosongkan
                </button>
              )}
            </div>

            <CartItemList
              cart={cart}
              onChangeQty={onChangeQty}
              onBackToMenu={onBackToMenu}
            />
          </div>

          {cart.length > 0 && (
            <div style={{ position: "sticky", top: "5.5rem" }}>
              <TotalSummary cart={cart} onCheckout={onCheckout} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function CustomerReviewSection({
  reviews,
  menuItems,
  onAddReview,
  onDeleteReview,
}) {
  const [buyerName, setBuyerName] = useState("");
  const [menuOrdered, setMenuOrdered] = useState("");
  const [rating, setRating] = useState(5);
  const [quote, setQuote] = useState("");
  const [formError, setFormError] = useState("");
  const [submittedNotice, setSubmittedNotice] = useState("");

  // Akses pribadi pemilik warung untuk moderasi/hapus ulasan
  const [isOwnerUnlocked, setIsOwnerUnlocked] = useState(false);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const trimmedName = buyerName.trim();
    const trimmedMenu = menuOrdered.trim();
    const trimmedQuote = quote.trim();

    if (!trimmedName || !trimmedMenu || !trimmedQuote) {
      setFormError(
        "Mohon lengkapi nama customer, menu yang dibeli, dan isi ulasan.",
      );
      setSubmittedNotice("");
      return;
    }

    onAddReview({
      id: `review-${Date.now()}`,
      buyer: trimmedName,
      menuOrdered: trimmedMenu,
      rating: Number(rating) || 5,
      quote: trimmedQuote,
    });

    setBuyerName("");
    setMenuOrdered("");
    setRating(5);
    setQuote("");
    setFormError("");
    setSubmittedNotice("Ulasan Anda berhasil ditambahkan.");
  }

  function handleOwnerButtonClick() {
    if (isOwnerUnlocked) {
      setIsOwnerUnlocked(false);
      setShowPinPrompt(false);
      setPinInput("");
      setPinError("");
      return;
    }
    setShowPinPrompt((prev) => !prev);
    setPinError("");
  }

  function handlePinSubmit(event) {
    event.preventDefault();
    if (pinInput === OWNER_PIN) {
      setIsOwnerUnlocked(true);
      setShowPinPrompt(false);
      setPinInput("");
      setPinError("");
    } else {
      setPinError("Kode akses pribadi tidak sesuai.");
    }
  }

  function handleDeleteClick(review) {
    const confirmed = window.confirm(
      `Hapus ulasan dari "${review.buyer}" (${review.menuOrdered})?`,
    );
    if (confirmed) {
      onDeleteReview(review.id);
    }
  }

  return (
    <section
      id="testimoni"
      className="testimonials-section"
      aria-labelledby="testimoni-heading"
    >
      <div className="container">
        <div className="testimonials-header">
          <div className="section-header-left" style={{ marginBottom: 0 }}>
            <h2 id="testimoni-heading" className="section-title">
              Testimoni Pembeli
            </h2>
            <p className="section-subtitle">
              Bagikan pengalaman Anda setelah membeli menu di Jajanan Ghilbra
              beserta rating dan menu yang dipesan.
            </p>
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={handleOwnerButtonClick}
          >
            {isOwnerUnlocked ? "Keluar Mode Pemilik" : "Kelola Ulasan"}
          </button>
        </div>

        {showPinPrompt && !isOwnerUnlocked && (
          <form
            onSubmit={handlePinSubmit}
            aria-label="Verifikasi akses pemilik ulasan"
            style={{
              backgroundColor: "#fffdfb",
              border: "1px solid rgba(120, 53, 15, 0.2)",
              borderRadius: "14px",
              padding: "1rem 1.25rem",
              marginBottom: "1.5rem",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <label
              htmlFor="owner-pin-input"
              style={{
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#1c1917",
              }}
            >
              Kode Akses Pemilik:
            </label>
            <input
              id="owner-pin-input"
              type="password"
              className="search-input"
              style={{ maxWidth: "180px" }}
              placeholder="Masukkan PIN"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
            />
            <button type="submit" className="btn-primary">
              Masuk
            </button>
            {pinError && (
              <span
                role="alert"
                style={{
                  fontSize: "0.86rem",
                  fontWeight: 600,
                  color: "#b91c1c",
                }}
              >
                {pinError}
              </span>
            )}
          </form>
        )}

        {isOwnerUnlocked && (
          <div
            role="status"
            style={{
              backgroundColor: "#fef3c7",
              border: "1px solid rgba(180, 83, 9, 0.25)",
              borderRadius: "12px",
              padding: "0.75rem 1rem",
              marginBottom: "1.5rem",
              fontSize: "0.88rem",
              fontWeight: 600,
              color: "#78350f",
            }}
          >
            Mode Pemilik aktif: Anda dapat menghapus ulasan yang kurang sesuai
            melalui tombol Hapus di tiap kartu.
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          aria-label="Form ulasan pelanggan"
          style={{
            backgroundColor: "#fffdfb",
            border: "1px solid rgba(120, 53, 15, 0.16)",
            borderRadius: "16px",
            padding: "1.35rem 1.5rem",
            marginBottom: "1.75rem",
            boxShadow: "0 8px 24px rgba(28, 25, 23, 0.05)",
          }}
        >
          <h3
            style={{
              margin: "0 0 1rem",
              fontSize: "1.05rem",
              fontWeight: 700,
              color: "#1c1917",
            }}
          >
            Tulis Ulasan Anda
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "0.9rem",
              marginBottom: "0.9rem",
            }}
          >
            <div>
              <label
                htmlFor="reviewer-name"
                style={{
                  display: "block",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  marginBottom: "0.35rem",
                  color: "#1c1917",
                }}
              >
                Nama Customer
              </label>
              <input
                id="reviewer-name"
                type="text"
                className="search-input"
                style={{ width: "100%" }}
                placeholder="Contoh: Ghilbra"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="reviewer-menu"
                style={{
                  display: "block",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  marginBottom: "0.35rem",
                  color: "#1c1917",
                }}
              >
                Menu yang Dibeli
              </label>
              <input
                id="reviewer-menu"
                list="menu-options-list"
                type="text"
                className="search-input"
                style={{ width: "100%" }}
                placeholder="Pilih atau ketik menu yang dibeli"
                value={menuOrdered}
                onChange={(e) => setMenuOrdered(e.target.value)}
              />
              <datalist id="menu-options-list">
                {menuItems.map((m) => (
                  <option key={m.id} value={m.name} />
                ))}
              </datalist>
            </div>

            <div>
              <label
                htmlFor="reviewer-rating"
                style={{
                  display: "block",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  marginBottom: "0.35rem",
                  color: "#1c1917",
                }}
              >
                Rating (1 - 5)
              </label>
              <select
                id="reviewer-rating"
                className="search-input"
                style={{ width: "100%" }}
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              >
                <option value={5}>★★★★★ (5 / 5 - Sangat Puas)</option>
                <option value={4}>★★★★☆ (4 / 5 - Puas)</option>
                <option value={3}>★★★☆☆ (3 / 5 - Cukup)</option>
                <option value={2}>★★☆☆☆ (2 / 5 - Kurang)</option>
                <option value={1}>★☆☆☆☆ (1 / 5 - Kecewa)</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: "0.9rem" }}>
            <label
              htmlFor="reviewer-quote"
              style={{
                display: "block",
                fontSize: "0.88rem",
                fontWeight: 600,
                marginBottom: "0.35rem",
                color: "#1c1917",
              }}
            >
              Isi Ulasan
            </label>
            <textarea
              id="reviewer-quote"
              rows={3}
              className="search-input"
              style={{
                width: "100%",
                resize: "vertical",
                paddingTop: "0.6rem",
              }}
              placeholder="Ceritakan rasa, porsi, atau pelayanan Jajanan Ghilbra..."
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
            />
          </div>

          {formError && (
            <p
              role="alert"
              style={{
                margin: "0 0 0.75rem",
                fontSize: "0.88rem",
                fontWeight: 600,
                color: "#b91c1c",
              }}
            >
              {formError}
            </p>
          )}

          {submittedNotice && (
            <p
              role="status"
              style={{
                margin: "0 0 0.75rem",
                fontSize: "0.88rem",
                fontWeight: 600,
                color: "#15803d",
              }}
            >
              {submittedNotice}
            </p>
          )}

          <button type="submit" className="btn-primary">
            Kirim Ulasan
          </button>
        </form>

        {reviews.length === 0 ? (
          <div className="state-panel" role="status">
            <p style={{ margin: 0 }}>Belum ada ulasan yang ditampilkan.</p>
          </div>
        ) : (
          <div className="testimonials-grid">
            {reviews.map((item) => (
              <article key={item.id} className="testimonial-slot">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.5rem",
                    marginBottom: "0.4rem",
                  }}
                >
                  <span
                    aria-label={`Rating ${item.rating} dari 5 bintang`}
                    style={{
                      color: "#d97706",
                      fontSize: "1rem",
                      letterSpacing: "0.06em",
                      fontWeight: 700,
                    }}
                  >
                    {renderStars(item.rating)} ({item.rating}/5)
                  </span>

                  {isOwnerUnlocked && (
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(item)}
                      aria-label={`Hapus ulasan dari ${item.buyer}`}
                      style={{
                        backgroundColor: "#fee2e2",
                        color: "#b91c1c",
                        border: "1px solid rgba(185, 28, 28, 0.25)",
                        borderRadius: "8px",
                        padding: "0.28rem 0.6rem",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Hapus
                    </button>
                  )}
                </div>

                <p className="testimonial-quote">&quot;{item.quote}&quot;</p>

                <div className="testimonial-author">
                  <div className="avatar-placeholder" aria-hidden="true">
                    {getInitials(item.buyer)}
                  </div>
                  <div>
                    <p className="author-name">{item.buyer}</p>
                    <p className="author-item">
                      Menu dibeli: {item.menuOrdered}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [reviews, setReviews] = useState(loadInitialReviews);
  const { cart, addItem, changeQty, clearCart } = useCart();
  const [activePage, setActivePage] = useState("home");
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadTick, setReloadTick] = useState(0);

  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [quantities, setQuantities] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuToggleRef = useRef(null);
  const { totalItems: cartCount } = calculateCartTotals(cart);

  useEffect(() => {
    try {
      window.localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
    } catch {
      // Abaikan jika penyimpanan browser penuh atau diblokir
    }
  }, [reviews]);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/menu.json", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Status ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error("Format data menu tidak valid");
        }
        setMenuItems(data);
        setStatus("ready");
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setErrorMessage("Daftar menu belum dapat dimuat saat ini.");
        setStatus("error");
      });

    return () => controller.abort();
  }, [reloadTick]);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    function onKeyDown(event) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        menuToggleRef.current?.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return menuItems.filter((item) => {
      const matchesCategory =
        activeCategory === "Semua" || item.category === activeCategory;
      const matchesQuery =
        query === "" ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [menuItems, activeCategory, searchQuery]);

  const gridItems = filteredItems;

  function handleAddReview(newReview) {
    setReviews((prev) => [newReview, ...prev]);
  }

  function handleDeleteReview(id) {
    setReviews((prev) => prev.filter((item) => item.id !== id));
  }

  function navigateToSection(hash) {
    setMobileMenuOpen(false);
    setActivePage("home");
    setTimeout(() => {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }, 0);
  }

  function openCartPage() {
    setMobileMenuOpen(false);
    setActivePage("cart");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleQuantityChange(id, delta) {
    setQuantities((prev) => {
      const current = prev[id] ?? 1;
      const next = Math.min(20, Math.max(1, current + delta));
      return { ...prev, [id]: next };
    });
  }

  function handleResetFilters() {
    setActiveCategory("Semua");
    setSearchQuery("");
  }

  function handleReloadMenu() {
    setStatus("loading");
    setErrorMessage("");
    setReloadTick((tick) => tick + 1);
  }

  function handleCheckout({ cart: items, totalItems, totalPrice }) {
    const lines = items.map(
      (item, index) =>
        `${index + 1}. ${item.name} (${item.qty}x) - ${formatRupiah(
          Number(item.price) * Number(item.qty),
        )}`,
    );
    const message = [
      "Halo Jajanan Ghilbra, saya ingin memesan:",
      ...lines,
      `Total Item: ${totalItems} porsi`,
      `Total Pembayaran: ${formatRupiah(totalPrice)}`,
    ].join("\n");

    const waUrl = buildGeneralWhatsAppUrl(message);
    window.open(waUrl, "_blank", "noopener,noreferrer");
  }

  const generalWaUrl = buildGeneralWhatsAppUrl(
    "Halo Jajanan Ghilbra, saya ingin tanya stok menu dan cara pemesanannya.",
  );

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <a
            href="#main-content"
            className="brand-mark"
            onClick={(e) => {
              e.preventDefault();
              navigateToSection("#main-content");
            }}
          >
            Jajanan Ghilbra
          </a>

          <nav className="desktop-nav" aria-label="Navigasi utama">
            <a
              className="nav-link"
              href="#menu"
              onClick={(e) => {
                e.preventDefault();
                navigateToSection("#menu");
              }}
            >
              Menu
            </a>
            <a
              className="nav-link"
              href="#keunggulan"
              onClick={(e) => {
                e.preventDefault();
                navigateToSection("#keunggulan");
              }}
            >
              Keunggulan
            </a>
            <a
              className="nav-link"
              href="#testimoni"
              onClick={(e) => {
                e.preventDefault();
                navigateToSection("#testimoni");
              }}
            >
              Testimoni
            </a>
            <a
              className="nav-link"
              href="#kontak"
              onClick={(e) => {
                e.preventDefault();
                navigateToSection("#kontak");
              }}
            >
              Kontak
            </a>
            <button
              type="button"
              className="nav-link"
              onClick={openCartPage}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontWeight: activePage === "cart" ? 700 : undefined,
              }}
            >
              Keranjang{cartCount > 0 ? ` (${cartCount})` : ""}
            </button>
          </nav>

          <button
            ref={menuToggleRef}
            type="button"
            className="menu-toggle-btn"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? "Tutup Menu" : "Menu"}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav
            id="mobile-navigation"
            className="mobile-drawer"
            aria-label="Navigasi seluler"
          >
            <div className="container">
              <ul className="mobile-nav-list">
                <li>
                  <a
                    className="mobile-nav-link"
                    href="#menu"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToSection("#menu");
                    }}
                  >
                    Daftar Menu
                  </a>
                </li>
                <li>
                  <a
                    className="mobile-nav-link"
                    href="#keunggulan"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToSection("#keunggulan");
                    }}
                  >
                    Keunggulan Toko
                  </a>
                </li>
                <li>
                  <a
                    className="mobile-nav-link"
                    href="#testimoni"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToSection("#testimoni");
                    }}
                  >
                    Testimoni Pembeli
                  </a>
                </li>
                <li>
                  <a
                    className="mobile-nav-link"
                    href="#kontak"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToSection("#kontak");
                    }}
                  >
                    Kontak &amp; Jam Buka
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    className="mobile-nav-link"
                    onClick={openCartPage}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1.05rem",
                      fontWeight: activePage === "cart" ? 700 : 500,
                      lineHeight: 1.5,
                      color: "inherit",
                    }}
                  >
                    Keranjang{cartCount > 0 ? ` (${cartCount})` : ""}
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        )}
      </header>

      <main id="main-content" tabIndex={-1}>
        {activePage === "cart" ? (
          <CartPage
            cart={cart}
            onChangeQty={changeQty}
            onClearCart={clearCart}
            onCheckout={handleCheckout}
            onBackToMenu={() => navigateToSection("#menu")}
          />
        ) : (
          <>
            <section className="hero-section">
              <div className="container hero-grid">
                <div className="hero-copy">
                  <p className="hero-kicker">Dapur Rumahan Jajanan Ghilbra</p>
                  <h1 className="hero-title">
                    Selamat Datang di Website Warung Jajanan Ghilbra😊
                  </h1>
                  <p className="hero-lead">
                    Silahkan di order seblak, sostel mini, sosis bakar, kentang
                    goreng, otak-otak goreng, dan minuman segar. Klik pesan pada
                    menu pilihan Anda untuk langsung terhubung ke WhatsApp kami.
                  </p>
                  <div className="hero-actions">
                    <a className="btn-primary" href="#menu">
                      Lihat Menu dan Harga
                    </a>
                    <a
                      className="btn-secondary"
                      href={generalWaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Tanya Stok via WhatsApp
                    </a>
                  </div>
                  <p className="hero-note">
                    Catatan: Jika ingin mengatur level pedas kuah seblak atau
                    saus olesan sate-satean, tulis di catatan WhatsApp saat
                    memesan.
                  </p>
                </div>

                <div className="hero-media">
                  <div
                    style={{
                      position: "relative",
                      borderRadius: "18px",
                      overflow: "hidden",
                      boxShadow: "0 14px 32px rgba(28, 25, 23, 0.12)",
                      border: "1px solid rgba(120, 53, 15, 0.14)",
                      backgroundColor: "#fffdfb",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: "0.85rem",
                        left: "0.85rem",
                        zIndex: 2,
                        backgroundColor: "rgba(28, 25, 23, 0.78)",
                        color: "#fffbeb",
                        padding: "0.35rem 0.75rem",
                        borderRadius: "999px",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        letterSpacing: "0.02em",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      Favorit Warung • Siap Pesan
                    </span>
                    <img
                      src="/images/menu-utama-2.jpg"
                      alt="Hidangan utama Seblak, Sosis Bakar, Kentang Goreng, Otak-Otak, dan Sotel Jajanan Ghilbra"
                      width="640"
                      height="480"
                      fetchPriority="high"
                      style={{
                        display: "block",
                        width: "100%",
                        aspectRatio: "4 / 3",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section
              id="menu"
              className="catalog-section"
              aria-labelledby="menu-heading"
            >
              <div className="container">
                <div className="section-header-left">
                  <h2 id="menu-heading" className="section-title">
                    Katalog Menu Jajanan Ghilbra
                  </h2>
                  <p className="section-subtitle">
                    Saring menu berdasarkan kategori, atur jumlah porsi, lalu
                    kirim pesanan ke WhatsApp dengan nama produk dan harga yang
                    terisi otomatis.
                  </p>
                </div>

                <div className="catalog-toolbar">
                  <div
                    className="category-list"
                    role="group"
                    aria-label="Filter kategori menu"
                  >
                    {CATEGORIES.map((category) => {
                      const isActive = activeCategory === category;
                      return (
                        <button
                          key={category}
                          type="button"
                          className={`filter-btn ${isActive ? "is-active" : ""}`}
                          aria-pressed={isActive}
                          onClick={() => setActiveCategory(category)}
                        >
                          {category}
                        </button>
                      );
                    })}
                  </div>

                  <div className="search-field">
                    <label htmlFor="menu-search" className="search-label">
                      Cari nama menu
                    </label>
                    <div className="search-input-row">
                      <input
                        id="menu-search"
                        type="search"
                        className="search-input"
                        placeholder="Contoh: seblak, sosis, es teh"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                      />
                      {searchQuery !== "" && (
                        <button
                          type="button"
                          className="search-clear-btn"
                          onClick={() => setSearchQuery("")}
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {status === "loading" && (
                  <div aria-busy="true" aria-live="polite">
                    <p className="catalog-status-note">
                      Memuat daftar menu Jajanan Ghilbra...
                    </p>
                    <div className="skeleton-grid" aria-hidden="true">
                      <div className="skeleton-card">
                        <div className="skeleton-block skeleton-thumb" />
                        <div className="skeleton-block skeleton-line-lg" />
                        <div className="skeleton-block skeleton-line-sm" />
                      </div>
                      <div className="skeleton-card">
                        <div className="skeleton-block skeleton-thumb" />
                        <div className="skeleton-block skeleton-line-lg" />
                        <div className="skeleton-block skeleton-line-sm" />
                      </div>
                      <div className="skeleton-card">
                        <div className="skeleton-block skeleton-thumb" />
                        <div className="skeleton-block skeleton-line-lg" />
                        <div className="skeleton-block skeleton-line-sm" />
                      </div>
                    </div>
                  </div>
                )}

                {status === "error" && (
                  <div className="state-panel state-panel-error" role="alert">
                    <h3>Gagal memuat katalog menu</h3>
                    <p>{errorMessage}</p>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleReloadMenu}
                    >
                      Muat ulang menu
                    </button>
                  </div>
                )}

                {status === "ready" && filteredItems.length === 0 && (
                  <div className="state-panel" role="status" aria-live="polite">
                    <h3>Menu tidak ditemukan</h3>
                    <p>
                      Tidak ada menu pada kategori &quot;{activeCategory}&quot;
                      yang cocok dengan pencarian &quot;{searchQuery}&quot;.
                    </p>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleResetFilters}
                    >
                      Tampilkan semua menu
                    </button>
                  </div>
                )}

                {status === "ready" && filteredItems.length > 0 && (
                  <>
                    <p className="catalog-status-note" aria-live="polite">
                      Menampilkan {filteredItems.length} menu ({activeCategory}
                      ).
                    </p>

                    {gridItems.length > 0 && (
                      <div
                        className="product-grid"
                        style={{ alignItems: "stretch" }}
                      >
                        {gridItems.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            quantities={quantities}
                            onQuantityChange={handleQuantityChange}
                            onAddToCart={addItem}
                            isFeatured={false}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>

            <section
              id="keunggulan"
              className="advantages-section"
              aria-labelledby="keunggulan-heading"
            >
              <div className="container advantages-layout">
                <div className="advantages-intro">
                  <p className="advantages-kicker">Cara Kerja Dapur Kami</p>
                  <h2 id="keunggulan-heading" className="advantages-title">
                    Keunggulan Jajanan Ghilbra untuk camilan harian Anda
                  </h2>
                  <p className="advantages-copy">
                    Kami menyiapkan setiap porsi dengan rasa rumahan yang
                    konsisten dan proses pesan yang ringkas langsung ke pemilik
                    dapur.
                  </p>

                  <dl className="store-meta-list">
                    <div className="store-meta-item">
                      <dt>Jam operasional</dt>
                      <dd>[JAM BUKA: 08.00 - 20.00 WIB]</dd>
                    </div>
                    <div className="store-meta-item">
                      <dt>Area pengantaran &amp; ambil sendiri</dt>
                      <dd>
                        [Komplek Mutiara Garuda Blok C5 No.24 / Delivery :
                        Teluknaga sekitarnya]
                      </dd>
                    </div>
                    <div className="store-meta-item">
                      <dt>Nomor WhatsApp pesanan</dt>
                      <dd>0858-7145-1703 (aktif untuk pemesanan langsung)</dd>
                    </div>
                  </dl>
                </div>

                <ol className="advantages-list">
                  {STORE_ADVANTAGES.map((item) => (
                    <li key={item.num} className="advantage-row">
                      <span className="advantage-num" aria-hidden="true">
                        {item.num}
                      </span>
                      <div className="advantage-content">
                        <h3>{item.title}</h3>
                        <p>{item.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </section>

            <CustomerReviewSection
              reviews={reviews}
              menuItems={menuItems}
              onAddReview={handleAddReview}
              onDeleteReview={handleDeleteReview}
            />
          </>
        )}
      </main>

      <footer id="kontak" className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand-col">
              <h2 className="footer-title">Jajanan Ghilbra</h2>
              <p className="footer-muted">
                Seblak, Sosis Bakar, Sotel Mini, Kentang Goreng, Otak-Otak
                Goreng, dan Minuman Dingin.
              </p>
              <p className="footer-muted">
                ALAMAT TOKO: Komplek Mutiara Garuda Blok C5 No.24
              </p>
              <p className="footer-muted">(JAM BUKA: 08.00 - 20.00 WIB)</p>
            </div>

            <div className="footer-links-col">
              <h3 className="footer-links-heading">Navigasi &amp; Pemesanan</h3>
              <nav className="footer-nav" aria-label="Navigasi footer">
                <a
                  href="#menu"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToSection("#menu");
                  }}
                >
                  Katalog Menu
                </a>
                <a
                  href="#keunggulan"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToSection("#keunggulan");
                  }}
                >
                  Keunggulan
                </a>
                <a
                  href="#testimoni"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToSection("#testimoni");
                  }}
                >
                  Testimoni
                </a>
                <a
                  href={generalWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Chat WhatsApp (0858-7145-1703)
                </a>
              </nav>
            </div>
          </div>

          <div className="footer-bottom">
            <p>Jajanan Ghilbra. Halaman pemesanan langsung via WhatsApp.</p>
            <p>Terima kasih sudah memilih Jajanan Ghilbra!😊</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
