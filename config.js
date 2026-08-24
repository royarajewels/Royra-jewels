/**
 * ROYRA JEWELS - BROWSER ENVIRONMENT CONFIGURATION FOR SUPABASE
 * 
 * This file contains the public configuration for connecting ROYRA JEWELS
 * to your Supabase project (both Customer Storefront & Admin Panel).
 * 
 * Works natively on static GitHub Pages, Netlify, Vercel, or standard web hosts.
 * 
 * IMPORTANT:
 * - Enter your Supabase Project URL in SUPABASE_URL below.
 * - Enter your Supabase Public Anon Key in SUPABASE_ANON_KEY below.
 * - NEVER use or expose your SUPABASE_SERVICE_ROLE_KEY here.
 */

window.__ENV__ = window.__ENV__ || {
  // 1. SUPABASE PROJECT URL (Example: "https://xyzcompany.supabase.co")
  SUPABASE_URL: "",

  // 2. SUPABASE PUBLIC ANON / PUBLISHABLE KEY (Starts with "eyJhbGci...")
  SUPABASE_ANON_KEY: "",

  // 3. NODE.JS BACKEND / C-PANEL API BASE URL
  // In Local Development: Leave empty to auto-detect http://localhost:3000 (or Vite proxy on :3002)
  // In Production / GitHub Pages: Set to your deployed Node.js backend URL
  API_BASE: "https://ais-dev-qvmgzjx5odfaoem7rmqock-197524094525.asia-southeast1.run.app"
};
