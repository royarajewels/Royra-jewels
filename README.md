# ROYRA JEWELS — Modern Luxury Fine Jewellery E-Commerce

ROYRA JEWELS is a high-end, responsive fine jewelry e-commerce website built with **HTML5, CSS3, and Vanilla JavaScript**. Designed with a sophisticated luxury aesthetic inspired by haute joaillerie boutiques, featuring 18K BIS hallmarked gold, solitaires, tennis bracelets, diamond earrings, and heirloom necklaces.

---

## 💎 Features & Architecture

- **Zero Framework Bloat**: Pure, ultra-fast static website with semantic HTML5, modern CSS3 variables, and vanilla JavaScript.
- **Complete Multi-Page Experience**:
  - `index.html`: Luxury Homepage with Hero Carousel, Trust Badges, Categories, Best Sellers Tab Filters, New Arrivals, Curated Collections, Iconic Showcase, Reviews, and Instagram Gallery.
  - `shop.html`: Full jewelry catalog with interactive multi-attribute filters (Category, Metal/Color, Price range), sorting (Featured, Newest, Low-to-High, High-to-Low, Rating), and real-time count.
  - `product.html`: High-conversion Product Details Page (PDP) with interactive thumbnail gallery, ring size selector, metal swatches, live delivery pincode checker, and accordion specifications.
  - `about.html`: Brand story, atelier craftsmanship pillars, ethical sourcing, and BIS 916 purity assurances.
  - `contact.html`: Concierge consultation booking form, WhatsApp integration, atelier studio details, and Ring Size Guide Chart.
  - `cart.html`: Full Shopping Bag with quantity steppers, promo codes (`ROYRA10`, `WELCOME500`), free shipping progress bar, and instant simulated checkout.
  - `wishlist.html`: Saved creations with instant "Add to Bag" and removal.
- **Interactive Global Systems**:
  - **Cart Drawer**: Slide-out shopping bag accessible from any page with live subtotal calculation and free shipping threshold tracker (₹999).
  - **Live Search Overlay**: Instant real-time search filtering across names, categories, and descriptions.
  - **Quick View Modal**: Pop-up window to preview pieces and select sizes without leaving the grid.
  - **Persistent State**: Shopping cart and wishlist persist across browser refreshes via `localStorage`.
  - **Mobile-First Responsive Layout**: Smooth slide-out mobile menu drawer and responsive grids for phones, tablets, laptops, and ultra-wide screens.

---

## 🚀 How to Run Locally

### Option 1: Using VS Code Live Server
1. Open the project folder in VS Code.
2. Right-click `index.html` and select **"Open with Live Server"**.
3. Your browser will open the website at `http://127.0.0.1:5500/index.html`.

### Option 2: Using Python Simple HTTP Server
```bash
# Python 3
python -m http.server 8000
```
Open `http://localhost:8000` in your browser.

### Option 3: Using Node / Vite (Included in this repo)
```bash
npm install
npm run dev
```

---

## 🌐 How to Deploy to GitHub Pages

Because ROYRA JEWELS is built with pure static HTML, CSS, and JS with relative asset paths, it is **100% ready for GitHub Pages**:

1. **Create a GitHub Repository**:
   - Go to [github.com/new](https://github.com/new) and create a new repository (e.g. `royra-jewels`).
2. **Push your code**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Royra Jewels Luxury E-Commerce"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/royra-jewels.git
   git push -u origin main
   ```
3. **Enable GitHub Pages**:
   - Go to your repository **Settings** → **Pages**.
   - Under **Build and deployment** > **Source**, select **Deploy from a branch**.
   - Choose branch `main` and folder `/ (root)`.
   - Click **Save**.
4. Your site will be live at `https://YOUR_USERNAME.github.io/royra-jewels/` in under 60 seconds!

---

## 🎨 Customization Guide

### 1. Changing Brand Name & Logo
Open `style.css` and the HTML files. Search for:
```html
<a href="index.html" class="site-logo">
  <span class="logo-text">ROYRA</span>
  <span class="logo-subtext">JEWELS</span>
</a>
```
You can replace the text or embed an `<img src="assets/images/your-logo.png" />`.

### 2. Modifying Color Palette
All colors are centralized in `style.css` under the `:root` pseudo-class:
```css
:root {
  --primary-text: #171717;      /* Main text & dark accents */
  --gold-primary: #B08D57;      /* Royra Signature Warm Gold */
  --gold-hover: #967442;        /* Darker gold for hover states */
  --bg-primary: #FFFFFF;        /* Crisp white background */
  --bg-secondary: #F8F6F2;      /* Warm ivory luxury background */
  --border-color: #E8E4DD;      /* Subtle border tone */
}
```

### 3. Adding or Updating Products
Open `script.js`. All products are configured in the `ROYRA_PRODUCTS` array:
```javascript
{
  id: "royra-ring-01",
  name: "Classic Gold Solitaire Ring",
  category: "rings",            // "rings", "earrings", "bracelets", "necklaces"
  price: 9999,                  // Current price in INR
  oldPrice: 12999,              // Original price for discount calculation
  badge: "Bestseller",          // "Bestseller", "New Arrival", etc.
  image: "assets/images/products/ring-1.svg",
  material: "18K Yellow Gold",
  stone: "VVS-VS Certified Diamond (1.20 Carats)",
  description: "Handcrafted 18K gold ring...",
  sizes: ["10", "12", "14", "16", "18", "20"],
  inStock: true,
  isBestSeller: true
}
```

### 4. Customizing Coupon Codes
Open `script.js` in `applyCouponCode()`:
- `ROYRA10` unlocks 10% instant discount across the order.
- `WELCOME500` applies ₹500 off.
You can easily add new codes like `FESTIVE20` or `VALENTINE15`.

---

## 💳 Payment Gateway Integration (Next Steps)
To connect real payments for production:
- **Razorpay (India)**: Include the Razorpay checkout script `<script src="https://checkout.razorpay.com/v1/checkout.js"></script>` and trigger `options = { key: "YOUR_KEY", amount: CartStore.getSubtotal() * 100, currency: "INR" }`.
- **Stripe**: Initialize `stripe.redirectToCheckout()` with server-side session.
- **Cashfree / PhonePe / Paytm**: Connect API webhooks for instant UPI processing.

---

© 2026 ROYRA JEWELS. Handcrafted with passion.
