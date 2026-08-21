/**
 * ROYRA JEWELS - Supabase Client & API Service Layer
 * 
 * Exclusively uses Supabase services:
 * 1. Supabase Auth (Admin authentication, session checking, sign out)
 * 2. Supabase PostgreSQL Database (Products, Categories, Product Images, Profiles)
 * 3. Supabase Storage (Multi-image uploads to 'product-images' bucket)
 * 
 * Uses ONLY public Anon Key (SUPABASE_ANON_KEY).
 * NEVER exposes or uses SUPABASE_SERVICE_ROLE_KEY.
 */

(function (window) {
  'use strict';

  // 1. SUPABASE CONFIGURATION
  // Configured via localStorage or environment settings
  const SUPABASE_STORAGE_KEYS = {
    URL: 'royra_supabase_url',
    ANON_KEY: 'royra_supabase_anon_key',
    BUCKET: 'product-images',
    SESSION_CACHE: 'royra_supabase_auth_cache'
  };

  // Safe credentials retrieval
  // 1. Primary Source of Truth: window.__ENV__ (from /config.js on GitHub Pages or static host)
  // 2. Secondary/Fallback: localStorage (only if developer set a local override)
  function getSupabaseConfig() {
    const envObj = (typeof window !== 'undefined' && (window.__ENV__ || window.ENV || window._ENV || {})) || {};
    const defaultUrl = (typeof window !== 'undefined' && (window.SUPABASE_URL || window.VITE_SUPABASE_URL)) ||
                       envObj.SUPABASE_URL ||
                       envObj.VITE_SUPABASE_URL ||
                       '';
    const defaultKey = (typeof window !== 'undefined' && (window.SUPABASE_ANON_KEY || window.VITE_SUPABASE_ANON_KEY)) ||
                       envObj.SUPABASE_ANON_KEY ||
                       envObj.VITE_SUPABASE_ANON_KEY ||
                       '';

    let localOverrideUrl = '';
    let localOverrideKey = '';
    try {
      if (typeof localStorage !== 'undefined') {
        localOverrideUrl = localStorage.getItem(SUPABASE_STORAGE_KEYS.URL) || '';
        localOverrideKey = localStorage.getItem(SUPABASE_STORAGE_KEYS.ANON_KEY) || '';
      }
    } catch (e) {}

    // Priority: Local override if explicitly set in modal, otherwise public default from config.js
    const finalUrl = (localOverrideUrl || defaultUrl || '').trim();
    const finalAnonKey = (localOverrideKey || defaultKey || '').trim();

    return {
      url: finalUrl,
      anonKey: finalAnonKey,
      defaultUrl: (defaultUrl || '').trim(),
      defaultAnonKey: (defaultKey || '').trim(),
      storageBucket: SUPABASE_STORAGE_KEYS.BUCKET,
      hasDefaultConfig: Boolean(defaultUrl && defaultKey),
      hasLocalOverride: Boolean(localOverrideUrl && localOverrideKey)
    };
  }

  // Check if Supabase connection credentials exist and are valid
  function isSupabaseConfigured() {
    const config = getSupabaseConfig();
    return Boolean(
      config.url &&
      config.anonKey &&
      config.url.startsWith('https://') &&
      config.anonKey.length > 20
    );
  }

  // Supabase Client Instance (Singleton)
  let supabase = null;

  function initSupabaseClient() {
    const config = getSupabaseConfig();
    if (typeof window.supabase !== 'undefined' && isSupabaseConfigured()) {
      try {
        supabase = window.supabase.createClient(config.url, config.anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });
        return supabase;
      } catch (err) {
        console.error('[Supabase Init Error]:', err);
      }
    }
    return null;
  }

  // Initial client creation on script load
  initSupabaseClient();

  // --------------------------------------------------------------------------
  // SUPABASE SERVICE LAYER (RoyraDB)
  // --------------------------------------------------------------------------
  const RoyraDB = {
    // Config Status
    isConfigured() {
      return isSupabaseConfigured();
    },

    getConfig() {
      return getSupabaseConfig();
    },

    getClient() {
      if (!supabase) {
        initSupabaseClient();
      }
      return supabase;
    },

    setCredentials(url, anonKey) {
      if (!url || !anonKey) {
        return { success: false, error: 'Both Supabase URL and Anon Key are required.' };
      }
      localStorage.setItem(SUPABASE_STORAGE_KEYS.URL, url.trim());
      localStorage.setItem(SUPABASE_STORAGE_KEYS.ANON_KEY, anonKey.trim());
      initSupabaseClient();
      return { success: true };
    },

    clearCredentials() {
      try {
        localStorage.removeItem(SUPABASE_STORAGE_KEYS.URL);
        localStorage.removeItem(SUPABASE_STORAGE_KEYS.ANON_KEY);
        localStorage.removeItem(SUPABASE_STORAGE_KEYS.SESSION_CACHE);
      } catch (e) {}
      supabase = null;
      initSupabaseClient();
      return { success: true };
    },

    // ========================================================================
    // 1. SUPABASE AUTHENTICATION
    // ========================================================================

    /**
     * Retrieves the profile of a given user ID from public.profiles
     */
    async getUserProfile(userId) {
      if (!userId) return null;
      const client = this.getClient();
      if (!client) return null;

      try {
        const { data, error } = await client
          .from('profiles')
          .select('id, email, full_name, role, avatar_url')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          console.warn('[Supabase getUserProfile Error]:', error);
          return null;
        }
        return data;
      } catch (err) {
        console.warn('[Supabase getUserProfile Exception]:', err);
        return null;
      }
    },

    /**
     * Authenticates an admin user using Supabase Auth signInWithPassword.
     * Verifies that the user exists and has role === 'admin' in public.profiles.
     */
    async login(email, password) {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'Supabase is not configured. Please enter your Supabase Project URL and Anon Key.',
          needsConfig: true
        };
      }

      const client = this.getClient();
      if (!client) {
        return { success: false, error: 'Failed to initialize Supabase client.' };
      }

      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: email.trim(),
          password: password
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (!data || !data.user || !data.session) {
          return { success: false, error: 'Authentication failed. No active session returned.' };
        }

        // Verify that the user has the 'admin' role in public.profiles
        const profile = await this.getUserProfile(data.user.id);
        const role = (profile && profile.role) ? profile.role.toLowerCase() : 'customer';

        if (role !== 'admin') {
          // Reject login for non-admin accounts and sign out immediately
          await client.auth.signOut();
          localStorage.removeItem(SUPABASE_STORAGE_KEYS.SESSION_CACHE);
          return {
            success: false,
            error: `Access Denied: Account (${email.trim()}) has role '${role}'. Admin access requires role = 'admin'. Run the promotion SQL in Supabase to grant admin privileges.`
          };
        }

        const sessionUser = {
          id: data.user.id,
          email: data.user.email,
          role: 'admin',
          fullName: profile?.full_name || 'Royra Administrator',
          accessToken: data.session.access_token,
          expiresAt: data.session.expires_at
        };

        localStorage.setItem(SUPABASE_STORAGE_KEYS.SESSION_CACHE, JSON.stringify(sessionUser));

        return {
          success: true,
          user: data.user,
          session: data.session,
          profile: profile,
          role: 'admin'
        };
      } catch (err) {
        console.error('[Supabase Auth Login Error]:', err);
        return { success: false, error: err.message || 'An unexpected authentication error occurred.' };
      }
    },

    /**
     * Signs out the currently authenticated Supabase user
     */
    async logout() {
      const client = this.getClient();
      if (client) {
        try {
          await client.auth.signOut();
        } catch (e) {
          console.warn('[Supabase SignOut Error]:', e);
        }
      }
      localStorage.removeItem(SUPABASE_STORAGE_KEYS.SESSION_CACHE);
      return { success: true };
    },

    /**
     * Retrieves the current Supabase Auth session
     */
    async getSession() {
      const client = this.getClient();
      if (!client) return null;

      try {
        const { data: { session }, error } = await client.auth.getSession();
        if (error || !session) {
          localStorage.removeItem(SUPABASE_STORAGE_KEYS.SESSION_CACHE);
          return null;
        }
        return session;
      } catch (err) {
        return null;
      }
    },

    /**
     * Retrieves current authenticated Supabase user
     */
    async getCurrentUser() {
      const client = this.getClient();
      if (!client) return null;

      try {
        const { data: { user }, error } = await client.auth.getUser();
        if (error || !user) return null;
        return user;
      } catch (err) {
        return null;
      }
    },

    /**
     * Constructs the exact absolute redirect URL for password resets,
     * supporting GitHub Pages (/Royra-jewels/admin/reset-password.html),
     * local dev (http://localhost:3000/admin/reset-password.html), and previews.
     */
    getResetPasswordRedirectUrl() {
      if (typeof window === 'undefined') return '';
      const origin = window.location.origin;
      const pathname = window.location.pathname || '';
      
      let basePath = '';
      if (pathname.includes('/admin/')) {
        basePath = pathname.substring(0, pathname.indexOf('/admin/'));
      } else {
        const lastSlash = pathname.lastIndexOf('/');
        if (lastSlash > 0) {
          basePath = pathname.substring(0, lastSlash);
        }
      }

      // Ensure no double slashes in base path
      basePath = basePath.replace(/\/+$/, '');
      return `${origin}${basePath}/admin/reset-password.html`;
    },

    /**
     * Sends a Supabase password reset email to the admin with explicit redirectTo URL
     */
    async requestPasswordReset(email, customRedirectUrl = null) {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'Supabase is not configured. Please configure your project in /config.js.'
        };
      }

      const client = this.getClient();
      if (!client) {
        return { success: false, error: 'Failed to initialize Supabase client.' };
      }

      const redirectTo = customRedirectUrl || this.getResetPasswordRedirectUrl();
      console.log('[Supabase Password Reset]: Requesting email reset with redirectTo:', redirectTo);

      try {
        const { data, error } = await client.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: redirectTo
        });

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true, data: data, redirectTo: redirectTo };
      } catch (err) {
        console.error('[Supabase requestPasswordReset Error]:', err);
        return { success: false, error: err.message || 'Error sending password reset email.' };
      }
    },

    /**
     * Updates user's password during an active Supabase recovery session.
     * Uses client.auth.updateUser({ password })
     */
    async updatePassword(newPassword) {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'Supabase is not configured. Please configure your project in /config.js.'
        };
      }

      const client = this.getClient();
      if (!client) {
        return { success: false, error: 'Failed to initialize Supabase client.' };
      }

      if (!newPassword || newPassword.length < 8) {
        return { success: false, error: 'Password must be at least 8 characters.' };
      }

      try {
        const { data, error } = await client.auth.updateUser({
          password: newPassword
        });

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true, user: data.user };
      } catch (err) {
        console.error('[Supabase updatePassword Error]:', err);
        return { success: false, error: err.message || 'Error updating password.' };
      }
    },

    /**
     * Strict route protection guard for admin pages.
     * Verifies BOTH a valid Supabase Auth session AND profiles.role === 'admin'.
     */
    async checkAuthAndRedirect(redirectUrl = 'login.html') {
      if (!this.isConfigured()) {
        window.location.href = redirectUrl + '?reason=unconfigured';
        return false;
      }

      const session = await this.getSession();
      if (!session || !session.user) {
        window.location.href = redirectUrl + '?reason=unauthorized';
        return false;
      }

      // Check user role from profiles table
      const profile = await this.getUserProfile(session.user.id);
      if (!profile || profile.role !== 'admin') {
        console.warn('[Admin Guard]: User role is not admin:', profile?.role);
        await this.logout();
        window.location.href = redirectUrl + '?reason=forbidden';
        return false;
      }

      return true;
    },

    // ========================================================================
    // 2. PRODUCTS CRUD (SUPABASE POSTGRESQL + PRODUCT_IMAGES)
    // ========================================================================

    /**
     * Retrieves products from Supabase PostgreSQL table 'products'
     * with joined 'product_images' records
     */
    async getProducts(filters = {}) {
      const client = this.getClient();
      if (!client) {
        // Fallback to local catalog if Supabase credentials are pending
        return this.getLocalProducts(filters);
      }

      try {
        let query = client
          .from('products')
          .select('*, product_images(*)');

        // Apply Status Filter
        if (filters.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }

        // Apply Category Filter
        if (filters.category && filters.category !== 'all') {
          query = query.ilike('category', filters.category);
        }

        // Apply Search (Product Name, SKU, or Description)
        if (filters.search && filters.search.trim()) {
          const term = `%${filters.search.trim()}%`;
          query = query.or(`name.ilike.${term},sku.ilike.${term},product_type.ilike.${term}`);
        }

        // Apply Sorting
        if (filters.sort === 'newest') {
          query = query.order('created_at', { ascending: false });
        } else if (filters.sort === 'oldest') {
          query = query.order('created_at', { ascending: true });
        } else if (filters.sort === 'price-low') {
          query = query.order('price', { ascending: true });
        } else if (filters.sort === 'price-high') {
          query = query.order('price', { ascending: false });
        } else if (filters.sort === 'name-az') {
          query = query.order('name', { ascending: true });
        } else if (filters.sort === 'stock-low') {
          query = query.order('stock_quantity', { ascending: true });
        } else {
          query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;

        if (error) {
          console.error('[Supabase getProducts Error]:', error);
          return this.getLocalProducts(filters);
        }

        if (Array.isArray(data)) {
          return data.map(item => this.mapSupabaseProduct(item));
        }

        return [];
      } catch (err) {
        console.error('[Supabase getProducts Exception]:', err);
        return this.getLocalProducts(filters);
      }
    },

    /**
     * Retrieves single product by ID with product_images
     */
    async getProductById(id) {
      if (!id) return null;
      const client = this.getClient();
      if (!client) {
        const local = this.getLocalProducts();
        return local.find(p => p.id === id || String(p.id) === String(id)) || null;
      }

      try {
        const { data, error } = await client
          .from('products')
          .select('*, product_images(*)')
          .eq('id', id)
          .maybeSingle();

        if (error || !data) {
          const local = this.getLocalProducts();
          return local.find(p => p.id === id || String(p.id) === String(id)) || null;
        }

        return this.mapSupabaseProduct(data);
      } catch (err) {
        console.error('[Supabase getProductById Error]:', err);
        return null;
      }
    },

    /**
     * Checks unique SKU constraint against Supabase PostgreSQL
     */
    async isSkuUnique(sku, currentProductId = null) {
      if (!sku || !sku.trim()) return true;
      const normalizedSku = sku.trim().toUpperCase();

      const client = this.getClient();
      if (!client) {
        const products = this.getLocalProducts();
        const existing = products.find(p =>
          p.sku && p.sku.trim().toUpperCase() === normalizedSku && p.id !== currentProductId
        );
        return !existing;
      }

      try {
        let query = client
          .from('products')
          .select('id, sku')
          .eq('sku', normalizedSku);

        if (currentProductId) {
          query = query.neq('id', currentProductId);
        }

        const { data, error } = await query;
        if (error) {
          console.warn('[Supabase SKU Check Error]:', error);
          return true;
        }

        return !data || data.length === 0;
      } catch (e) {
        return true;
      }
    },

    /**
     * Saves or updates a product and writes multiple images into product_images table
     */
    async saveProduct(productData, isEdit = false) {
      const now = new Date().toISOString();
      const client = this.getClient();

      const isNumericId = productData.id !== undefined && productData.id !== null && !isNaN(Number(productData.id)) && String(productData.id).trim() !== '';
      const existingNumericId = isNumericId ? Number(productData.id) : null;
      const slug = productData.slug || (productData.name ? productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : `product-${Date.now()}`);
      const sku = (productData.sku || `ROY-${Date.now().toString(36).toUpperCase()}`).toUpperCase().trim();

      // Gallery and image URLs
      const imagesList = Array.isArray(productData.images) && productData.images.length > 0
        ? productData.images
        : (Array.isArray(productData.gallery) ? productData.gallery.map((url, i) => ({ url, isPrimary: i === 0 })) : []);

      const primaryImage = imagesList.find(img => img.isPrimary)?.url || imagesList[0]?.url || productData.image || 'assets/products/product-01.jpg';

      // 1. Database Payload for 'products' table
      const dbProductPayload = {
        name: productData.name,
        slug,
        sku,
        category: (productData.category || 'rings').toLowerCase(),
        product_type: productData.productType || 'Solitaire',
        short_description: productData.shortDescription || '',
        description: productData.description || '',
        regular_price: Number(productData.regularPrice || productData.price) || 0,
        sale_price: productData.salePrice ? Number(productData.salePrice) : (productData.oldPrice ? Number(productData.price) : null),
        price: Number(productData.price) || 0,
        stock_quantity: Number(productData.stock) >= 0 ? Number(productData.stock) : 10,
        low_stock_alert: Number(productData.lowStockAlert) || 3,
        status: productData.status || 'Active',
        metal: productData.material || '18K Solid Gold / 925 Sterling Silver',
        purity: productData.purity || '',
        stone_name: productData.stone || 'Certified Gemstone',
        stone_type: productData.stoneType || '',
        weight: productData.weight || '3.50g approx',
        finish: productData.plating || '18K High Polish',
        collection: productData.collection || 'everyday',
        image_url: primaryImage,
        updated_at: now
      };

      let finalProductId = productData.id || `royra-${Date.now()}`;

      // Execute Supabase PostgreSQL write
      if (client) {
        try {
          let savedRow = null;

          if (isEdit && existingNumericId) {
            // Update existing BIGINT record
            dbProductPayload.id = existingNumericId;
            const { data, error: updateError } = await client
              .from('products')
              .update(dbProductPayload)
              .eq('id', existingNumericId)
              .select('*')
              .maybeSingle();

            if (updateError) {
              console.error('[Supabase Product Update Error]:', updateError);
              return { success: false, error: updateError.message };
            }
            savedRow = data || { id: existingNumericId };
          } else {
            // Insert new product (PostgreSQL auto-generates the BIGINT Identity ID)
            if (existingNumericId) {
              dbProductPayload.id = existingNumericId;
            }
            dbProductPayload.created_at = now;

            const { data, error: insertError } = await client
              .from('products')
              .insert(dbProductPayload)
              .select('*')
              .single();

            if (insertError) {
              console.error('[Supabase Product Insert Error]:', insertError);
              return { success: false, error: insertError.message };
            }
            savedRow = data;
          }

          if (savedRow && savedRow.id !== undefined) {
            finalProductId = savedRow.id;
            const numericFkId = Number(savedRow.id);

            // Write records into 'product_images' table using BIGINT product_id
            if (imagesList.length > 0 && !isNaN(numericFkId)) {
              await client
                .from('product_images')
                .delete()
                .eq('product_id', numericFkId);

              const imageRows = imagesList.map((img, idx) => ({
                product_id: numericFkId,
                image_url: typeof img === 'string' ? img : img.url,
                storage_path: img.path || null,
                display_order: idx,
                is_primary: idx === 0 || Boolean(img.isPrimary),
                created_at: now
              }));

              const { error: imgError } = await client
                .from('product_images')
                .insert(imageRows);

              if (imgError) {
                console.warn('[Supabase product_images insert warning]:', imgError);
              }
            }
          }
        } catch (err) {
          console.error('[Supabase saveProduct Exception]:', err);
          return { success: false, error: err.message };
        }
      }

      // Also keep local sync for instant storefront preview
      this.syncLocalProduct({
        ...productData,
        id: finalProductId,
        slug,
        sku,
        image: primaryImage,
        gallery: imagesList.map(img => typeof img === 'string' ? img : img.url),
        createdAt: isEdit ? (productData.createdAt || now) : now,
        updatedAt: now
      });

      return {
        success: true,
        productId: finalProductId
      };
    },

    /**
     * Deletes a product from Supabase PostgreSQL (Foreign keys cascade to product_images)
     */
    async deleteProduct(productId) {
      if (!productId && productId !== 0) return { success: false, error: 'Product ID is required.' };

      const client = this.getClient();
      if (client) {
        try {
          const isNumeric = !isNaN(Number(productId)) && String(productId).trim() !== '';
          let query = client.from('products').delete();

          if (isNumeric) {
            query = query.eq('id', Number(productId));
          } else {
            query = query.eq('slug', String(productId));
          }

          const { error } = await query;

          if (error) {
            console.error('[Supabase deleteProduct Error]:', error);
            return { success: false, error: error.message };
          }
        } catch (err) {
          console.error('[Supabase deleteProduct Exception]:', err);
          return { success: false, error: err.message };
        }
      }

      // Delete from local cache
      this.deleteLocalProduct(productId);
      return { success: true };
    },

    // ========================================================================
    // 3. CATEGORIES CRUD (SUPABASE POSTGRESQL)
    // ========================================================================

    async getCategories() {
      const client = this.getClient();
      if (client) {
        try {
          const { data, error } = await client
            .from('categories')
            .select('*')
            .order('name', { ascending: true });

          if (!error && Array.isArray(data) && data.length > 0) {
            return data;
          }
        } catch (err) {
          console.warn('[Supabase getCategories Error]:', err);
        }
      }

      return this.getLocalCategories();
    },

    async saveCategory(categoryData, isEdit = false) {
      const slug = categoryData.slug || categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const id = isEdit && categoryData.id ? categoryData.id : `cat-${slug}`;
      const now = new Date().toISOString();

      const dbPayload = {
        id,
        name: categoryData.name,
        slug,
        description: categoryData.description || '',
        status: categoryData.status || 'Active',
        created_at: now
      };

      const client = this.getClient();
      if (client) {
        try {
          const { error } = await client
            .from('categories')
            .upsert(dbPayload);

          if (error) {
            console.error('[Supabase saveCategory Error]:', error);
            return { success: false, error: error.message };
          }
        } catch (err) {
          return { success: false, error: err.message };
        }
      }

      this.syncLocalCategory(dbPayload);
      return { success: true, category: dbPayload };
    },

    async deleteCategory(categoryId) {
      const client = this.getClient();
      if (client) {
        try {
          const { error } = await client
            .from('categories')
            .delete()
            .eq('id', categoryId);

          if (error) {
            return { success: false, error: error.message };
          }
        } catch (err) {
          return { success: false, error: err.message };
        }
      }

      this.deleteLocalCategory(categoryId);
      return { success: true };
    },

    // ========================================================================
    // 4. SUPABASE STORAGE (IMAGE UPLOADS)
    // ========================================================================

    /**
     * Uploads an image file to Supabase Storage bucket 'product-images'
     * Returns public URL and storage path.
     */
    async uploadImage(file, folder = 'products') {
      if (!file) return { success: false, error: 'No file provided' };

      const client = this.getClient();
      const config = this.getConfig();

      if (client && this.isConfigured()) {
        try {
          const fileExt = file.name.split('.').pop();
          const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const filePath = `${folder}/${Date.now()}_${cleanFileName}`;

          const { data, error } = await client.storage
            .from(config.storageBucket)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) {
            console.error('[Supabase Storage Upload Error]:', error);
            throw error;
          }

          if (data) {
            const { data: publicUrlData } = client.storage
              .from(config.storageBucket)
              .getPublicUrl(filePath);

            return {
              success: true,
              url: publicUrlData.publicUrl,
              path: filePath,
              name: file.name
            };
          }
        } catch (e) {
          console.warn('[Supabase Storage Fallback to DataURL]:', e);
        }
      }

      // Client DataURL fallback for offline or pre-configured preview mode
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            success: true,
            url: e.target.result,
            path: `local/${file.name}`,
            name: file.name
          });
        };
        reader.onerror = () => resolve({ success: false, error: 'Failed to read image file.' });
        reader.readAsDataURL(file);
      });
    },

    // ========================================================================
    // 5. HELPER DATA MAPPERS & LOCAL STATE SYNCHRONIZATION
    // ========================================================================

    mapSupabaseProduct(row) {
      let gallery = [];
      if (row.product_images && Array.isArray(row.product_images)) {
        gallery = row.product_images
          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
          .map(img => img.image_url);
      }
      if (gallery.length === 0 && row.image_url) {
        gallery = [row.image_url];
      }

      return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        sku: row.sku,
        category: row.category,
        productType: row.product_type || 'Solitaire',
        shortDescription: row.short_description || '',
        description: row.description || '',
        price: Number(row.price) || Number(row.regular_price) || 0,
        regularPrice: Number(row.regular_price) || Number(row.price) || 0,
        salePrice: row.sale_price ? Number(row.sale_price) : null,
        oldPrice: row.sale_price ? Number(row.regular_price) : null,
        stock: row.stock_quantity ?? 10,
        lowStockAlert: row.low_stock_alert ?? 3,
        inStock: (row.stock_quantity ?? 10) > 0,
        status: row.status || 'Active',
        material: row.metal || '18K Solid Gold / 925 Sterling Silver',
        purity: row.purity || '',
        stone: row.stone_name || 'Certified Gemstone',
        stoneType: row.stone_type || '',
        weight: row.weight || '3.50g approx',
        plating: row.finish || '18K High Polish',
        collection: row.collection || 'everyday',
        image: row.image_url || gallery[0] || 'assets/products/product-01.jpg',
        secondImage: gallery[1] || null,
        gallery: gallery,
        rating: 4.9,
        reviewsCount: 1,
        finishes: ['Gold', 'Silver', 'Rose Gold'],
        sizes: ['5', '6', '7', '8', '9', '10'],
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    },

    getLocalProducts(filters = {}) {
      try {
        const raw = localStorage.getItem('royra_db_products_v2');
        let list = raw ? JSON.parse(raw) : (window.ROYRA_PRODUCTS || []);
        if (!Array.isArray(list)) list = [];

        if (filters.status && filters.status !== 'all') {
          list = list.filter(p => (p.status || 'Active').toLowerCase() === filters.status.toLowerCase());
        }
        if (filters.category && filters.category !== 'all') {
          list = list.filter(p => (p.category || '').toLowerCase() === filters.category.toLowerCase());
        }
        if (filters.search && filters.search.trim()) {
          const q = filters.search.trim().toLowerCase();
          list = list.filter(p =>
            (p.name && p.name.toLowerCase().includes(q)) ||
            (p.sku && p.sku.toLowerCase().includes(q)) ||
            (p.category && p.category.toLowerCase().includes(q))
          );
        }
        return list;
      } catch (e) {
        return [];
      }
    },

    syncLocalProduct(product) {
      try {
        let list = this.getLocalProducts();
        const idx = list.findIndex(p => p.id === product.id);
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...product };
        } else {
          list.unshift(product);
        }
        localStorage.setItem('royra_db_products_v2', JSON.stringify(list));
        window.dispatchEvent(new CustomEvent('royra:products-updated', { detail: { products: list } }));
      } catch (e) {}
    },

    deleteLocalProduct(id) {
      try {
        let list = this.getLocalProducts().filter(p => p.id !== id);
        localStorage.setItem('royra_db_products_v2', JSON.stringify(list));
        window.dispatchEvent(new CustomEvent('royra:products-updated', { detail: { products: list } }));
      } catch (e) {}
    },

    getLocalCategories() {
      const defaultCategories = [
        { id: 'cat-rings', name: 'Rings', slug: 'rings', description: 'Solitaires, eternity bands, and cocktail rings', status: 'Active', count: 8 },
        { id: 'cat-earrings', name: 'Earrings', slug: 'earrings', description: 'Studs, drop chandeliers, and everyday huggies', status: 'Active', count: 4 },
        { id: 'cat-bracelets', name: 'Bracelets', slug: 'bracelets', description: 'Diamond tennis bracelets and solid gold cuffs', status: 'Active', count: 4 },
        { id: 'cat-necklaces', name: 'Necklaces', slug: 'necklaces', description: 'Solitaire pendants, chokers, and heritage lariats', status: 'Active', count: 4 },
        { id: 'cat-sets', name: 'Jewellery Sets', slug: 'sets', description: 'Complete bridal and bespoke gala suites', status: 'Active', count: 0 }
      ];

      try {
        const raw = localStorage.getItem('royra_db_categories_v2');
        return raw ? JSON.parse(raw) : defaultCategories;
      } catch (e) {
        return defaultCategories;
      }
    },

    syncLocalCategory(cat) {
      try {
        let list = this.getLocalCategories();
        const idx = list.findIndex(c => c.id === cat.id);
        if (idx >= 0) list[idx] = cat;
        else list.push(cat);
        localStorage.setItem('royra_db_categories_v2', JSON.stringify(list));
        window.dispatchEvent(new CustomEvent('royra:categories-updated', { detail: { categories: list } }));
      } catch (e) {}
    },

    deleteLocalCategory(id) {
      try {
        let list = this.getLocalCategories().filter(c => c.id !== id);
        localStorage.setItem('royra_db_categories_v2', JSON.stringify(list));
        window.dispatchEvent(new CustomEvent('royra:categories-updated', { detail: { categories: list } }));
      } catch (e) {}
    },

    // ========================================================================
    // 6. COMPLETE SUPABASE SQL SCHEMA GENERATOR (STRICT ROLE-BASED RLS)
    // ========================================================================
    getSchemaSQL() {
      return `
-- ============================================================================
-- ROYRA JEWELS - PRODUCTION SECURE SUPABASE POSTGRESQL SCHEMA & MIGRATION
-- STRICT ROLE-BASED AUTHORIZATION & ROW LEVEL SECURITY (RLS)
-- IDEMPOTENT & SAFE TO RUN ON BOTH FRESH AND EXISTING/PARTIAL DATABASES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. BASE TABLE DEFINITIONS
-- ----------------------------------------------------------------------------

-- 1.1 PROFILES TABLE (Linked with Supabase auth.users)
-- Default role is strictly 'customer'. Only promoted users receive 'admin'.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'staff', 'customer')),
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Draft', 'Archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 PRODUCTS TABLE (BIGINT Identity Primary Key)
CREATE TABLE IF NOT EXISTS public.products (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL DEFAULT 'Uncategorized',
  product_type TEXT DEFAULT 'Solitaire',
  short_description TEXT,
  description TEXT,
  regular_price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (regular_price >= 0),
  sale_price NUMERIC(10,2) CHECK (sale_price >= 0),
  price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  stock_quantity INTEGER DEFAULT 10 CHECK (stock_quantity >= 0),
  low_stock_alert INTEGER DEFAULT 3 CHECK (low_stock_alert >= 0),
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Draft', 'Out of Stock', 'Archived')),
  metal TEXT DEFAULT '18K Solid Gold / 925 Sterling Silver',
  purity TEXT,
  stone_name TEXT DEFAULT 'Certified Gemstone',
  stone_type TEXT,
  weight TEXT,
  finish TEXT DEFAULT '18K High Polish',
  collection TEXT DEFAULT 'everyday',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.4 PRODUCT IMAGES TABLE (BIGINT product_id matches products.id identically)
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. DEFENSIVE MIGRATIONS FOR EXISTING / PARTIALLY-CREATED TABLES
-- (Guarantees every column exists before indexes, triggers, and policies run)
-- ----------------------------------------------------------------------------

-- 2.1 Profiles Columns Migration
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE public.profiles SET role = 'customer' WHERE role IS NULL;

-- 2.2 Categories Columns Migration
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE public.categories SET status = 'Active' WHERE status IS NULL;
UPDATE public.categories SET name = id WHERE name IS NULL;
UPDATE public.categories SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g')) WHERE slug IS NULL;

-- 2.3 Products Columns Migration (Fixes missing 'category' and all other columns)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Uncategorized';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'Solitaire';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS regular_price NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sale_price NUMERIC(10,2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 10;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS low_stock_alert INTEGER DEFAULT 3;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS metal TEXT DEFAULT '18K Solid Gold / 925 Sterling Silver';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS purity TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stone_name TEXT DEFAULT 'Certified Gemstone';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stone_type TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS weight TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS finish TEXT DEFAULT '18K High Polish';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS collection TEXT DEFAULT 'everyday';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Backfill default values on products for existing rows
UPDATE public.products SET category = 'Uncategorized' WHERE category IS NULL;
UPDATE public.products SET status = 'Active' WHERE status IS NULL;
UPDATE public.products SET price = COALESCE(regular_price, 0) WHERE price IS NULL;
UPDATE public.products SET regular_price = COALESCE(price, 0) WHERE regular_price IS NULL;
UPDATE public.products SET stock_quantity = 10 WHERE stock_quantity IS NULL;
UPDATE public.products SET low_stock_alert = 3 WHERE low_stock_alert IS NULL;
UPDATE public.products SET sku = CONCAT('ROY-', id) WHERE sku IS NULL;
UPDATE public.products SET slug = CONCAT('product-', id) WHERE slug IS NULL;

-- 2.4 Product Images Columns Migration & Type Safety
ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS product_id BIGINT;
ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;
ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Safely convert product_id column from TEXT to BIGINT if created in a previous run
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'product_images' AND column_name = 'product_id' AND data_type = 'text'
  ) THEN
    ALTER TABLE public.product_images ALTER COLUMN product_id TYPE BIGINT USING (product_id::bigint);
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ============================================================================
-- 6. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_categories_updated_at ON public.categories;
CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 7. REUSABLE ROLE-BASED ADMIN CHECK FUNCTION
-- Evaluates whether the currently authenticated user has role = 'admin'
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE;

-- 8. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 9. SAFE IDEMPOTENT RLS POLICIES FOR PROFILES
-- ============================================================================
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

-- Users can read their own profile; admins can read all profiles
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- Users can update their own profile; admins can update all profiles
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- Only admins can delete profiles
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================================
-- 10. SAFE IDEMPOTENT RLS POLICIES FOR CATEGORIES
-- ============================================================================
DROP POLICY IF EXISTS "Allow public read active categories" ON public.categories;
DROP POLICY IF EXISTS "Allow admin full access categories" ON public.categories;
DROP POLICY IF EXISTS "Admin insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admin update categories" ON public.categories;
DROP POLICY IF EXISTS "Admin delete categories" ON public.categories;

-- Public users can only read active categories; Admins can read all
CREATE POLICY "Allow public read active categories"
  ON public.categories FOR SELECT
  USING (status = 'Active' OR public.is_admin());

-- Only real admins (public.is_admin() = true) can INSERT categories
CREATE POLICY "Admin insert categories"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Only real admins can UPDATE categories
CREATE POLICY "Admin update categories"
  ON public.categories FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only real admins can DELETE categories
CREATE POLICY "Admin delete categories"
  ON public.categories FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================================
-- 11. SAFE IDEMPOTENT RLS POLICIES FOR PRODUCTS
-- ============================================================================
DROP POLICY IF EXISTS "Allow public read active products" ON public.products;
DROP POLICY IF EXISTS "Admin insert products" ON public.products;
DROP POLICY IF EXISTS "Admin update products" ON public.products;
DROP POLICY IF EXISTS "Admin delete products" ON public.products;

-- Public users can ONLY view products where status = 'Active'; Admins see all
CREATE POLICY "Allow public read active products"
  ON public.products FOR SELECT
  USING (status = 'Active' OR public.is_admin());

-- Only real admins (public.is_admin() = true) can INSERT products
CREATE POLICY "Admin insert products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Only real admins can UPDATE products
CREATE POLICY "Admin update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only real admins can DELETE products
CREATE POLICY "Admin delete products"
  ON public.products FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================================
-- 12. SAFE IDEMPOTENT RLS POLICIES FOR PRODUCT_IMAGES
-- ============================================================================
DROP POLICY IF EXISTS "Allow public read active product images" ON public.product_images;
DROP POLICY IF EXISTS "Admin insert product images" ON public.product_images;
DROP POLICY IF EXISTS "Admin update product images" ON public.product_images;
DROP POLICY IF EXISTS "Admin delete product images" ON public.product_images;

-- Public users may SELECT images ONLY when the associated product is Active; Admins see all
CREATE POLICY "Allow public read active product images"
  ON public.product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_images.product_id
        AND products.status = 'Active'
    )
    OR public.is_admin()
  );

-- Only real admins (public.is_admin() = true) can INSERT product images
CREATE POLICY "Admin insert product images"
  ON public.product_images FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Only real admins can UPDATE product images
CREATE POLICY "Admin update product images"
  ON public.product_images FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only real admins can DELETE product images
CREATE POLICY "Admin delete product images"
  ON public.product_images FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================================
-- 13. SUPABASE STORAGE BUCKET & ADMIN-ONLY STORAGE POLICIES
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read storage product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload storage product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin update storage product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete storage product images" ON storage.objects;

-- Public can view files in the public product-images bucket
CREATE POLICY "Public read storage product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Only real admins (public.is_admin() = true) can upload to product-images
CREATE POLICY "Admin upload storage product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

-- Only real admins can update files in product-images
CREATE POLICY "Admin update storage product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

-- Only real admins can delete files in product-images
CREATE POLICY "Admin delete storage product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin());

-- ============================================================================
-- 14. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- All new user signups are assigned role = 'customer' by default.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Royra Customer'),
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 15. ADMIN PROMOTION COMMAND (RUN MANUALLY IN SUPABASE SQL EDITOR)
-- Replace 'YOUR_ADMIN_EMAIL' with your registered user email:
-- ============================================================================
-- UPDATE public.profiles
-- SET role = 'admin', updated_at = NOW()
-- WHERE email = 'YOUR_ADMIN_EMAIL';
      `.trim();
    }
  };

  // Auto-detect and forward recovery sessions if they land on storefront pages
  if (typeof window !== 'undefined') {
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    const isRecovery = hash.includes('type=recovery') || search.includes('type=recovery');
    const isAlreadyOnResetPage = window.location.pathname.includes('reset-password.html');

    if (isRecovery && !isAlreadyOnResetPage) {
      console.log('[Supabase Auth]: Detected password recovery token on storefront page. Redirecting to admin/reset-password.html...');
      const targetUrl = RoyraDB.getResetPasswordRedirectUrl() + hash + (hash ? '' : search);
      window.location.replace(targetUrl);
    }
  }

  // Export to global namespace
  window.RoyraDB = RoyraDB;

})(window);
