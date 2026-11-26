# Design Direction: Ghilbra Snacks

Dial: ENERGY 2 / RHYTHM 3 / MOTION 1

## Design Read

Reading this as: storefront landing page and WhatsApp order menu for Ghilbra Snacks, targeting neighborhood snack buyers on mobile and desktop, in a warm homemade street-kitchen editorial style, dial ENERGY 2 / RHYTHM 3 / MOTION 1.

## Identity & Voice

- **Brand**: Ghilbra Snacks
- **Products**: Seblak, Sosis Bakar, Kentang Goreng, Otak-Otak Goreng, Minuman Dingin
- **Ordering Channel**: Direct WhatsApp order to `6285871451703` with product name and Rupiah price pre-filled
- **Voice**: Warm, direct, homemade Indonesian kitchen tone without marketing hype, fabricated claims, or decorative emoji.
- **Identity Motif**: Crisp 1px charcoal hairlines paired with warm rounded-corner frames (`8px` cards, `6px` buttons) and terracotta focus/action accents, reminiscent of a printed neighborhood menu board.

## Palette (R-25, R-29)

Core palette kept to 2 warm paper bases, 1 charcoal ink, and 1 deliberate accent:

- `--bg-bone`: `#FAF6F0` (Putih tulang hangat, primary page canvas)
- `--bg-cream`: `#F2E9DC` (Krem hangat, secondary card & filter surface)
- `--ink-charcoal`: `#1E1A17` (Hitam arang, primary text & dark editorial section; contrast 16.05:1 on `#FAF6F0`, 14.37:1 on `#F2E9DC`)
- `--ink-muted`: `#574D44` (Cokelat arang lembut, secondary body copy; contrast 7.65:1 on `#FAF6F0`, 6.85:1 on `#F2E9DC`)
- `--border-strong`: `#7D6D5E` (Garis kontrol & input; contrast 4.62:1 on `#FAF6F0`, `#736355` at 4.79:1 on `#F2E9DC`)
- `--accent-terracotta`: `#B84014` (Oranye terakota, deliberate CTA & active state accent; `#FFFFFF` text on `#B84014` is 5.55:1; `#B84014` text on `#FAF6F0` is 5.16:1)
- `--accent-terracotta-hover`: `#98320D` (`#FFFFFF` text contrast 7.51:1)
- `--accent-on-dark`: `#E89D72` (Terakota terang khusus di atas latar arang `#1E1A17`; contrast 7.81:1)

## Typography (R-06)

- **Display / Headings**: `Bitter`, fallback `Georgia, serif`. Chosen for its warm, sturdy slab-serif presence that fits a homemade kitchen menu rather than generic SaaS sans fonts.
- **Body / UI / Prices**: `Plus Jakarta Sans`, fallback `'Segoe UI', system-ui, sans-serif`. Clean Indonesian humanist sans-serif with clear numeral legibility for Rupiah prices and compact mobile labels.
- **Fluid Scale**: `clamp()` on headings and relaxed `1rem` body so zooming to 200% reflows cleanly.

## Layout & Rhythm (RHYTHM 3, R-05, R-14)

Every section uses a distinct composition rather than repeating centered-title + equal-card grids:

1. **Navbar**: Minimalist single-row header with typographic wordmark `Ghilbra Snacks`, 4 real anchor links (`#menu`, `#keunggulan`, `#testimoni`, `#kontak`), and a labeled mobile toggle button (`Menu`).
2. **Hero**: Asymmetric 2-column split (copy + specific primary CTA on left; `4:3` framed kitchen placeholder `<img>` with `fetchpriority="high"` on right).
3. **Katalog Menu (`#menu`)**: Left-aligned header, interactive category filter buttons, live search filter with `<label>`, real empty/loading/error UI states, lead featured horizontal menu card when viewing all categories, and responsive 1/2/3-column product grid below.
4. **Keunggulan Toko (`#keunggulan`)**: High-contrast dark charcoal (`#1E1A17`) asymmetric split with sticky left summary (including labeled store placeholders) and 4 numbered horizontal editorial rows separated by hairlines.
5. **Testimoni Pembeli (`#testimoni`)**: Compact editorial strip presenting explicitly labeled `[TESTIMONI ASLI]` placeholder slots (no fabricated names or reviews) plus a working WhatsApp feedback link.
6. **Footer (`#kontak`)**: Asymmetric 2-part warm footer with store order details, labeled placeholders (`[Alamat dapur]`, `[Jam buka]`), and working section/WhatsApp links.

## Motion (MOTION 1)

- Hover, active pressed states, and subtle border/background transitions (`150ms ease`).
- Zero endless loops, zero scroll-jacking, and all transitions disabled under `prefers-reduced-motion: reduce`.
