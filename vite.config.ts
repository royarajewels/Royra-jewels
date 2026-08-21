import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
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
          admin_login: path.resolve(__dirname, 'admin/login.html'),
          admin_index: path.resolve(__dirname, 'admin/index.html'),
          admin_products: path.resolve(__dirname, 'admin/products.html'),
          admin_product_form: path.resolve(__dirname, 'admin/product-form.html'),
          admin_categories: path.resolve(__dirname, 'admin/categories.html'),
        },
      },
    },
  };
});
