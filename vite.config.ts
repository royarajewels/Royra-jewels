import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3002,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          shop: path.resolve(__dirname, 'shop.html'),
          product: path.resolve(__dirname, 'product.html'),
          about: path.resolve(__dirname, 'about.html'),
          contact: path.resolve(__dirname, 'contact.html'),
          cart: path.resolve(__dirname, 'cart.html'),
          wishlist: path.resolve(__dirname, 'wishlist.html'),
          order_confirmation: path.resolve(__dirname, 'order-confirmation.html'),
          admin_login: path.resolve(__dirname, 'admin/login.html'),
          admin_reset_password: path.resolve(__dirname, 'admin/reset-password.html'),
          admin_index: path.resolve(__dirname, 'admin/index.html'),
          admin_products: path.resolve(__dirname, 'admin/products.html'),
          admin_product_form: path.resolve(__dirname, 'admin/product-form.html'),
          admin_categories: path.resolve(__dirname, 'admin/categories.html'),
          admin_collections: path.resolve(__dirname, 'admin/collections.html'),
          admin_banners: path.resolve(__dirname, 'admin/banners.html'),
          admin_media: path.resolve(__dirname, 'admin/media.html'),
          admin_orders: path.resolve(__dirname, 'admin/orders.html'),
          admin_customers: path.resolve(__dirname, 'admin/customers.html'),
          admin_coupons: path.resolve(__dirname, 'admin/coupons.html'),
          admin_offers: path.resolve(__dirname, 'admin/offers.html'),
          admin_inventory: path.resolve(__dirname, 'admin/inventory.html'),
          admin_purchase_orders: path.resolve(__dirname, 'admin/purchase-orders.html'),
          admin_suppliers: path.resolve(__dirname, 'admin/suppliers.html'),
          admin_payments: path.resolve(__dirname, 'admin/payments.html'),
          admin_refunds: path.resolve(__dirname, 'admin/refunds.html'),
          admin_returns: path.resolve(__dirname, 'admin/returns.html'),
          admin_shipping: path.resolve(__dirname, 'admin/shipping.html'),
          admin_reports: path.resolve(__dirname, 'admin/reports.html'),
          admin_users: path.resolve(__dirname, 'admin/users.html'),
          admin_settings: path.resolve(__dirname, 'admin/settings.html'),
          cpanel: path.resolve(__dirname, 'cpanel/index.html'),
          cpanel_root: path.resolve(__dirname, 'cpanel.html'),
        },
      },
    },
  };
});
