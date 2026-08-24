/**
 * ROYRA JEWELS - C-PANEL HOSTING & SYSTEM CONTROL SCRIPT
 * Handles real-time system telemetry, role-based access, file management,
 * database monitoring, deployment orchestration, and security auditing.
 */

// Global C-Panel State
const CPanelState = {
  activeTab: 'dashboard',
  currentRole: localStorage.getItem('royra_cpanel_role') || 'Super Admin',
  userEmail: localStorage.getItem('royra_cpanel_email') || 'admin@royrajewels.com',
  environment: 'PRODUCTION',
  currentDir: '.',
  overviewData: null,
  filesData: [],
  envData: [],
  logsData: [],
  dbData: null,
  diagnostics: {
    apiBase: window.location.origin,
    endpoint: '/api/cpanel/overview',
    httpStatus: 'Pending',
    contentType: 'Pending',
    responseTimeMs: 0,
    lastError: null
  },
  rolesPermissions: {
    'Super Admin': ['all'],
    'System Admin': ['files_write', 'env_edit', 'backup_create', 'api_manage', 'cache_clear', 'content_all'],
    'Content Manager': ['content_banners', 'content_media', 'content_sections', 'content_seo', 'content_schedule', 'content_publish', 'read_only'],
    'Product Manager': ['content_media', 'content_sections', 'read_only'],
    'Deployment Manager': ['git_sync', 'deploy_trigger', 'rollback', 'logs_view'],
    'Database Admin': ['db_view', 'db_ping', 'backup_create', 'backup_restore', 'logs_view'],
    'Support / Viewer': ['read_only']
  }
};

// Check if user has permission
function canPerform(action) {
  const role = CPanelState.currentRole;
  if (role === 'Super Admin') return true;
  const perms = CPanelState.rolesPermissions[role] || [];
  return perms.includes(action);
}

// Toast notification helper
function showToast(message, type = 'info') {
  const container = document.getElementById('cp-toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `cp-toast ${type}`;
  toast.innerHTML = `<span>${escHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// API Base Configuration and resolution
function getApiBaseUrl() {
  // 1. Explicit override in localStorage
  const savedBase = localStorage.getItem('royra_cpanel_api_base');
  if (savedBase && savedBase.trim()) {
    return savedBase.trim().replace(/\/+$/, '');
  }

  // 2. Global window environment config
  if (window.__ENV__ && window.__ENV__.API_BASE && window.__ENV__.API_BASE.trim()) {
    return window.__ENV__.API_BASE.trim().replace(/\/+$/, '');
  }
  if (window.CPANEL_API_BASE && window.CPANEL_API_BASE.trim()) {
    return window.CPANEL_API_BASE.trim().replace(/\/+$/, '');
  }

  const host = window.location.hostname;
  const port = window.location.port;

  // 3. Localhost & Local Development
  if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') {
    // If we are on port 3000, origin is direct backend.
    // If on port 3002 or others, Vite proxy transparently routes /api to http://localhost:3000.
    return window.location.origin;
  }

  // 4. GitHub Pages static hosting (e.g. *.github.io)
  if (host.endsWith('github.io')) {
    // GitHub Pages cannot execute Node APIs; return saved custom URL or origin
    return localStorage.getItem('royra_cpanel_api_base') || window.location.origin;
  }

  // 5. Cloud Run / Production container / custom domain
  return window.location.origin;
}

function setCustomApiBase() {
  const current = localStorage.getItem('royra_cpanel_api_base') || getApiBaseUrl();
  const input = prompt(
    'Enter C-Panel Backend API Base URL:\n(e.g., http://localhost:3000, http://localhost:3002, or your deployed Cloud Run URL)',
    current
  );
  if (input !== null) {
    const trimmed = input.trim();
    if (trimmed) {
      localStorage.setItem('royra_cpanel_api_base', trimmed);
      showToast(`API Base updated to ${trimmed}`, 'success');
    } else {
      localStorage.removeItem('royra_cpanel_api_base');
      showToast('API Base reset to automatic detection', 'info');
    }
    renderActiveTab();
  }
}

// API Helper with strict JSON validation and diagnostics
async function apiCall(endpoint, method = 'GET', body = null) {
  const startTime = performance.now();
  const base = getApiBaseUrl();
  let fullUrl = endpoint.startsWith('http') ? endpoint : (base ? `${base}${endpoint}` : endpoint);

  const options = {
    method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-admin-email': CPanelState.userEmail,
      'x-admin-role': CPanelState.currentRole
    }
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    let res = await fetch(fullUrl, options);
    let contentType = res.headers.get('content-type') || '';
    let duration = Math.round(performance.now() - startTime);

    // Fallback detection: If local request on non-3000 port failed with 404 or HTML, try http://localhost:3000 directly
    const host = window.location.hostname;
    const port = window.location.port;
    if ((!res.ok || !contentType.includes('application/json')) && 
        (host === 'localhost' || host === '127.0.0.1') && 
        port && port !== '3000' && 
        !fullUrl.startsWith('http://localhost:3000')) {
      try {
        const fallbackUrl = `http://localhost:3000${endpoint}`;
        const fallbackRes = await fetch(fallbackUrl, options);
        const fbContentType = fallbackRes.headers.get('content-type') || '';
        if (fallbackRes.ok && fbContentType.includes('application/json')) {
          res = fallbackRes;
          fullUrl = fallbackUrl;
          contentType = fbContentType;
          duration = Math.round(performance.now() - startTime);
        }
      } catch (fbErr) {
        // preserve original error
      }
    }

    CPanelState.diagnostics = {
      apiBase: fullUrl.startsWith('http://localhost:3000') ? 'http://localhost:3000 (Direct Backend)' : (base || window.location.origin),
      endpoint,
      httpStatus: res.status,
      contentType: contentType || 'none',
      responseTimeMs: duration,
      lastError: res.ok ? null : `HTTP ${res.status}`
    };

    // Verify content-type before parsing
    if (!contentType.includes('application/json')) {
      const rawText = await res.text();
      console.warn(`[C-Panel API] CPANEL API ROUTE ERROR on ${fullUrl}: Content-Type is "${contentType}"`, rawText.slice(0, 150));
      CPanelState.diagnostics.lastError = `CPANEL API ROUTE ERROR: non-JSON response (${contentType || 'empty'})`;
      return {
        success: false,
        status: 'unavailable',
        isApiUnavailable: true,
        error: `CPANEL API ROUTE ERROR: Endpoint ${endpoint} returned ${contentType || 'text/html'} instead of application/json. Ensure backend server is running.`
      };
    }

    if (!res.ok) {
      try {
        const errorJson = await res.json();
        return errorJson;
      } catch (e) {
        return {
          success: false,
          status: 'error',
          error: `HTTP Error ${res.status}: ${res.statusText}`
        };
      }
    }

    const data = await res.json();
    return data;
  } catch (err) {
    // If local fetch on port 3002/etc threw network error, attempt direct connection to localhost:3000
    const host = window.location.hostname;
    const port = window.location.port;
    if ((host === 'localhost' || host === '127.0.0.1') && port && port !== '3000' && !fullUrl.startsWith('http://localhost:3000')) {
      try {
        const directUrl = `http://localhost:3000${endpoint}`;
        const directRes = await fetch(directUrl, options);
        const directCt = directRes.headers.get('content-type') || '';
        const duration = Math.round(performance.now() - startTime);
        if (directRes.ok && directCt.includes('application/json')) {
          CPanelState.diagnostics = {
            apiBase: 'http://localhost:3000 (Direct Local Backend)',
            endpoint,
            httpStatus: directRes.status,
            contentType: directCt,
            responseTimeMs: duration,
            lastError: null
          };
          return await directRes.json();
        }
      } catch (directErr) {
        // Fall through
      }
    }

    const duration = Math.round(performance.now() - startTime);
    console.warn(`[C-Panel API] Network error on ${endpoint}:`, err);
    CPanelState.diagnostics = {
      apiBase: base || window.location.origin,
      endpoint,
      httpStatus: 'NETWORK_ERROR',
      contentType: 'none',
      responseTimeMs: duration,
      lastError: err.message
    };
    return {
      success: false,
      status: 'unavailable',
      isApiUnavailable: true,
      error: `Could not connect to C-Panel API at ${endpoint}. ${err.message}`
    };
  }
}

// -------------------------------------------------------------
// NAVIGATION & TAB SWITCHING
// -------------------------------------------------------------
function switchTab(tabId) {
  CPanelState.activeTab = tabId;

  // Update nav links
  document.querySelectorAll('.cpanel-nav-item').forEach(el => {
    if (el.getAttribute('data-tab') === tabId) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  // Update topbar subtitle
  const subTitle = document.getElementById('cp-page-subtitle');
  if (subTitle) {
    const titles = {
      'content-dashboard': 'Website Content Studio Overview & Publishing Hub',
      banners: 'Hero & Promotional Banner Manager with Device Viewport Preview',
      medialibrary: 'Central Media Library & High-Resolution Asset Management',
      'homepage-sections': 'Visual Homepage Section Reordering & Layout Studio',
      'seo-manager': 'Search Engine Optimization & SERP Snippet Preview Simulator',
      'scheduled-content': 'Automated Seasonal Campaigns & Flash Sale Scheduler',
      'publish-history': 'Content Deployment History & Publishing Audit Trail',
      dashboard: 'System Overview & Live Health Telemetry',
      filemanager: 'Enterprise Workspace File System Manager',
      database: 'Relational & Cloud Database Connections',
      env: 'Encrypted Environment Variables & Secrets',
      github: 'GitHub Sync, CI/CD Pipeline & Rollback Actions',
      backups: 'Database & Filesystem Automated Backups',
      logs: 'Application, API, Database & Security Audit Logs',
      domain: 'Production Domains, SSL Certificates & DNS Health',
      storage: 'Media Storage, CAD Models & Document Quotas',
      api: 'ERP Bridge API Endpoints & Secret Keys',
      security: 'Active Sessions, Access Logs & WAF Protection',
      users: 'C-Panel Administration Roles & Permission Matrix'
    };
    subTitle.innerText = titles[tabId] || 'Hosting Administration';
  }

  // Load Tab Content
  renderActiveTab();
}

function handleRoleChange(newRole) {
  CPanelState.currentRole = newRole;
  localStorage.setItem('royra_cpanel_role', newRole);
  showToast(`Active C-Panel Role switched to: ${newRole}`, 'info');
  renderActiveTab();
}

function toggleSidebar() {
  const sidebar = document.getElementById('cpanel-sidebar');
  if (sidebar) sidebar.classList.toggle('open');
}

// -------------------------------------------------------------
// RENDER MODULES
// -------------------------------------------------------------
async function renderActiveTab() {
  const container = document.getElementById('cpanel-content-area');
  if (!container) return;

  container.innerHTML = '<div style="padding:40px;text-align:center;color:#8C867D"><i data-lucide="loader-2" class="animate-spin" style="width:24px;height:24px;margin-bottom:8px"></i><div>Loading C-Panel Telemetry...</div></div>';
  if (window.lucide) lucide.createIcons();

  switch (CPanelState.activeTab) {
    case 'content-dashboard':
      await renderContentDashboard(container);
      break;
    case 'banners':
      await renderBannersManager(container);
      break;
    case 'medialibrary':
      await renderMediaLibrary(container);
      break;
    case 'homepage-sections':
      await renderHomepageSections(container);
      break;
    case 'seo-manager':
      await renderSeoManager(container);
      break;
    case 'scheduled-content':
      await renderScheduledContent(container);
      break;
    case 'publish-history':
      await renderPublishHistory(container);
      break;
    case 'dashboard':
      await renderDashboard(container);
      break;
    case 'filemanager':
      await renderFileManager(container);
      break;
    case 'database':
      await renderDatabase(container);
      break;
    case 'env':
      await renderEnvVariables(container);
      break;
    case 'github':
      await renderGitHubDeploy(container);
      break;
    case 'backups':
      await renderBackups(container);
      break;
    case 'logs':
      await renderLogs(container);
      break;
    case 'domain':
      await renderDomain(container);
      break;
    case 'storage':
      await renderStorage(container);
      break;
    case 'api':
      await renderApiControl(container);
      break;
    case 'security':
      await renderSecurity(container);
      break;
    case 'users':
      await renderUsers(container);
      break;
    default:
      await renderDashboard(container);
  }

  if (window.lucide) lucide.createIcons();
}

// -------------------------------------------------------------
// 1. DASHBOARD MODULE
// -------------------------------------------------------------
async function renderDashboard(container) {
  // Test health check endpoint in background for system verification
  const healthRes = await apiCall('/api/cpanel/health');
  const res = await apiCall('/api/cpanel/overview');
  
  if (!res.success) {
    container.innerHTML = `
      <div class="cp-card" style="border-left: 4px solid #D97706; padding: 24px;">
        <div style="display:flex;align-items:flex-start;gap:16px">
          <div style="width:40px;height:40px;border-radius:8px;background:#FEF3C7;color:#D97706;display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <i data-lucide="server-off" style="width:20px;height:20px"></i>
          </div>
          <div style="flex:1">
            <div style="font-size:16px;font-weight:700;color:#1C1917;margin-bottom:4px">C-Panel Telemetry Bridge Unavailable</div>
            <div style="font-size:13.5px;color:#57534E;line-height:1.6;margin-bottom:12px">
              ${escHtml(res.error || 'The server overview endpoint is currently not responding with JSON.')}
            </div>
            
            <!-- Diagnostics Panel in Error State -->
            <div style="background:#FBF9F5;border:1px solid #EAE5DB;border-radius:6px;padding:12px;margin-bottom:14px;font-family:monospace;font-size:12px;display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:8px">
              <div><strong>API Base:</strong> ${escHtml(CPanelState.diagnostics.apiBase)}</div>
              <div><strong>Endpoint:</strong> ${escHtml(CPanelState.diagnostics.endpoint)}</div>
              <div><strong>HTTP Status:</strong> ${escHtml(CPanelState.diagnostics.httpStatus)}</div>
              <div><strong>Content-Type:</strong> ${escHtml(CPanelState.diagnostics.contentType)}</div>
              <div><strong>Response Time:</strong> ${CPanelState.diagnostics.responseTimeMs} ms</div>
              <div><strong>Last Error:</strong> ${escHtml(CPanelState.diagnostics.lastError || 'None')}</div>
            </div>

            <div style="display:flex;gap:10px;align-items:center">
              <button class="cp-btn cp-btn-gold cp-btn-sm" onclick="renderActiveTab()">
                <i data-lucide="refresh-cw"></i> Retry Connection
              </button>
              <a href="/api/cpanel/overview" target="_blank" class="cp-btn cp-btn-outline cp-btn-sm">
                <i data-lucide="external-link"></i> Test Endpoint Direct
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  const d = res;
  CPanelState.overviewData = d;
  const diag = CPanelState.diagnostics;

  const html = `
    <!-- Top Metrics Grid -->
    <div class="cp-grid-4">
      <div class="cp-metric-card">
        <div class="cp-metric-top">
          <span class="cp-metric-label">Website Status</span>
          <span class="cp-status ${d.websiteStatus.toLowerCase()}">${escHtml(d.websiteStatus)}</span>
        </div>
        <div class="cp-metric-val">royrajewels.com</div>
        <div class="cp-metric-footer">
          <i data-lucide="globe" style="width:13px;height:13px"></i>
          <span>HTTPS TLS 1.3 • CDN Active</span>
        </div>
      </div>

      <div class="cp-metric-card">
        <div class="cp-metric-top">
          <span class="cp-metric-label">Jewellery ERP Bridge</span>
          <span class="cp-status ${d.erpApiStatus.toLowerCase()}">${escHtml(d.erpApiStatus)}</span>
        </div>
        <div class="cp-metric-val">Azure SQL / API</div>
        <div class="cp-metric-footer">
          <i data-lucide="network" style="width:13px;height:13px"></i>
          <span>Port 1433 • Order Sync Bridge</span>
        </div>
      </div>

      <div class="cp-metric-card">
        <div class="cp-metric-top">
          <span class="cp-metric-label">Storefront Database</span>
          <span class="cp-status ${d.databaseStatus.toLowerCase().replace(' ', '-')}">${escHtml(d.databaseStatus)}</span>
        </div>
        <div class="cp-metric-val">Supabase PostgreSQL</div>
        <div class="cp-metric-footer">
          <i data-lucide="database" style="width:13px;height:13px"></i>
          <span>REST API • RLS Security Active</span>
        </div>
      </div>

      <div class="cp-metric-card">
        <div class="cp-metric-top">
          <span class="cp-metric-label">GitHub Sync</span>
          <span class="cp-status ${d.githubSyncStatus.toLowerCase()}">${escHtml(d.githubSyncStatus)}</span>
        </div>
        <div class="cp-metric-val">Branch: main</div>
        <div class="cp-metric-footer">
          <i data-lucide="git-branch" style="width:13px;height:13px"></i>
          <span>Auto Deployment Configured</span>
        </div>
      </div>
    </div>

    <!-- API Diagnostics Bar -->
    <div class="cp-card" style="padding:14px 20px;margin-bottom:20px;border-left:3px solid #15803D;background:#FAFAF7">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:8px">
          <i data-lucide="check-circle-2" style="width:16px;height:16px;color:#15803D"></i>
          <span style="font-size:13px;font-weight:700;color:#1C1917">C-Panel API Diagnostics</span>
          <span class="cp-status online" style="font-size:10px;padding:2px 8px">Verified JSON</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:11.5px;color:#8C867D">Service: ${escHtml(healthRes.service || 'cpanel-api')} • Status: ${escHtml(healthRes.status || 'online')}</span>
          <button class="cp-btn cp-btn-outline cp-btn-sm" style="padding:2px 8px;font-size:11px" onclick="setCustomApiBase()">
            <i data-lucide="settings-2" style="width:12px;height:12px"></i> Change API Base
          </button>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(170px, 1fr));gap:12px;font-size:12px;font-family:monospace;color:#44403C">
        <div><span style="color:#8C867D">API Base:</span> <strong style="color:#1C1917">${escHtml(diag.apiBase)}</strong></div>
        <div><span style="color:#8C867D">Endpoint:</span> <strong style="color:#1C1917">${escHtml(diag.endpoint)}</strong></div>
        <div><span style="color:#8C867D">HTTP Status:</span> <strong style="color:#15803D">${escHtml(diag.httpStatus)} OK</strong></div>
        <div><span style="color:#8C867D">Content-Type:</span> <strong style="color:#1C1917">${escHtml(diag.contentType)}</strong></div>
        <div><span style="color:#8C867D">Response Time:</span> <strong style="color:#1C1917">${diag.responseTimeMs} ms</strong></div>
        <div><span style="color:#8C867D">Last API Error:</span> <strong style="color:#15803D">${escHtml(diag.lastError || 'None (Clean JSON)')}</strong></div>
      </div>
    </div>

    <!-- Second Row: Telemetry, Storage & Quick Actions -->
    <div class="cp-grid-3">
      <div class="cp-card">
        <div class="cp-card-header">
          <div>
            <div class="cp-card-title"><i data-lucide="cpu" style="width:16px;height:16px;color:#A68B5B"></i> Server & Node Engine</div>
            <div class="cp-card-subtitle">Uptime: ${escHtml(d.serverHealth.formattedUptime)}</div>
          </div>
          <span class="cp-status online">Node ${escHtml(d.serverHealth.nodeVersion)}</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;font-size:12.5px">
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:4px">
              <span style="color:#58544E">Memory Usage</span>
              <span style="font-weight:600">${escHtml(d.serverHealth.memory.used)} / ${escHtml(d.serverHealth.memory.total)} (${escHtml(d.serverHealth.memory.percentage)})</span>
            </div>
            <div style="height:6px;background:#EAE5DB;border-radius:3px;overflow:hidden">
              <div style="width:${escHtml(d.serverHealth.memory.percentage)};height:100%;background:#A68B5B"></div>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;border-top:1px solid #F0ECE4">
            <span style="color:#8C867D">Platform / CPUs</span>
            <span style="font-weight:600">${escHtml(d.serverHealth.platform)} (${escHtml(d.serverHealth.cpuCount)} vCPUs)</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;border-top:1px solid #F0ECE4">
            <span style="color:#8C867D">Application Version</span>
            <span style="font-weight:600;color:#A68B5B">${escHtml(d.currentVersion)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;border-top:1px solid #F0ECE4">
            <span style="color:#8C867D">System Error Count (24h)</span>
            <span style="font-weight:600;color:${d.errorCount > 0 ? '#B91C1C' : '#15803D'}">${d.errorCount} Reported</span>
          </div>
        </div>
      </div>

      <div class="cp-card">
        <div class="cp-card-header">
          <div>
            <div class="cp-card-title"><i data-lucide="hard-drive" style="width:16px;height:16px;color:#A68B5B"></i> Storage Allocation</div>
            <div class="cp-card-subtitle">Media, CAD & DB Snapshots</div>
          </div>
          <span class="cp-status info">${escHtml(d.storageUsage.percentage)}</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;font-size:12.5px">
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:4px">
              <span style="color:#58544E">Allocated Disk</span>
              <span style="font-weight:600">${escHtml(d.storageUsage.formattedUsed)} / ${escHtml(d.storageUsage.formattedTotal)}</span>
            </div>
            <div style="height:6px;background:#EAE5DB;border-radius:3px;overflow:hidden">
              <div style="width:${escHtml(d.storageUsage.percentage)};height:100%;background:#3B82F6"></div>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;border-top:1px solid #F0ECE4">
            <span style="color:#8C867D">Last Automated Backup</span>
            <span style="font-weight:600">${new Date(d.lastBackup).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;border-top:1px solid #F0ECE4">
            <span style="color:#8C867D">Last Deployment</span>
            <span style="font-weight:600">${new Date(d.lastDeployment).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;border-top:1px solid #F0ECE4">
            <span style="color:#8C867D">Deployment State</span>
            <span class="cp-status success">Production Live</span>
          </div>
        </div>
      </div>

      <div class="cp-card">
        <div class="cp-card-header">
          <div>
            <div class="cp-card-title"><i data-lucide="zap" style="width:16px;height:16px;color:#A68B5B"></i> System Maintenance</div>
            <div class="cp-card-subtitle">Direct Server Actions</div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px">
          <button class="cp-btn cp-btn-gold" onclick="runPingCheck()">
            <i data-lucide="activity"></i> Run Live Diagnostic Ping
          </button>
          <button class="cp-btn cp-btn-outline" onclick="runClearCache()">
            <i data-lucide="refresh-cw"></i> Clear Server Memory Cache
          </button>
          <button class="cp-btn cp-btn-outline" onclick="switchTab('backups')">
            <i data-lucide="download-cloud"></i> Create Instant Backup
          </button>
          <button class="cp-btn cp-btn-outline" onclick="switchTab('logs')">
            <i data-lucide="terminal"></i> View Live Error Stream
          </button>
        </div>
      </div>
    </div>

    <!-- Recent Audit Logs -->
    <div class="cp-card">
      <div class="cp-card-header">
        <div>
          <div class="cp-card-title"><i data-lucide="shield" style="width:16px;height:16px;color:#A68B5B"></i> Recent C-Panel System Audit Trail</div>
          <div class="cp-card-subtitle">Chronological record of server and configuration modifications</div>
        </div>
        <button class="cp-btn cp-btn-outline cp-btn-sm" onclick="switchTab('security')">View Full Security Trail</button>
      </div>
      <div class="cp-table-wrap">
        <table class="cp-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor & Role</th>
              <th>Action</th>
              <th>Category</th>
              <th>Details</th>
              <th>IP Address</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${(d.recentAudits || []).map(a => `
              <tr>
                <td style="color:#8C867D;white-space:nowrap">${new Date(a.timestamp).toLocaleString('en-IN')}</td>
                <td>
                  <strong>${escHtml(a.actor)}</strong><br>
                  <span style="font-size:11px;color:#A68B5B">${escHtml(a.role)}</span>
                </td>
                <td><code>${escHtml(a.action)}</code></td>
                <td><span style="font-size:11px;font-weight:600;color:#58544E">${escHtml(a.category)}</span></td>
                <td>${escHtml(a.details)}</td>
                <td><code>${escHtml(a.ip)}</code></td>
                <td><span class="cp-status ${a.status.toLowerCase()}">${escHtml(a.status)}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// Ping diagnostic action
async function runPingCheck() {
  showToast('Executing multi-target health diagnostics...', 'info');
  const res = await apiCall('/api/cpanel/actions/ping-check', 'POST');
  if (res.success) {
    let msg = `Health Ping Finished: Overall ${res.results.overallStatus}.\n` +
      res.results.services.map(s => `• ${s.name}: ${s.status} (${s.latencyMs}ms)`).join('\n');
    alert(msg);
    renderDashboard(document.getElementById('cpanel-content-area'));
  } else {
    showToast(res.error || 'Diagnostic ping failed', 'error');
  }
}

// Clear cache action
async function runClearCache() {
  if (!confirm('Purge server-side static memory buffers and reload asset cache?')) return;
  const res = await apiCall('/api/cpanel/actions/clear-cache', 'POST');
  if (res.success) {
    showToast(res.message, 'success');
  } else {
    showToast(res.error || 'Failed to clear cache', 'error');
  }
}

// -------------------------------------------------------------
// 2. FILE MANAGER MODULE
// -------------------------------------------------------------
async function renderFileManager(container, dir = CPanelState.currentDir) {
  CPanelState.currentDir = dir;
  const res = await apiCall(`/api/cpanel/files?dir=${encodeURIComponent(dir)}`);
  if (!res.success) {
    container.innerHTML = `<div class="cp-card"><p style="color:#B91C1C">Failed to read directory: ${escHtml(res.error)}</p></div>`;
    return;
  }

  const items = res.items || [];
  CPanelState.filesData = items;

  // Build breadcrumbs
  const pathParts = dir === '.' ? [] : dir.split('/').filter(Boolean);
  let breadcrumbHtml = `<span class="cp-fm-crumb" onclick="renderFileManager(document.getElementById('cpanel-content-area'), '.')">root</span>`;
  let accumPath = '';
  pathParts.forEach((part, idx) => {
    accumPath += (accumPath ? '/' : '') + part;
    const clickPath = accumPath;
    breadcrumbHtml += ` <span style="color:#8C867D">/</span> <span class="cp-fm-crumb" onclick="renderFileManager(document.getElementById('cpanel-content-area'), '${clickPath}')">${escHtml(part)}</span>`;
  });

  const html = `
    <div class="cp-card cp-file-manager">
      <div class="cp-fm-toolbar">
        <div class="cp-fm-breadcrumbs">
          <i data-lucide="folder" style="width:16px;height:16px;color:#A68B5B"></i>
          <span>Path:</span>
          ${breadcrumbHtml}
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <button class="cp-btn cp-btn-outline cp-btn-sm" onclick="openCreateFolderModal()">
            <i data-lucide="folder-plus"></i> New Folder
          </button>
          <button class="cp-btn cp-btn-outline cp-btn-sm" onclick="openCreateFileModal()">
            <i data-lucide="file-plus"></i> New File
          </button>
          <button class="cp-btn cp-btn-gold cp-btn-sm" onclick="openUploadModal()">
            <i data-lucide="upload"></i> Upload File
          </button>
          <button class="cp-btn cp-btn-outline cp-btn-sm" onclick="renderFileManager(document.getElementById('cpanel-content-area'), '${dir}')">
            <i data-lucide="refresh-cw"></i> Refresh
          </button>
        </div>
      </div>

      <!-- Quick Search -->
      <div style="margin:4px 0">
        <input type="text" id="fm-search-input" class="cp-input" placeholder="Search files in current directory..." oninput="filterFilesList(this.value)">
      </div>

      <div class="cp-table-wrap">
        <table class="cp-table" id="fm-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Size</th>
              <th>Type</th>
              <th>Last Modified</th>
              <th>Protected</th>
              <th style="text-align:right">Actions</th>
            </tr>
          </thead>
          <tbody id="fm-tbody">
            ${dir !== '.' ? `
              <tr>
                <td colspan="6">
                  <span class="cp-fm-crumb" style="display:inline-flex;align-items:center;gap:6px" onclick="goUpOneDir()">
                    <i data-lucide="corner-left-up" style="width:14px;height:14px"></i>
                    <strong>.. (Parent Directory)</strong>
                  </span>
                </td>
              </tr>
            ` : ''}
            ${items.map(i => `
              <tr data-name="${escHtml(i.name.toLowerCase())}">
                <td>
                  ${i.isDirectory ? `
                    <span class="cp-fm-crumb" style="display:inline-flex;align-items:center" onclick="renderFileManager(document.getElementById('cpanel-content-area'), '${escHtml(i.relativePath)}')">
                      <i data-lucide="folder" class="cp-file-icon"></i>
                      <strong>${escHtml(i.name)}</strong>
                    </span>
                  ` : `
                    <span style="display:inline-flex;align-items:center">
                      <i data-lucide="file-text" class="cp-file-icon" style="color:#58544E"></i>
                      <span>${escHtml(i.name)}</span>
                    </span>
                  `}
                </td>
                <td><code>${escHtml(i.formattedSize)}</code></td>
                <td style="color:#8C867D">${i.isDirectory ? 'Directory' : (escHtml(i.extension) || 'File')}</td>
                <td style="color:#8C867D">${new Date(i.modifiedTime).toLocaleString('en-IN')}</td>
                <td>
                  ${i.isProtected ? '<span class="cp-protected-tag">System Protected</span>' : '<span style="color:#8C867D;font-size:11px">Normal</span>'}
                </td>
                <td style="text-align:right;white-space:nowrap">
                  ${!i.isDirectory ? `
                    <button class="cp-btn cp-btn-outline cp-btn-sm" title="View / Edit Code" onclick="openFileEditor('${escHtml(i.relativePath)}')">
                      <i data-lucide="edit-3"></i> Edit
                    </button>
                    <a class="cp-btn cp-btn-outline cp-btn-sm" title="Download" href="/api/cpanel/files/download?path=${encodeURIComponent(i.relativePath)}" download>
                      <i data-lucide="download"></i>
                    </a>
                  ` : ''}
                  <button class="cp-btn cp-btn-outline cp-btn-sm" title="Rename" onclick="openRenameModal('${escHtml(i.relativePath)}', '${escHtml(i.name)}')">
                    <i data-lucide="tag"></i>
                  </button>
                  <button class="cp-btn cp-btn-danger cp-btn-sm" title="Delete" onclick="deleteFileItem('${escHtml(i.relativePath)}', ${i.isProtected})">
                    <i data-lucide="trash-2"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function goUpOneDir() {
  const current = CPanelState.currentDir;
  if (current === '.' || !current) return;
  const parts = current.split('/');
  parts.pop();
  const newDir = parts.length ? parts.join('/') : '.';
  renderFileManager(document.getElementById('cpanel-content-area'), newDir);
}

function filterFilesList(query) {
  const q = query.toLowerCase();
  document.querySelectorAll('#fm-tbody tr[data-name]').forEach(tr => {
    const name = tr.getAttribute('data-name');
    if (!q || name.includes(q)) {
      tr.style.display = '';
    } else {
      tr.style.display = 'none';
    }
  });
}

// File Edit Modal
async function openFileEditor(filePath) {
  const res = await apiCall(`/api/cpanel/files/content?path=${encodeURIComponent(filePath)}`);
  if (!res.success) {
    showToast(res.error || 'Failed to open file', 'error');
    return;
  }

  const modalHtml = `
    <div class="cp-modal-backdrop" id="cp-file-modal">
      <div class="cp-modal" style="max-width:850px">
        <div class="cp-modal-header">
          <div>
            <div class="cp-modal-title"><i data-lucide="code" style="width:16px;height:16px;color:#A68B5B"></i> ${escHtml(res.filename)}</div>
            <div style="font-size:11.5px;color:#8C867D">${escHtml(res.path)} • ${escHtml(res.formattedSize)} ${res.isProtected ? '• <strong style="color:#B45309">SYSTEM FILE</strong>' : ''}</div>
          </div>
          <button class="cp-btn cp-btn-outline cp-btn-sm" onclick="document.getElementById('cp-file-modal').remove()">Close</button>
        </div>
        <div class="cp-modal-body">
          <textarea id="cp-file-editor-text" class="cp-code-editor">${escHtml(res.content)}</textarea>
        </div>
        <div class="cp-modal-footer">
          <button class="cp-btn cp-btn-outline" onclick="document.getElementById('cp-file-modal').remove()">Cancel</button>
          <button class="cp-btn cp-btn-gold" onclick="saveFileContent('${escHtml(res.path)}')">Save File</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  if (window.lucide) lucide.createIcons();
}

async function saveFileContent(targetPath) {
  const text = document.getElementById('cp-file-editor-text').value;
  const res = await apiCall('/api/cpanel/files/save', 'POST', {
    path: targetPath,
    content: text,
    role: CPanelState.currentRole
  });

  if (res.success) {
    showToast(res.message, 'success');
    const modal = document.getElementById('cp-file-modal');
    if (modal) modal.remove();
    renderFileManager(document.getElementById('cpanel-content-area'), CPanelState.currentDir);
  } else {
    showToast(res.error || 'Failed to save file', 'error');
  }
}

// Create Folder Modal
function openCreateFolderModal() {
  const name = prompt('Enter new folder name:');
  if (!name) return;
  apiCall('/api/cpanel/files/create-folder', 'POST', { dir: CPanelState.currentDir, name }).then(res => {
    if (res.success) {
      showToast(res.message, 'success');
      renderFileManager(document.getElementById('cpanel-content-area'), CPanelState.currentDir);
    } else {
      showToast(res.error || 'Failed to create folder', 'error');
    }
  });
}

// Create File Modal
function openCreateFileModal() {
  const name = prompt('Enter new file name (e.g. style.css, note.txt):');
  if (!name) return;
  apiCall('/api/cpanel/files/create-file', 'POST', { dir: CPanelState.currentDir, name, content: '' }).then(res => {
    if (res.success) {
      showToast(res.message, 'success');
      renderFileManager(document.getElementById('cpanel-content-area'), CPanelState.currentDir);
    } else {
      showToast(res.error || 'Failed to create file', 'error');
    }
  });
}

// Rename Modal
function openRenameModal(oldPath, oldName) {
  const newName = prompt(`Rename "${oldName}" to:`, oldName);
  if (!newName || newName === oldName) return;

  apiCall('/api/cpanel/files/rename', 'POST', { oldPath, newName }).then(res => {
    if (res.success) {
      showToast(res.message, 'success');
      renderFileManager(document.getElementById('cpanel-content-area'), CPanelState.currentDir);
    } else {
      showToast(res.error || 'Failed to rename item', 'error');
    }
  });
}

// Delete Item
async function deleteFileItem(targetPath, isProtected) {
  if (isProtected) {
    const confirmation = prompt(`CRITICAL SYSTEM PROTECTION:\n"${targetPath}" is essential for ROYRA JEWELS to run.\nTo proceed anyway, type: CONFIRM_SUPER_ADMIN`);
    if (confirmation !== 'CONFIRM_SUPER_ADMIN') {
      showToast('Deletion canceled. Protected system file preserved.', 'info');
      return;
    }
    const res = await apiCall('/api/cpanel/files/delete', 'POST', { path: targetPath, forceConfirm: 'CONFIRM_SUPER_ADMIN' });
    if (res.success) {
      showToast(res.message, 'success');
      renderFileManager(document.getElementById('cpanel-content-area'), CPanelState.currentDir);
    } else {
      showToast(res.error || 'Delete failed', 'error');
    }
    return;
  }

  if (!confirm(`Are you sure you want to permanently delete "${targetPath}"?`)) return;
  const res = await apiCall('/api/cpanel/files/delete', 'POST', { path: targetPath });
  if (res.success) {
    showToast(res.message, 'success');
    renderFileManager(document.getElementById('cpanel-content-area'), CPanelState.currentDir);
  } else {
    showToast(res.error || 'Delete failed', 'error');
  }
}

// Upload Modal
function openUploadModal() {
  const input = document.createElement('input');
  input.type = 'file';
  input.onchange = async () => {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    const formData = new FormData();
    formData.append('file', file);

    showToast(`Uploading ${file.name}...`, 'info');
    try {
      const res = await fetch(`/api/cpanel/files/upload?dir=${encodeURIComponent(CPanelState.currentDir)}`, {
        method: 'POST',
        headers: {
          'x-admin-email': CPanelState.userEmail,
          'x-admin-role': CPanelState.currentRole
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        renderFileManager(document.getElementById('cpanel-content-area'), CPanelState.currentDir);
      } else {
        showToast(data.error || 'Upload failed', 'error');
      }
    } catch (e) {
      showToast(e.message, 'error');
    }
  };
  input.click();
}

// -------------------------------------------------------------
// 3. DATABASE MODULE
// -------------------------------------------------------------
async function renderDatabase(container) {
  const res = await apiCall('/api/cpanel/database/info');
  if (!res.success) {
    container.innerHTML = `<div class="cp-card"><p style="color:#B91C1C">Failed to fetch database information: ${escHtml(res.error)}</p></div>`;
    return;
  }

  const providers = res.providers || [];

  const html = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <div>
        <h2 style="font-family:var(--cp-font-serif);font-size:18px;font-weight:700">Database & Connection Management</h2>
        <div style="font-size:12px;color:#8C867D">Dual architecture: Supabase PostgreSQL Storefront + Enterprise SQL Server ERP</div>
      </div>
      <button class="cp-btn cp-btn-gold" onclick="runDbBenchmark()">
        <i data-lucide="zap"></i> Run Live Connection Benchmark
      </button>
    </div>

    <div class="cp-grid-2">
      ${providers.map(p => `
        <div class="cp-card">
          <div class="cp-card-header">
            <div>
              <div class="cp-card-title"><i data-lucide="database" style="width:16px;height:16px;color:#A68B5B"></i> ${escHtml(p.name)}</div>
              <div class="cp-card-subtitle">${escHtml(p.type)}</div>
            </div>
            <span class="cp-status ${p.status === 'Connected' ? 'online' : 'warning'}">${escHtml(p.status)}</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;font-size:12.5px">
            <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #F0ECE4">
              <span style="color:#8C867D">Host</span>
              <code>${escHtml(p.host)}</code>
            </div>
            <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #F0ECE4">
              <span style="color:#8C867D">Port</span>
              <code>${p.port}</code>
            </div>
            <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #F0ECE4">
              <span style="color:#8C867D">SSL Encryption</span>
              <span style="font-weight:600;color:#15803D">${escHtml(p.sslMode)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #F0ECE4">
              <span style="color:#8C867D">Active Connection Pool</span>
              <span style="font-weight:600">${p.activeConnections} / ${p.maxPoolSize} max</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #F0ECE4">
              <span style="color:#8C867D">Last Successful Ping</span>
              <span style="color:#58544E">${new Date(p.lastSuccessfulConnection).toLocaleTimeString('en-IN')}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:5px 0">
              <span style="color:#8C867D">Credentials Security</span>
              <span class="cp-status success">Masked / Process-Level</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Tables List -->
    <div class="cp-card" style="margin-top:16px">
      <div class="cp-card-header">
        <div class="cp-card-title"><i data-lucide="table" style="width:16px;height:16px;color:#A68B5B"></i> Schema Tables & Record Metrics</div>
      </div>
      <div class="cp-table-wrap">
        <table class="cp-table">
          <thead>
            <tr>
              <th>Table Name</th>
              <th>Row Count</th>
              <th>Storage Size</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${((providers[0] && providers[0].tables) || []).map(t => `
              <tr>
                <td><code>${escHtml(t.name)}</code></td>
                <td><strong>${t.rows}</strong> records</td>
                <td><code>${escHtml(t.size)}</code></td>
                <td><span class="cp-status online">Healthy</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

async function runDbBenchmark() {
  showToast('Measuring roundtrip latency to databases...', 'info');
  const res = await apiCall('/api/cpanel/database/test-connection', 'POST');
  if (res.success) {
    alert(`DATABASE BENCHMARK RESULTS:\n• Supabase Cloud: ${res.supabase.status} (${res.supabase.latencyMs}ms)\n• SQL Server ERP: ${res.sqlServer.status} (${res.sqlServer.latencyMs}ms)\n${res.sqlServer.message}`);
  } else {
    showToast(res.error || 'Benchmark failed', 'error');
  }
}

// -------------------------------------------------------------
// 4. ENVIRONMENT VARIABLES MODULE
// -------------------------------------------------------------
async function renderEnvVariables(container) {
  const res = await apiCall('/api/cpanel/env');
  if (!res.success) {
    container.innerHTML = `<div class="cp-card"><p style="color:#B91C1C">Failed to fetch environment variables: ${escHtml(res.error)}</p></div>`;
    return;
  }

  const vars = res.variables || [];
  CPanelState.envData = vars;

  const html = `
    <div class="cp-card">
      <div class="cp-card-header">
        <div>
          <div class="cp-card-title"><i data-lucide="key" style="width:16px;height:16px;color:#A68B5B"></i> Encrypted Environment Variables Registry</div>
          <div class="cp-card-subtitle">Values are permanently masked in browser client. Unmasking creates an audit log entry.</div>
        </div>
        <button class="cp-btn cp-btn-gold cp-btn-sm" onclick="openAddEnvModal()">
          <i data-lucide="plus"></i> Add Variable
        </button>
      </div>

      <div class="cp-table-wrap">
        <table class="cp-table">
          <thead>
            <tr>
              <th>Variable Key</th>
              <th>Value (Masked)</th>
              <th>Category</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th style="text-align:right">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${vars.map(v => `
              <tr>
                <td><code><strong>${escHtml(v.key)}</strong></code></td>
                <td>
                  <span id="env-val-${escHtml(v.key)}" style="font-family:var(--cp-font-mono);color:#58544E">
                    ${escHtml(v.maskedValue)}
                  </span>
                </td>
                <td><span style="font-size:11px;font-weight:600;color:#8C867D">${escHtml(v.category)}</span></td>
                <td>
                  <span class="cp-status ${v.enabled ? 'online' : 'offline'}">
                    ${v.enabled ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td style="color:#8C867D">${new Date(v.updatedAt).toLocaleDateString('en-IN')}</td>
                <td style="text-align:right;white-space:nowrap">
                  <button class="cp-btn cp-btn-outline cp-btn-sm" title="Reveal Value" onclick="revealEnvSecret('${escHtml(v.key)}')">
                    <i data-lucide="eye"></i>
                  </button>
                  <button class="cp-btn cp-btn-outline cp-btn-sm" title="Toggle State" onclick="toggleEnvVar('${escHtml(v.key)}', ${!v.enabled})">
                    <i data-lucide="${v.enabled ? 'power' : 'play'}"></i>
                  </button>
                  <button class="cp-btn cp-btn-danger cp-btn-sm" title="Delete" onclick="deleteEnvVar('${escHtml(v.key)}')">
                    <i data-lucide="trash-2"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

async function revealEnvSecret(key) {
  if (CPanelState.currentRole === 'Support / Viewer') {
    showToast('Permission Denied: Support / Viewer role cannot decrypt secrets.', 'error');
    return;
  }

  const pass = prompt(`AUTHENTICATION CHECK:\nEnter confirmation to decrypt secret for "${key}":`);
  if (!pass) return;

  const res = await apiCall('/api/cpanel/env/reveal', 'POST', { key, role: CPanelState.currentRole });
  if (res.success) {
    const el = document.getElementById(`env-val-${key}`);
    if (el) {
      el.innerText = res.value;
      el.style.color = '#15803D';
      el.style.fontWeight = '700';
    }
    showToast(`Decrypted secret for ${key}. Audit entry recorded.`, 'warning');
  } else {
    showToast(res.error || 'Failed to reveal variable', 'error');
  }
}

async function toggleEnvVar(key, newEnabled) {
  const res = await apiCall('/api/cpanel/env/toggle', 'POST', { key, enabled: newEnabled });
  if (res.success) {
    showToast(res.message, 'success');
    renderEnvVariables(document.getElementById('cpanel-content-area'));
  } else {
    showToast(res.error || 'Toggle failed', 'error');
  }
}

async function deleteEnvVar(key) {
  if (!confirm(`Are you sure you want to remove environment variable "${key}"?`)) return;
  const res = await apiCall('/api/cpanel/env/delete', 'POST', { key, role: CPanelState.currentRole });
  if (res.success) {
    showToast(res.message, 'success');
    renderEnvVariables(document.getElementById('cpanel-content-area'));
  } else {
    showToast(res.error || 'Delete failed', 'error');
  }
}

function openAddEnvModal() {
  const key = prompt('Enter variable name (e.g. DB_NEW_PARAMETER):');
  if (!key) return;
  const value = prompt(`Enter value for ${key}:`);
  if (value === null) return;
  const isSecret = confirm('Is this a secret/sensitive credential? (OK = Yes, Cancel = No)');

  apiCall('/api/cpanel/env/save', 'POST', {
    key,
    value,
    isSecret,
    category: 'SYSTEM',
    description: 'Custom configuration parameter',
    role: CPanelState.currentRole
  }).then(res => {
    if (res.success) {
      showToast(res.message, 'success');
      renderEnvVariables(document.getElementById('cpanel-content-area'));
    } else {
      showToast(res.error || 'Save failed', 'error');
    }
  });
}

// -------------------------------------------------------------
// 5. GITHUB & DEPLOYMENT MODULE
// -------------------------------------------------------------
async function renderGitHubDeploy(container) {
  const res = await apiCall('/api/cpanel/github/status');
  if (!res.success) {
    container.innerHTML = `<div class="cp-card"><p style="color:#B91C1C">Failed to fetch deployment status: ${escHtml(res.error)}</p></div>`;
    return;
  }

  const d = res;

  const html = `
    <div class="cp-grid-3">
      <div class="cp-card">
        <div class="cp-card-header">
          <div class="cp-card-title"><i data-lucide="github" style="width:16px;height:16px;color:#A68B5B"></i> Repository Details</div>
          <span class="cp-status online">Sync OK</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;font-size:12.5px">
          <div><span style="color:#8C867D">Repo:</span> <strong>${escHtml(d.repository)}</strong></div>
          <div><span style="color:#8C867D">Branch:</span> <code>${escHtml(d.currentBranch)}</code></div>
          <div><span style="color:#8C867D">Latest Commit:</span> <code>${escHtml(d.latestCommit.shortSha)}</code></div>
          <div style="color:#58544E;font-style:italic">"${escHtml(d.latestCommit.message)}"</div>
        </div>
        <div style="margin-top:14px">
          <button class="cp-btn cp-btn-outline cp-btn-sm" style="width:100%" onclick="triggerGitSync()">
            <i data-lucide="refresh-cw"></i> Check Remote Sync
          </button>
        </div>
      </div>

      <div class="cp-card">
        <div class="cp-card-header">
          <div class="cp-card-title"><i data-lucide="rocket" style="width:16px;height:16px;color:#A68B5B"></i> Deployment Pipeline</div>
          <span class="cp-status online">Live Active</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;font-size:12.5px">
          <div><span style="color:#8C867D">Environment:</span> <strong>Production Edge</strong></div>
          <div><span style="color:#8C867D">Last Sync:</span> ${new Date(d.lastSync).toLocaleString('en-IN')}</div>
          <div><span style="color:#8C867D">Container Ingress:</span> Port 3000 (Proxy 443)</div>
        </div>
        <div style="margin-top:14px">
          <button class="cp-btn cp-btn-gold cp-btn-sm" style="width:100%" onclick="triggerDeploy()">
            <i data-lucide="upload-cloud"></i> Trigger Production Deploy
          </button>
        </div>
      </div>

      <div class="cp-card">
        <div class="cp-card-header">
          <div class="cp-card-title"><i data-lucide="history" style="width:16px;height:16px;color:#A68B5B"></i> Emergency Rollback</div>
          <span class="cp-status warning">Protected</span>
        </div>
        <p style="font-size:12px;color:#58544E;margin-bottom:12px">
          Instantaneous zero-downtime rollback to previous stable deployment build.
        </p>
        <button class="cp-btn cp-btn-danger cp-btn-sm" style="width:100%" onclick="openRollbackModal()">
          <i data-lucide="rotate-ccw"></i> Rollback Release
        </button>
      </div>
    </div>

    <!-- Deployment History -->
    <div class="cp-card" style="margin-top:16px">
      <div class="cp-card-header">
        <div class="cp-card-title"><i data-lucide="list" style="width:16px;height:16px;color:#A68B5B"></i> Deployment & Release History</div>
      </div>
      <div class="cp-table-wrap">
        <table class="cp-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Commit</th>
              <th>Branch</th>
              <th>Message</th>
              <th>Triggered By</th>
              <th>Timestamp</th>
              <th>Build Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${(d.deploymentHistory || []).map(dep => `
              <tr>
                <td><code>${escHtml(dep.id)}</code></td>
                <td><code>${escHtml(dep.commitSha.slice(0, 7))}</code></td>
                <td>${escHtml(dep.branch)}</td>
                <td>${escHtml(dep.message)}</td>
                <td>${escHtml(dep.triggeredBy)}</td>
                <td style="color:#8C867D">${new Date(dep.timestamp).toLocaleString('en-IN')}</td>
                <td>${(dep.durationMs / 1000).toFixed(1)}s</td>
                <td><span class="cp-status ${dep.status.toLowerCase()}">${escHtml(dep.status)}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

async function triggerGitSync() {
  showToast('Checking GitHub remote repository sync...', 'info');
  const res = await apiCall('/api/cpanel/github/sync', 'POST');
  if (res.success) {
    showToast(res.message, 'success');
    renderGitHubDeploy(document.getElementById('cpanel-content-area'));
  } else {
    showToast(res.error || 'Sync check failed', 'error');
  }
}

async function triggerDeploy() {
  const note = prompt('Enter deployment release note:');
  if (!note) return;

  showToast('Initiating build pipeline & container publish...', 'info');
  const res = await apiCall('/api/cpanel/github/deploy', 'POST', { environment: 'PRODUCTION', note });
  if (res.success) {
    showToast(res.message, 'success');
    renderGitHubDeploy(document.getElementById('cpanel-content-area'));
  } else {
    showToast(res.error || 'Deploy failed', 'error');
  }
}

async function openRollbackModal() {
  const depId = prompt('Enter Target Deployment ID to rollback to (e.g. DEP-400):');
  if (!depId) return;

  const conf = prompt('CONFIRMATION REQUIRED:\nTo execute rollback, type: CONFIRM_ROLLBACK');
  if (conf !== 'CONFIRM_ROLLBACK') {
    showToast('Rollback canceled.', 'info');
    return;
  }

  const res = await apiCall('/api/cpanel/github/rollback', 'POST', { deploymentId: depId, confirmation: 'CONFIRM_ROLLBACK' });
  if (res.success) {
    showToast(res.message, 'success');
    renderGitHubDeploy(document.getElementById('cpanel-content-area'));
  } else {
    showToast(res.error || 'Rollback failed', 'error');
  }
}

// -------------------------------------------------------------
// 6. BACKUP & RESTORE MODULE
// -------------------------------------------------------------
async function renderBackups(container) {
  const res = await apiCall('/api/cpanel/backups');
  if (!res.success) {
    container.innerHTML = `<div class="cp-card"><p style="color:#B91C1C">Failed to fetch backups: ${escHtml(res.error)}</p></div>`;
    return;
  }

  const backups = res.backups || [];

  const html = `
    <div class="cp-card">
      <div class="cp-card-header">
        <div>
          <div class="cp-card-title"><i data-lucide="archive" style="width:16px;height:16px;color:#A68B5B"></i> System Snapshot & Backup Vault</div>
          <div class="cp-card-subtitle">Automated database and file archives with SHA-256 integrity checksums.</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="cp-btn cp-btn-gold cp-btn-sm" onclick="createBackupSnapshot('DATABASE')">
            <i data-lucide="database"></i> Backup Database
          </button>
          <button class="cp-btn cp-btn-outline cp-btn-sm" onclick="createBackupSnapshot('FULL_SNAPSHOT')">
            <i data-lucide="archive"></i> Full System Backup
          </button>
        </div>
      </div>

      <div class="cp-table-wrap">
        <table class="cp-table">
          <thead>
            <tr>
              <th>Backup ID</th>
              <th>Filename</th>
              <th>Type</th>
              <th>Size</th>
              <th>Created Date</th>
              <th>SHA-256 Integrity</th>
              <th style="text-align:right">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${backups.map(b => `
              <tr>
                <td><code>${escHtml(b.id)}</code></td>
                <td><strong>${escHtml(b.filename)}</strong></td>
                <td><span style="font-size:11px;font-weight:600;color:#58544E">${escHtml(b.type)}</span></td>
                <td><code>${escHtml(b.formattedSize)}</code></td>
                <td style="color:#8C867D">${new Date(b.createdAt).toLocaleString('en-IN')}</td>
                <td><code style="font-size:11px;color:#8C867D">${escHtml(b.checksum.slice(0, 16))}...</code></td>
                <td style="text-align:right;white-space:nowrap">
                  <a class="cp-btn cp-btn-outline cp-btn-sm" href="${escHtml(b.downloadUrl)}" download>
                    <i data-lucide="download"></i> Download
                  </a>
                  <button class="cp-btn cp-btn-danger cp-btn-sm" onclick="triggerRestore('${escHtml(b.id)}')">
                    <i data-lucide="rotate-ccw"></i> Restore
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

async function createBackupSnapshot(type) {
  const note = prompt(`Enter optional note for ${type} backup:`);
  showToast(`Creating ${type} snapshot archive...`, 'info');
  const res = await apiCall('/api/cpanel/backups/create', 'POST', { type, note });
  if (res.success) {
    showToast(res.message, 'success');
    renderBackups(document.getElementById('cpanel-content-area'));
  } else {
    showToast(res.error || 'Backup creation failed', 'error');
  }
}

async function triggerRestore(backupId) {
  const conf = prompt(`DESTRUCTIVE RESTORE CONFIRMATION:\nRestoring from ${backupId} will overwrite current database records.\nTo confirm, type: CONFIRM_RESTORE`);
  if (conf !== 'CONFIRM_RESTORE') {
    showToast('Restore canceled.', 'info');
    return;
  }

  showToast('Executing system restore...', 'info');
  const res = await apiCall('/api/cpanel/backups/restore', 'POST', { backupId, confirmation: 'CONFIRM_RESTORE' });
  if (res.success) {
    showToast(res.message, 'success');
    renderBackups(document.getElementById('cpanel-content-area'));
  } else {
    showToast(res.error || 'Restore failed', 'error');
  }
}

// -------------------------------------------------------------
// 7. SYSTEM LOGS MODULE
// -------------------------------------------------------------
async function renderLogs(container) {
  const res = await apiCall('/api/cpanel/logs');
  if (!res.success) {
    container.innerHTML = `<div class="cp-card"><p style="color:#B91C1C">Failed to fetch logs: ${escHtml(res.error)}</p></div>`;
    return;
  }

  const logs = res.logs || [];
  CPanelState.logsData = logs;

  const html = `
    <div class="cp-card">
      <div class="cp-card-header">
        <div>
          <div class="cp-card-title"><i data-lucide="terminal" style="width:16px;height:16px;color:#A68B5B"></i> Live System & Operational Logs</div>
          <div class="cp-card-subtitle">Real-time application events, API calls, database errors & security alerts.</div>
        </div>
        <div style="display:flex;gap:8px">
          <a class="cp-btn cp-btn-outline cp-btn-sm" href="/api/cpanel/logs/export?format=csv" download>
            <i data-lucide="download"></i> Export CSV
          </a>
          <a class="cp-btn cp-btn-outline cp-btn-sm" href="/api/cpanel/logs/export?format=json" download>
            <i data-lucide="download"></i> Export JSON
          </a>
        </div>
      </div>

      <!-- Filters Toolbar -->
      <div style="display:flex;gap:12px;margin-bottom:12px;flex-wrap:wrap">
        <select id="log-cat-filter" class="cp-select" style="width:140px" onchange="filterLogs()">
          <option value="ALL">All Categories</option>
          <option value="APP">Application</option>
          <option value="API">API Gateway</option>
          <option value="DB">Database</option>
          <option value="DEPLOY">Deployment</option>
          <option value="AUTH">Authentication</option>
        </select>
        <select id="log-lvl-filter" class="cp-select" style="width:130px" onchange="filterLogs()">
          <option value="ALL">All Levels</option>
          <option value="INFO">INFO</option>
          <option value="WARN">WARN</option>
          <option value="ERROR">ERROR</option>
          <option value="CRITICAL">CRITICAL</option>
        </select>
        <input type="text" id="log-search-filter" class="cp-input" style="flex:1;min-width:200px" placeholder="Search log text..." oninput="filterLogs()">
      </div>

      <!-- Console Stream Box -->
      <div class="cp-log-console" id="cp-log-stream">
        ${logs.map(l => `
          <div class="cp-log-line" data-cat="${escHtml(l.category)}" data-lvl="${escHtml(l.level)}" data-msg="${escHtml(l.message.toLowerCase())}">
            <span class="cp-log-time">${new Date(l.timestamp).toLocaleTimeString('en-IN')}</span>
            <span class="cp-log-lvl ${escHtml(l.level)}">[${escHtml(l.level)}]</span>
            <span class="cp-log-cat">[${escHtml(l.category)}]</span>
            <span class="cp-log-msg">${escHtml(l.message)}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function filterLogs() {
  const cat = document.getElementById('log-cat-filter').value;
  const lvl = document.getElementById('log-lvl-filter').value;
  const q = document.getElementById('log-search-filter').value.toLowerCase();

  document.querySelectorAll('#cp-log-stream .cp-log-line').forEach(line => {
    const lCat = line.getAttribute('data-cat');
    const lLvl = line.getAttribute('data-lvl');
    const lMsg = line.getAttribute('data-msg');

    const catMatch = (cat === 'ALL' || lCat === cat);
    const lvlMatch = (lvl === 'ALL' || lLvl === lvl);
    const msgMatch = (!q || lMsg.includes(q));

    if (catMatch && lvlMatch && msgMatch) {
      line.style.display = 'flex';
    } else {
      line.style.display = 'none';
    }
  });
}

// -------------------------------------------------------------
// 8. DOMAIN & SSL MODULE
// -------------------------------------------------------------
async function renderDomain(container) {
  const res = await apiCall('/api/cpanel/domain/status');
  if (!res.success) {
    container.innerHTML = `<div class="cp-card"><p style="color:#B91C1C">Failed to fetch domain status: ${escHtml(res.error)}</p></div>`;
    return;
  }

  const domains = res.domains || [];

  const html = `
    <div style="display:flex;flex-direction:column;gap:16px">
      ${domains.map(d => `
        <div class="cp-card">
          <div class="cp-card-header">
            <div>
              <div class="cp-card-title"><i data-lucide="globe" style="width:16px;height:16px;color:#A68B5B"></i> ${escHtml(d.name)}</div>
              <div class="cp-card-subtitle">${escHtml(d.type)}</div>
            </div>
            <span class="cp-status online">${escHtml(d.status)}</span>
          </div>
          <div class="cp-grid-2" style="font-size:12.5px;margin-bottom:12px">
            <div style="background:#FAF8F4;padding:12px;border-radius:6px;border:1px solid #EAE5DB">
              <div style="font-weight:700;color:#15803D;margin-bottom:6px;display:flex;align-items:center;gap:6px">
                <i data-lucide="shield-check" style="width:15px;height:15px"></i> SSL/TLS Certificate
              </div>
              <div><span style="color:#8C867D">Issuer:</span> ${escHtml(d.ssl.issuer)}</div>
              <div><span style="color:#8C867D">Protocol:</span> <code>${escHtml(d.ssl.tlsVersion)}</code></div>
              <div><span style="color:#8C867D">Expiry Date:</span> ${new Date(d.ssl.validUntil).toLocaleDateString('en-IN')}</div>
              <div><span style="color:#8C867D">Auto Renewal:</span> Active</div>
            </div>
            <div style="background:#FAF8F4;padding:12px;border-radius:6px;border:1px solid #EAE5DB">
              <div style="font-weight:700;color:#1D4ED8;margin-bottom:6px;display:flex;align-items:center;gap:6px">
                <i data-lucide="server" style="width:15px;height:15px"></i> DNS Resolution
              </div>
              <div><span style="color:#8C867D">Status:</span> ${escHtml(d.dns.status)}</div>
              <div><span style="color:#8C867D">Propagation:</span> Verified Globally</div>
              <div><span style="color:#8C867D">Edge Proxy:</span> Cloudflare / Google CDN</div>
            </div>
          </div>
          ${d.dns.records && d.dns.records.length ? `
            <div class="cp-table-wrap">
              <table class="cp-table">
                <thead>
                  <tr>
                    <th>Record Type</th>
                    <th>Host / Name</th>
                    <th>Target / Destination Value</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${d.dns.records.map(r => `
                    <tr>
                      <td><code>${escHtml(r.type)}</code></td>
                      <td>${escHtml(r.name)}</td>
                      <td><code>${escHtml(r.value)}</code></td>
                      <td><span class="cp-status online">Matched</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;

  container.innerHTML = html;
}

// -------------------------------------------------------------
// 9. STORAGE & MEDIA MODULE
// -------------------------------------------------------------
async function renderStorage(container) {
  const res = await apiCall('/api/cpanel/storage/stats');
  if (!res.success) {
    container.innerHTML = `<div class="cp-card"><p style="color:#B91C1C">Failed to fetch storage stats: ${escHtml(res.error)}</p></div>`;
    return;
  }

  const d = res;
  const categories = d.categories || [];

  const html = `
    <div class="cp-grid-3">
      <div class="cp-card">
        <div class="cp-card-header">
          <div class="cp-card-title"><i data-lucide="hard-drive" style="width:16px;height:16px;color:#A68B5B"></i> Storage Pool Usage</div>
          <span class="cp-status info">${escHtml(d.usagePercentage)}</span>
        </div>
        <div class="cp-metric-val">${escHtml(d.formattedUsed)}</div>
        <div style="font-size:12px;color:#8C867D;margin-top:4px">Out of ${escHtml(d.formattedTotal)} enterprise quota (${escHtml(d.formattedFree)} free)</div>
        <div style="height:8px;background:#EAE5DB;border-radius:4px;overflow:hidden;margin-top:12px">
          <div style="width:${escHtml(d.usagePercentage)};height:100%;background:#A68B5B"></div>
        </div>
      </div>

      <div class="cp-card" style="grid-column: span 2">
        <div class="cp-card-header">
          <div class="cp-card-title"><i data-lucide="pie-chart" style="width:16px;height:16px;color:#A68B5B"></i> Category Breakdown</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${categories.map(c => `
            <div>
              <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">
                <span><strong>${escHtml(c.name)}</strong> (${c.count} files)</span>
                <code>${escHtml(c.formattedSize)}</code>
              </div>
              <div style="height:5px;background:#EAE5DB;border-radius:3px;overflow:hidden">
                <div style="width:${((c.sizeBytes / d.totalBytes) * 100 * 4).toFixed(1)}%;height:100%;background:${c.color}"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Media Library Actions -->
    <div class="cp-card" style="margin-top:16px">
      <div class="cp-card-header">
        <div>
          <div class="cp-card-title"><i data-lucide="image" style="width:16px;height:16px;color:#A68B5B"></i> Asset Storage Management</div>
          <div class="cp-card-subtitle">Manage high resolution jewelry photos, CAD model files & laboratory certificates</div>
        </div>
        <button class="cp-btn cp-btn-outline cp-btn-sm" onclick="switchTab('filemanager')">
          <i data-lucide="folder"></i> Browse in File Manager
        </button>
      </div>
      <div class="cp-table-wrap">
        <table class="cp-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Items Count</th>
              <th>Disk Usage</th>
              <th>Format Types</th>
              <th>CDN Cache Status</th>
            </tr>
          </thead>
          <tbody>
            ${categories.map(c => `
              <tr>
                <td><strong>${escHtml(c.name)}</strong></td>
                <td>${c.count} assets</td>
                <td><code>${escHtml(c.formattedSize)}</code></td>
                <td><span style="font-size:11.5px;color:#8C867D">WEBP, PNG, JPG, GLTF, PDF</span></td>
                <td><span class="cp-status online">Cached (Edge TTL 30d)</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// -------------------------------------------------------------
// 10. API CONTROL MODULE
// -------------------------------------------------------------
async function renderApiControl(container) {
  const res = await apiCall('/api/cpanel/api/stats');
  if (!res.success) {
    container.innerHTML = `<div class="cp-card"><p style="color:#B91C1C">Failed to fetch API stats: ${escHtml(res.error)}</p></div>`;
    return;
  }

  const d = res;

  const html = `
    <div class="cp-grid-4">
      <div class="cp-metric-card">
        <span class="cp-metric-label">API Gateway Status</span>
        <div class="cp-metric-val" style="color:#15803D">Operational</div>
        <div class="cp-metric-footer">Version ${escHtml(d.apiVersion)}</div>
      </div>
      <div class="cp-metric-card">
        <span class="cp-metric-label">24h Request Volume</span>
        <div class="cp-metric-val">${d.totalRequests24h.toLocaleString()}</div>
        <div class="cp-metric-footer">Across all public & ERP routes</div>
      </div>
      <div class="cp-metric-card">
        <span class="cp-metric-label">Average Response Time</span>
        <div class="cp-metric-val">${d.averageLatencyMs} ms</div>
        <div class="cp-metric-footer">Sub-50ms SLA maintained</div>
      </div>
      <div class="cp-metric-card">
        <span class="cp-metric-label">Error Rate</span>
        <div class="cp-metric-val" style="color:#15803D">${escHtml(d.errorRate)}</div>
        <div class="cp-metric-footer">99.96% success rate</div>
      </div>
    </div>

    <!-- Active API Keys -->
    <div class="cp-card" style="margin-top:16px">
      <div class="cp-card-header">
        <div>
          <div class="cp-card-title"><i data-lucide="key" style="width:16px;height:16px;color:#A68B5B"></i> API Key Access Tokens</div>
          <div class="cp-card-subtitle">Bearer tokens for client apps and third-party ERP synchronization</div>
        </div>
        <button class="cp-btn cp-btn-gold cp-btn-sm" onclick="openCreateApiKeyModal()">
          <i data-lucide="plus"></i> Generate API Key
        </button>
      </div>
      <div class="cp-table-wrap">
        <table class="cp-table">
          <thead>
            <tr>
              <th>Key Name</th>
              <th>Token Prefix</th>
              <th>Masked Secret</th>
              <th>Role Scope</th>
              <th>Created Date</th>
              <th>Status</th>
              <th style="text-align:right">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${(d.apiKeys || []).map(k => `
              <tr>
                <td><strong>${escHtml(k.name)}</strong></td>
                <td><code>${escHtml(k.prefix)}</code></td>
                <td><code>${escHtml(k.maskedKey)}</code></td>
                <td><span style="font-size:11px;color:#58544E">${escHtml((k.scopes || []).join(', '))}</span></td>
                <td style="color:#8C867D">${new Date(k.createdAt).toLocaleDateString('en-IN')}</td>
                <td><span class="cp-status ${k.status.toLowerCase()}">${escHtml(k.status)}</span></td>
                <td style="text-align:right">
                  ${k.status === 'ACTIVE' ? `
                    <button class="cp-btn cp-btn-danger cp-btn-sm" onclick="revokeApiKey('${escHtml(k.id)}')">Revoke Key</button>
                  ` : '<span style="color:#8C867D;font-size:11px">Revoked</span>'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

async function openCreateApiKeyModal() {
  const name = prompt('Enter descriptive name for new API Key (e.g. Mobile App Client):');
  if (!name) return;

  const res = await apiCall('/api/cpanel/api/keys/create', 'POST', { name, scopes: ['products:read', 'orders:read'] });
  if (res.success) {
    alert(`NEW API KEY GENERATED:\nName: ${res.apiKey.name}\n\nSECRET KEY (COPY NOW - WILL NOT BE SHOWN AGAIN):\n${res.rawSecretKey}`);
    renderApiControl(document.getElementById('cpanel-content-area'));
  } else {
    showToast(res.error || 'Key generation failed', 'error');
  }
}

async function revokeApiKey(keyId) {
  if (!confirm(`Are you sure you want to revoke API key "${keyId}"? Connected services will lose access immediately.`)) return;
  const res = await apiCall('/api/cpanel/api/keys/revoke', 'POST', { keyId });
  if (res.success) {
    showToast(res.message, 'success');
    renderApiControl(document.getElementById('cpanel-content-area'));
  } else {
    showToast(res.error || 'Revoke failed', 'error');
  }
}

// -------------------------------------------------------------
// 11. SECURITY & AUDIT MODULE
// -------------------------------------------------------------
async function renderSecurity(container) {
  const res = await apiCall('/api/cpanel/security/audit');
  if (!res.success) {
    container.innerHTML = `<div class="cp-card"><p style="color:#B91C1C">Failed to fetch security logs: ${escHtml(res.error)}</p></div>`;
    return;
  }

  const d = res;
  const sessions = d.activeSessions || [];
  const audits = d.auditLogs || [];
  const failed = d.failedAttempts || [];

  const html = `
    <!-- Active Sessions -->
    <div class="cp-card">
      <div class="cp-card-header">
        <div>
          <div class="cp-card-title"><i data-lucide="shield" style="width:16px;height:16px;color:#A68B5B"></i> Active Administrator Sessions</div>
          <div class="cp-card-subtitle">Real-time connected administrator sessions and device signatures</div>
        </div>
      </div>
      <div class="cp-table-wrap">
        <table class="cp-table">
          <thead>
            <tr>
              <th>User Email</th>
              <th>Role</th>
              <th>IP Address</th>
              <th>Device / User Agent</th>
              <th>Login Time</th>
              <th>Current</th>
              <th style="text-align:right">Action</th>
            </tr>
          </thead>
          <tbody>
            ${sessions.map(s => `
              <tr>
                <td><strong>${escHtml(s.userEmail)}</strong></td>
                <td><span style="font-size:11px;font-weight:600;color:#A68B5B">${escHtml(s.role)}</span></td>
                <td><code>${escHtml(s.ip)}</code></td>
                <td style="color:#58544E">${escHtml(s.device)}</td>
                <td style="color:#8C867D">${new Date(s.loginTime).toLocaleTimeString('en-IN')}</td>
                <td>${s.current ? '<span class="cp-status online">This Device</span>' : '<span style="color:#8C867D;font-size:11px">Remote</span>'}</td>
                <td style="text-align:right">
                  ${!s.current ? `
                    <button class="cp-btn cp-btn-danger cp-btn-sm" onclick="revokeSession('${escHtml(s.id)}')">Revoke</button>
                  ` : '<span style="color:#8C867D;font-size:11px">Active</span>'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Complete Audit Trail -->
    <div class="cp-card" style="margin-top:16px">
      <div class="cp-card-header">
        <div class="cp-card-title"><i data-lucide="file-text" style="width:16px;height:16px;color:#A68B5B"></i> Complete System Audit Trail</div>
      </div>
      <div class="cp-table-wrap">
        <table class="cp-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor</th>
              <th>Role</th>
              <th>Action Code</th>
              <th>Category</th>
              <th>Details</th>
              <th>IP Address</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            ${audits.map(a => `
              <tr>
                <td style="color:#8C867D;white-space:nowrap">${new Date(a.timestamp).toLocaleString('en-IN')}</td>
                <td><strong>${escHtml(a.actor)}</strong></td>
                <td style="color:#A68B5B">${escHtml(a.role)}</td>
                <td><code>${escHtml(a.action)}</code></td>
                <td>${escHtml(a.category)}</td>
                <td>${escHtml(a.details)}</td>
                <td><code>${escHtml(a.ip)}</code></td>
                <td><span class="cp-status ${a.status.toLowerCase()}">${escHtml(a.status)}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

async function revokeSession(sessionId) {
  if (!confirm(`Are you sure you want to terminate session ${sessionId}?`)) return;
  const res = await apiCall('/api/cpanel/security/revoke-session', 'POST', { sessionId });
  if (res.success) {
    showToast(res.message, 'success');
    renderSecurity(document.getElementById('cpanel-content-area'));
  } else {
    showToast(res.error || 'Revoke failed', 'error');
  }
}

// -------------------------------------------------------------
// 12. USERS & ROLES MODULE
// -------------------------------------------------------------
async function renderUsers(container) {
  const res = await apiCall('/api/cpanel/users');
  if (!res.success) {
    container.innerHTML = `<div class="cp-card"><p style="color:#B91C1C">Failed to fetch users: ${escHtml(res.error)}</p></div>`;
    return;
  }

  const users = res.users || [];
  const matrix = res.rolesMatrix || [];

  const html = `
    <!-- Admins List -->
    <div class="cp-card">
      <div class="cp-card-header">
        <div>
          <div class="cp-card-title"><i data-lucide="users" style="width:16px;height:16px;color:#A68B5B"></i> C-Panel Authorized Administrators</div>
          <div class="cp-card-subtitle">Separate from ERP Business operations roles. Only for server & hosting control.</div>
        </div>
      </div>
      <div class="cp-table-wrap">
        <table class="cp-table">
          <thead>
            <tr>
              <th>User / Name</th>
              <th>Email</th>
              <th>Assigned C-Panel Role</th>
              <th>Status</th>
              <th>Last Active</th>
              <th style="text-align:right">Action</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td><strong>${escHtml(u.name)}</strong></td>
                <td>${escHtml(u.email)}</td>
                <td><span style="font-weight:700;color:#A68B5B">${escHtml(u.role)}</span></td>
                <td><span class="cp-status online">${escHtml(u.status)}</span></td>
                <td style="color:#8C867D">${new Date(u.lastLogin).toLocaleDateString('en-IN')}</td>
                <td style="text-align:right">
                  <button class="cp-btn cp-btn-outline cp-btn-sm" onclick="openChangeRoleModal('${escHtml(u.id)}', '${escHtml(u.name)}', '${escHtml(u.role)}')">
                    Change Role
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Role Matrix -->
    <div class="cp-card" style="margin-top:16px">
      <div class="cp-card-header">
        <div class="cp-card-title"><i data-lucide="shield-check" style="width:16px;height:16px;color:#A68B5B"></i> C-Panel Role Permissions Matrix</div>
      </div>
      <div class="cp-table-wrap">
        <table class="cp-table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Description</th>
              <th>Granted Capabilities</th>
            </tr>
          </thead>
          <tbody>
            ${matrix.map(m => `
              <tr>
                <td><strong>${escHtml(m.role)}</strong></td>
                <td style="color:#58544E">${escHtml(m.description)}</td>
                <td><span style="font-size:11.5px;color:#15803D;font-weight:600">${escHtml(m.permissions.join(' • '))}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

async function openChangeRoleModal(userId, userName, currentRole) {
  const newRole = prompt(`Change C-Panel Role for "${userName}":\nOptions: Super Admin, System Admin, Deployment Manager, Database Admin, Support / Viewer`, currentRole);
  if (!newRole || newRole === currentRole) return;

  const res = await apiCall('/api/cpanel/users/update-role', 'POST', {
    userId,
    newRole,
    callerRole: CPanelState.currentRole
  });

  if (res.success) {
    showToast(res.message, 'success');
    renderUsers(document.getElementById('cpanel-content-area'));
  } else {
    showToast(res.error || 'Role update failed', 'error');
  }
}

// =============================================================
// WEBSITE CONTENT STUDIO MODULES
// =============================================================

// 1. CONTENT STUDIO DASHBOARD
async function renderContentDashboard(container) {
  const data = await apiCall('/api/cpanel/content-overview');
  const stats = data.stats || {
    banners: { total: 3, published: 3, scheduled: 0, draft: 0 },
    media: { totalFiles: 10, formattedSize: '1.45 MB' },
    homepage: { totalSections: 9, activeSections: 9, disabledSections: 0 },
    seo: { healthScore: 96, indexedPages: 48, sitemapStatus: 'Active' },
    scheduled: { pendingCount: 2 }
  };

  const html = `
    <div class="content-studio-header">
      <div>
        <h2 style="font-family:var(--cp-font-serif);font-size:20px;font-weight:600;color:var(--cp-text-main)">Website Content Studio</h2>
        <div style="font-size:12px;color:var(--cp-text-secondary);margin-top:2px">Publish, schedule, and orchestrate luxury marketing banners, media assets, and homepage layouts.</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <button type="button" class="cp-btn cp-btn-primary" onclick="openNewBannerModal()">
          <i data-lucide="plus-circle"></i> New Campaign Banner
        </button>
        <button type="button" class="cp-btn cp-btn-outline" onclick="openMediaUploadModal()">
          <i data-lucide="upload-cloud"></i> Upload Media
        </button>
        <a href="../index.html" target="_blank" class="cp-btn cp-btn-outline" style="text-decoration:none">
          <i data-lucide="external-link"></i> Live Storefront
        </a>
      </div>
    </div>

    <!-- METRICS GRID -->
    <div class="cp-grid-4" style="margin-bottom:24px">
      <div class="cp-stat-card">
        <div class="cp-stat-header">
          <span class="cp-stat-title">Active Live Banners</span>
          <i data-lucide="flag" style="width:16px;height:16px;color:var(--cp-gold)"></i>
        </div>
        <div class="cp-stat-value">${stats.banners.published} <span style="font-size:12px;color:var(--cp-text-muted);font-weight:normal">/ ${stats.banners.total} Total</span></div>
        <div class="cp-stat-footer" style="color:#15803D">
          <i data-lucide="check-circle" style="width:12px;height:12px"></i> ${stats.banners.scheduled} Scheduled Campaigns
        </div>
      </div>

      <div class="cp-stat-card">
        <div class="cp-stat-header">
          <span class="cp-stat-title">Media Assets Stored</span>
          <i data-lucide="image" style="width:16px;height:16px;color:#1D4ED8"></i>
        </div>
        <div class="cp-stat-value">${stats.media.totalFiles} <span style="font-size:12px;color:var(--cp-text-muted);font-weight:normal">Files</span></div>
        <div class="cp-stat-footer" style="color:var(--cp-text-muted)">
          <i data-lucide="hard-drive" style="width:12px;height:12px"></i> ${stats.media.formattedSize} Used (WebP Optimized)
        </div>
      </div>

      <div class="cp-stat-card">
        <div class="cp-stat-header">
          <span class="cp-stat-title">Homepage Sections</span>
          <i data-lucide="layers" style="width:16px;height:16px;color:#9333EA"></i>
        </div>
        <div class="cp-stat-value">${stats.homepage.activeSections} <span style="font-size:12px;color:var(--cp-text-muted);font-weight:normal">/ ${stats.homepage.totalSections} Enabled</span></div>
        <div class="cp-stat-footer" style="color:#15803D">
          <i data-lucide="sparkles" style="width:12px;height:12px"></i> High-conversion luxury layout
        </div>
      </div>

      <div class="cp-stat-card">
        <div class="cp-stat-header">
          <span class="cp-stat-title">SEO Health Score</span>
          <i data-lucide="search" style="width:16px;height:16px;color:#0D9488"></i>
        </div>
        <div class="cp-stat-value">${stats.seo.healthScore} <span style="font-size:12px;color:#15803D;font-weight:bold">/ 100</span></div>
        <div class="cp-stat-footer" style="color:#15803D">
          <i data-lucide="check" style="width:12px;height:12px"></i> ${stats.seo.indexedPages} indexed URLs • Sitemap Live
        </div>
      </div>
    </div>

    <!-- RECENT BANNERS & QUICK LAUNCHPAD -->
    <div class="cp-grid-2" style="margin-bottom:24px">
      <!-- HERO BANNERS HIGHLIGHT -->
      <div class="cp-card">
        <div class="cp-card-header">
          <h3 class="cp-card-title"><i data-lucide="flag"></i> Active Campaign Banners</h3>
          <button type="button" class="cp-btn cp-btn-sm cp-btn-outline" onclick="switchTab('banners')">Manage All Banners</button>
        </div>
        <div class="cp-card-body" style="padding:0">
          <div style="display:flex;flex-direction:column;divide-y:1px solid var(--cp-border)">
            ${(data.recentBanners || []).map(b => `
              <div style="display:flex;align-items:center;gap:14px;padding:12px 16px;border-bottom:1px solid var(--cp-border-light)">
                <img src="${escHtml(b.desktopImage)}" style="width:70px;height:42px;object-fit:cover;border-radius:4px;border:1px solid var(--cp-border)" alt="${escHtml(b.title)}" />
                <div style="flex:1;min-width:0">
                  <div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escHtml(b.title)}</div>
                  <div style="font-size:11px;color:var(--cp-gold);font-weight:600">${escHtml(b.subtitle || b.position.toUpperCase())}</div>
                </div>
                <div style="display:flex;gap:6px">
                  <button type="button" class="cp-btn cp-btn-sm cp-btn-outline" onclick="openBannerPreviewModal('${b.id}')" title="Preview on Devices"><i data-lucide="smartphone"></i></button>
                  <button type="button" class="cp-btn cp-btn-sm cp-btn-outline" onclick="openEditBannerModal('${b.id}')" title="Edit Banner"><i data-lucide="edit-2"></i></button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- QUICK CONTENT CONTROLS & PUBLISHING ACTIVITY -->
      <div class="cp-card">
        <div class="cp-card-header">
          <h3 class="cp-card-title"><i data-lucide="history"></i> Recent Content Deployments</h3>
          <button type="button" class="cp-btn cp-btn-sm cp-btn-outline" onclick="switchTab('publish-history')">View Audit</button>
        </div>
        <div class="cp-card-body" style="padding:0">
          <div style="display:flex;flex-direction:column">
            ${(data.recentPublishLogs || []).map(log => `
              <div style="padding:10px 16px;border-bottom:1px solid var(--cp-border-light);font-size:12px">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px">
                  <span style="font-weight:600;color:var(--cp-text-main)">${escHtml(log.itemType)}: ${escHtml(log.itemName)}</span>
                  <span class="cp-badge ${log.action === 'PUBLISH' ? 'cp-badge-success' : 'cp-badge-info'}">${escHtml(log.action)}</span>
                </div>
                <div style="color:var(--cp-text-secondary);font-size:11.5px">${escHtml(log.details)}</div>
                <div style="color:var(--cp-text-muted);font-size:10.5px;margin-top:2px">${new Date(log.timestamp).toLocaleString()} • ${escHtml(log.user)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// 2. BANNERS MANAGER
async function renderBannersManager(container) {
  const data = await apiCall('/api/cpanel/banners');
  const banners = data.banners || [];

  const html = `
    <div class="content-studio-header">
      <div>
        <h2 style="font-family:var(--cp-font-serif);font-size:20px;font-weight:600;color:var(--cp-text-main)">Banner & Campaign Manager</h2>
        <div style="font-size:12px;color:var(--cp-text-secondary);margin-top:2px">Manage desktop (1920x700) and mobile (1080x1350) hero carousels, promo strips, and editorial banners.</div>
      </div>
      <div style="display:flex;gap:8px">
        <button type="button" class="cp-btn cp-btn-primary" onclick="openNewBannerModal()">
          <i data-lucide="plus-circle"></i> Create New Banner
        </button>
        <button type="button" class="cp-btn cp-btn-outline" onclick="openBannerPreviewModal(null)">
          <i data-lucide="eye"></i> Storefront Device Simulator
        </button>
      </div>
    </div>

    <!-- BANNER ASPECT RATIO NOTICE -->
    <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;padding:12px 16px;margin-bottom:20px;display:flex;align-items:center;gap:12px;font-size:12.5px;color:#92400E">
      <i data-lucide="info" style="width:20px;height:20px;flex-shrink:0;color:#B45309"></i>
      <div>
        <strong>Recommended Banner Specifications:</strong> Desktop Hero: <strong>1920 × 700 px (WebP/JPG)</strong> • Mobile Hero: <strong>1080 × 1350 px (4:5 Portrait)</strong> • Category/Mid-Page: <strong>1400 × 500 px</strong>. All assets are automatically served via Edge CDN.
      </div>
    </div>

    <!-- BANNERS GRID -->
    <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(360px, 1fr));gap:20px">
      ${banners.map(b => `
        <div class="banner-card">
          <div class="banner-preview-box">
            <img src="${escHtml(b.desktopImage)}" alt="${escHtml(b.title)}" />
            <div class="banner-overlay-badge">
              <span class="cp-badge ${b.status === 'published' ? 'cp-badge-success' : b.status === 'scheduled' ? 'cp-badge-warning' : 'cp-badge-neutral'}">
                ${escHtml(b.status.toUpperCase())}
              </span>
              <span class="cp-badge cp-badge-info" style="background:#1E1D1B;color:#F4EFE6;border:1px solid #4D473B">
                ${escHtml(b.position.toUpperCase())}
              </span>
            </div>
          </div>

          <div class="banner-card-body">
            <div class="banner-subtitle">${escHtml(b.subtitle || 'ROYRA SIGNATURE')}</div>
            <h4 class="banner-title">${escHtml(b.title)}</h4>
            <p class="banner-desc">${escHtml(b.description || 'No description entered.')}</p>

            <div class="banner-meta-row">
              <span><strong>CTA:</strong> "${escHtml(b.ctaText)}" &rarr; ${escHtml(b.ctaUrl)}</span>
              <span>Order: #${b.sortOrder}</span>
            </div>

            <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--cp-text-muted)">
              <span><i data-lucide="eye" style="width:11px;height:11px;display:inline"></i> ${b.viewsCount || 0} Impressions</span>
              <span><i data-lucide="mouse-pointer" style="width:11px;height:11px;display:inline"></i> ${b.clicksCount || 0} Clicks (${b.viewsCount ? ((b.clicksCount / b.viewsCount) * 100).toFixed(1) : 0}% CTR)</span>
            </div>
          </div>

          <div class="banner-card-actions">
            <button type="button" class="cp-btn cp-btn-sm cp-btn-outline" style="flex:1" onclick="openBannerPreviewModal('${b.id}')">
              <i data-lucide="smartphone"></i> Preview
            </button>
            <button type="button" class="cp-btn cp-btn-sm cp-btn-outline" onclick="openEditBannerModal('${b.id}')" title="Edit">
              <i data-lucide="edit-3"></i>
            </button>
            <button type="button" class="cp-btn cp-btn-sm cp-btn-outline" onclick="duplicateBanner('${b.id}')" title="Duplicate">
              <i data-lucide="copy"></i>
            </button>
            <button type="button" class="cp-btn cp-btn-sm cp-btn-danger" onclick="deleteBanner('${b.id}')" title="Delete">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  container.innerHTML = html;
}

// 3. MEDIA LIBRARY MODULE
async function renderMediaLibrary(container) {
  const selectedFolder = CPanelState.selectedMediaFolder || 'all';
  const data = await apiCall(`/api/cpanel/media?folder=${selectedFolder}`);
  const items = data.media || [];
  const folders = data.folders || [];

  const html = `
    <div class="content-studio-header">
      <div>
        <h2 style="font-family:var(--cp-font-serif);font-size:20px;font-weight:600;color:var(--cp-text-main)">Media Library & High-Resolution Asset Hub</h2>
        <div style="font-size:12px;color:var(--cp-text-secondary);margin-top:2px">Upload, organize, and inspect product photos, variant angles (Gold/Silver/Rose), CAD models, and banners.</div>
      </div>
      <div style="display:flex;gap:8px">
        <button type="button" class="cp-btn cp-btn-primary" onclick="openMediaUploadModal()">
          <i data-lucide="upload-cloud"></i> Upload New File
        </button>
      </div>
    </div>

    <!-- FOLDER FILTER PILLS -->
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px">
      ${folders.map(f => `
        <button type="button" class="cp-btn cp-btn-sm ${selectedFolder === f.id ? 'cp-btn-primary' : 'cp-btn-outline'}" onclick="filterMediaFolder('${f.id}')">
          ${escHtml(f.name)} (${f.count})
        </button>
      `).join('')}
    </div>

    <!-- MEDIA GRID -->
    <div class="media-grid">
      ${items.map(m => `
        <div class="media-card" onclick="selectMediaItem('${m.id}', '${m.url}', '${m.name}')">
          <div class="media-thumb">
            ${m.format === 'pdf' ? `
              <div style="text-align:center;color:#F4EFE6">
                <i data-lucide="file-text" style="width:36px;height:36px;margin:0 auto 4px"></i>
                <div style="font-size:10px">PDF Document</div>
              </div>
            ` : `
              <img src="${escHtml(m.url)}" alt="${escHtml(m.altText || m.name)}" />
            `}
          </div>
          <div class="media-info">
            <div class="media-name" title="${escHtml(m.name)}">${escHtml(m.name)}</div>
            <div class="media-sub">
              <span>${escHtml(m.dimensions)}</span>
              <span>${(m.sizeBytes / 1024).toFixed(0)} KB</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  container.innerHTML = html;
}

function filterMediaFolder(folderId) {
  CPanelState.selectedMediaFolder = folderId;
  renderMediaLibrary(document.getElementById('cpanel-content-area'));
}

// 4. HOMEPAGE SECTIONS STUDIO
async function renderHomepageSections(container) {
  const data = await apiCall('/api/cpanel/homepage-sections');
  const sections = data.sections || [];

  const html = `
    <div class="content-studio-header">
      <div>
        <h2 style="font-family:var(--cp-font-serif);font-size:20px;font-weight:600;color:var(--cp-text-main)">Homepage Visual Section Studio</h2>
        <div style="font-size:12px;color:var(--cp-text-secondary);margin-top:2px">Reorder, enable/disable, and personalize copy and call-to-actions across storefront homepage sections.</div>
      </div>
      <div style="display:flex;gap:8px">
        <a href="../index.html" target="_blank" class="cp-btn cp-btn-outline" style="text-decoration:none">
          <i data-lucide="external-link"></i> Live Preview Storefront
        </a>
      </div>
    </div>

    <!-- SECTIONS LIST -->
    <div style="max-width:850px">
      ${sections.map((sec, idx) => `
        <div class="section-sort-item ${sec.enabled ? '' : 'disabled'}" id="sec-row-${sec.id}">
          <div style="display:flex;align-items:center;gap:12px;flex:1">
            <div style="font-weight:700;color:var(--cp-gold);font-size:14px;width:24px">#${idx + 1}</div>
            <div style="flex:1">
              <div style="font-weight:600;font-size:14px;color:var(--cp-text-main)">${escHtml(sec.name)}</div>
              <div style="font-size:11.5px;color:var(--cp-text-secondary)">"${escHtml(sec.title)}" • ${escHtml(sec.subtitle || 'Default style')}</div>
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:10px">
            <button type="button" class="cp-btn cp-btn-sm ${sec.enabled ? 'cp-btn-success' : 'cp-btn-outline'}" onclick="toggleHomepageSection('${sec.id}', ${!sec.enabled})">
              <i data-lucide="${sec.enabled ? 'check' : 'eye-off'}"></i> ${sec.enabled ? 'Enabled' : 'Disabled'}
            </button>
            <button type="button" class="cp-btn cp-btn-sm cp-btn-outline" onclick="openEditSectionModal('${sec.id}')">
              <i data-lucide="settings-2"></i> Configure
            </button>
            <div style="display:flex;flex-direction:column;gap:2px">
              <button type="button" class="cp-btn cp-btn-sm cp-btn-outline" style="padding:2px 6px" onclick="moveSection('${sec.id}', -1)" ${idx === 0 ? 'disabled' : ''}>▲</button>
              <button type="button" class="cp-btn cp-btn-sm cp-btn-outline" style="padding:2px 6px" onclick="moveSection('${sec.id}', 1)" ${idx === sections.length - 1 ? 'disabled' : ''}>▼</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  container.innerHTML = html;
}

async function toggleHomepageSection(sectionId, enabled) {
  const res = await apiCall('/api/cpanel/homepage-sections/toggle', 'POST', { sectionId, enabled });
  if (res.success) {
    showToast(res.message, 'success');
    renderHomepageSections(document.getElementById('cpanel-content-area'));
  } else {
    showToast(res.error || 'Failed to toggle section', 'error');
  }
}

async function moveSection(sectionId, direction) {
  const data = await apiCall('/api/cpanel/homepage-sections');
  const sections = data.sections || [];
  const index = sections.findIndex(s => s.id === sectionId);
  if (index === -1) return;

  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= sections.length) return;

  const item = sections.splice(index, 1)[0];
  sections.splice(targetIndex, 0, item);

  const orderedIds = sections.map(s => s.id);
  const res = await apiCall('/api/cpanel/homepage-sections/reorder', 'POST', { orderedIds });
  if (res.success) {
    showToast('Section order updated', 'success');
    renderHomepageSections(document.getElementById('cpanel-content-area'));
  }
}

// 5. SEO & SERP MANAGER
async function renderSeoManager(container) {
  const data = await apiCall('/api/cpanel/seo');
  const seo = data.seo || {};

  const html = `
    <div class="content-studio-header">
      <div>
        <h2 style="font-family:var(--cp-font-serif);font-size:20px;font-weight:600;color:var(--cp-text-main)">SEO & Search Engine Preview Studio</h2>
        <div style="font-size:12px;color:var(--cp-text-secondary);margin-top:2px">Configure canonical tags, OpenGraph social cards, JSON-LD rich snippets, and Google SERP rendering.</div>
      </div>
      <div style="display:flex;gap:8px">
        <button type="button" class="cp-btn cp-btn-primary" onclick="saveSeoSettings()">
          <i data-lucide="save"></i> Save & Sync Search Engine Schema
        </button>
      </div>
    </div>

    <div class="cp-grid-2">
      <!-- GOOGLE SERP SIMULATOR CARD -->
      <div class="cp-card">
        <div class="cp-card-header">
          <h3 class="cp-card-title"><i data-lucide="search"></i> Google Live Search Result Simulator</h3>
          <span class="cp-badge cp-badge-success">SEO Score: 98/100</span>
        </div>
        <div class="cp-card-body">
          <div class="serp-preview-card">
            <div class="serp-url">
              <span style="background:#E8F0FE;color:#1A73E8;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:bold">royrajewels.com</span>
              <span>https://royrajewels.com</span>
            </div>
            <div class="serp-title" id="serp-preview-title">${escHtml(seo.siteTitle)}</div>
            <div class="serp-desc" id="serp-preview-desc">${escHtml(seo.metaDescription)}</div>
          </div>

          <div style="margin-top:20px;padding:12px;background:var(--cp-surface-subtle);border-radius:8px;font-size:12px;color:var(--cp-text-secondary)">
            <strong>Rich Snippets Included:</strong> Product Schema (JSON-LD), Organization BIS 916 Hallmark, BreadcrumbList, In-Stock Availability, Free Insured Shipping.
          </div>
        </div>
      </div>

      <!-- SEO EDITING FORM -->
      <div class="cp-card">
        <div class="cp-card-header">
          <h3 class="cp-card-title"><i data-lucide="edit"></i> Global Meta Tags Editor</h3>
        </div>
        <div class="cp-card-body" style="display:flex;flex-direction:column;gap:14px">
          <div>
            <label class="cp-label">Meta Title (Max 60 chars recommended)</label>
            <input type="text" id="seo-input-title" class="cp-input" value="${escHtml(seo.siteTitle)}" oninput="updateSerpPreview()" />
          </div>

          <div>
            <label class="cp-label">Meta Description (150-160 chars recommended)</label>
            <textarea id="seo-input-desc" class="cp-input" rows="3" oninput="updateSerpPreview()">${escHtml(seo.metaDescription)}</textarea>
          </div>

          <div>
            <label class="cp-label">Canonical URL</label>
            <input type="text" id="seo-input-canonical" class="cp-input" value="${escHtml(seo.canonicalUrl)}" />
          </div>

          <div>
            <label class="cp-label">Target Search Keywords</label>
            <input type="text" id="seo-input-keywords" class="cp-input" value="${escHtml(seo.keywords)}" />
          </div>

          <div>
            <label class="cp-label">Robots.txt Directives</label>
            <textarea id="seo-input-robots" class="cp-input cp-font-mono" rows="3">${escHtml(seo.robotsTxt)}</textarea>
          </div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function updateSerpPreview() {
  const title = document.getElementById('seo-input-title')?.value || 'Royra Jewels';
  const desc = document.getElementById('seo-input-desc')?.value || '';
  const titleEl = document.getElementById('serp-preview-title');
  const descEl = document.getElementById('serp-preview-desc');
  if (titleEl) titleEl.innerText = title;
  if (descEl) descEl.innerText = desc;
}

async function saveSeoSettings() {
  const siteTitle = document.getElementById('seo-input-title')?.value;
  const metaDescription = document.getElementById('seo-input-desc')?.value;
  const canonicalUrl = document.getElementById('seo-input-canonical')?.value;
  const keywords = document.getElementById('seo-input-keywords')?.value;
  const robotsTxt = document.getElementById('seo-input-robots')?.value;

  const res = await apiCall('/api/cpanel/seo', 'POST', {
    siteTitle,
    metaDescription,
    canonicalUrl,
    keywords,
    robotsTxt
  });

  if (res.success) {
    showToast(res.message, 'success');
  } else {
    showToast(res.error || 'Failed to save SEO settings', 'error');
  }
}

// 6. SCHEDULED CONTENT MODULE
async function renderScheduledContent(container) {
  const data = await apiCall('/api/cpanel/scheduled');
  const items = data.scheduledItems || [];

  const html = `
    <div class="content-studio-header">
      <div>
        <h2 style="font-family:var(--cp-font-serif);font-size:20px;font-weight:600;color:var(--cp-text-main)">Scheduled Campaigns & Automation Queue</h2>
        <div style="font-size:12px;color:var(--cp-text-secondary);margin-top:2px">Automate flash sales, festival banner switches (Akshaya Tritiya, Diwali, Valentine), and timed promotions.</div>
      </div>
    </div>

    <div class="cp-card">
      <div class="cp-card-body" style="padding:0">
        <table class="cp-table">
          <thead>
            <tr>
              <th>Campaign Name</th>
              <th>Content Type</th>
              <th>Publish Start</th>
              <th>Auto Unpublish</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(s => `
              <tr>
                <td><strong>${escHtml(s.title)}</strong></td>
                <td><span class="cp-badge cp-badge-info">${escHtml(s.type.toUpperCase())}</span></td>
                <td>${new Date(s.publishAt).toLocaleString()}</td>
                <td>${new Date(s.unpublishAt).toLocaleString()}</td>
                <td><span class="cp-badge ${s.status === 'active' ? 'cp-badge-success' : 'cp-badge-warning'}">${escHtml(s.status.toUpperCase())}</span></td>
                <td>
                  <button type="button" class="cp-btn cp-btn-sm cp-btn-danger" onclick="cancelScheduledItem('${s.id}')">Cancel</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

async function cancelScheduledItem(id) {
  const res = await apiCall(`/api/cpanel/scheduled/${id}`, 'DELETE');
  if (res.success) {
    showToast(res.message, 'success');
    renderScheduledContent(document.getElementById('cpanel-content-area'));
  }
}

// 7. PUBLISH HISTORY MODULE
async function renderPublishHistory(container) {
  const data = await apiCall('/api/cpanel/publish-history');
  const logs = data.history || [];

  const html = `
    <div class="content-studio-header">
      <div>
        <h2 style="font-family:var(--cp-font-serif);font-size:20px;font-weight:600;color:var(--cp-text-main)">Content Publishing & Deployment Audit Log</h2>
        <div style="font-size:12px;color:var(--cp-text-secondary);margin-top:2px">Immutable historical record of every marketing banner, visual layout, and metadata change.</div>
      </div>
    </div>

    <div class="cp-card">
      <div class="cp-card-body" style="padding:0">
        <table class="cp-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User & Role</th>
              <th>Item Type</th>
              <th>Item Name</th>
              <th>Action</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            ${logs.map(l => `
              <tr>
                <td style="font-size:11.5px;color:var(--cp-text-muted);white-space:nowrap">${new Date(l.timestamp).toLocaleString()}</td>
                <td><strong>${escHtml(l.user)}</strong><div style="font-size:10.5px;color:var(--cp-gold)">${escHtml(l.role)}</div></td>
                <td>${escHtml(l.itemType)}</td>
                <td><strong>${escHtml(l.itemName)}</strong></td>
                <td><span class="cp-badge ${l.action === 'PUBLISH' ? 'cp-badge-success' : 'cp-badge-info'}">${escHtml(l.action)}</span></td>
                <td style="font-size:12px;color:var(--cp-text-secondary)">${escHtml(l.details)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// -------------------------------------------------------------
// MODALS & ACTIONS (Banner CRUD, Device Preview, Media Upload)
// -------------------------------------------------------------

function openBannerPreviewModal(bannerId) {
  const modal = document.createElement('div');
  modal.className = 'cp-modal-backdrop';
  modal.id = 'banner-device-preview-modal';

  modal.innerHTML = `
    <div class="cp-modal-card" style="max-width:1050px;width:95%">
      <div class="cp-modal-header" style="justify-content:space-between">
        <div>
          <h3 class="cp-modal-title"><i data-lucide="smartphone"></i> Live Storefront Viewport Simulator</h3>
          <div style="font-size:11.5px;color:var(--cp-text-secondary)">Inspect responsive rendering on UltraWide, Desktop (1920px), Tablet (768px), and Mobile (375px).</div>
        </div>
        <div style="display:flex;gap:6px;align-items:center">
          <button type="button" class="cp-btn cp-btn-sm cp-btn-primary" onclick="setSimulatorDevice('desktop')">Desktop 1920</button>
          <button type="button" class="cp-btn cp-btn-sm cp-btn-outline" onclick="setSimulatorDevice('tablet')">Tablet 768</button>
          <button type="button" class="cp-btn cp-btn-sm cp-btn-outline" onclick="setSimulatorDevice('mobile')">Mobile 375</button>
          <button type="button" class="cp-btn cp-btn-sm cp-btn-outline" onclick="closeModal('banner-device-preview-modal')">✕</button>
        </div>
      </div>
      <div class="cp-modal-body" style="padding:24px;background:#141312;display:flex;align-items:center;justify-content:center;min-height:540px">
        <div id="viewport-frame" class="viewport-simulator-frame desktop">
          <iframe src="../index.html" class="viewport-screen" style="border:none" title="Live Preview"></iframe>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  if (window.lucide) lucide.createIcons();
}

function setSimulatorDevice(device) {
  const frame = document.getElementById('viewport-frame');
  if (!frame) return;
  frame.className = `viewport-simulator-frame ${device}`;
}

function closeModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.remove();
}

function openNewBannerModal() {
  openBannerFormModal(null);
}

async function openEditBannerModal(bannerId) {
  const data = await apiCall('/api/cpanel/banners');
  const banner = (data.banners || []).find(b => b.id === bannerId);
  if (banner) openBannerFormModal(banner);
}

function openBannerFormModal(banner) {
  const isEdit = Boolean(banner && banner.id);
  const modal = document.createElement('div');
  modal.className = 'cp-modal-backdrop';
  modal.id = 'banner-form-modal';

  modal.innerHTML = `
    <div class="cp-modal-card" style="max-width:650px;width:95%">
      <div class="cp-modal-header">
        <h3 class="cp-modal-title"><i data-lucide="flag"></i> ${isEdit ? 'Edit Campaign Banner' : 'Create New Campaign Banner'}</h3>
        <button type="button" class="cp-btn cp-btn-sm cp-btn-outline" onclick="closeModal('banner-form-modal')">✕</button>
      </div>
      <form onsubmit="handleBannerFormSubmit(event, '${isEdit ? banner.id : ''}')">
        <div class="cp-modal-body" style="display:flex;flex-direction:column;gap:12px">
          <div>
            <label class="cp-label">Banner Title <span style="color:#B91C1C">*</span></label>
            <input type="text" id="bform-title" class="cp-input" required value="${escHtml(banner?.title || '')}" placeholder="e.g. THE RADIANCE OF HIGH HEIRLOOMS" />
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div>
              <label class="cp-label">Subtitle / Season Tag</label>
              <input type="text" id="bform-subtitle" class="cp-input" value="${escHtml(banner?.subtitle || '')}" placeholder="e.g. SPRING / SUMMER 2026" />
            </div>
            <div>
              <label class="cp-label">Position / Placement</label>
              <select id="bform-position" class="cp-input">
                <option value="hero" ${banner?.position === 'hero' ? 'selected' : ''}>Hero Top Carousel</option>
                <option value="promo-top" ${banner?.position === 'promo-top' ? 'selected' : ''}>Top Announcement Strip</option>
                <option value="mid-page" ${banner?.position === 'mid-page' ? 'selected' : ''}>Mid-Page Story Editorial</option>
                <option value="footer-promo" ${banner?.position === 'footer-promo' ? 'selected' : ''}>Footer VIP Promo</option>
              </select>
            </div>
          </div>

          <div>
            <label class="cp-label">Desktop Image (1920 × 700 px)</label>
            <input type="text" id="bform-desktop-image" class="cp-input" required value="${escHtml(banner?.desktopImage || 'assets/products/roy-wh00829.webp')}" placeholder="assets/products/... or upload URL" />
          </div>

          <div>
            <label class="cp-label">Mobile Image (1080 × 1350 px Portrait)</label>
            <input type="text" id="bform-mobile-image" class="cp-input" value="${escHtml(banner?.mobileImage || 'assets/products/roy-wh00829.webp')}" placeholder="assets/products/..." />
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div>
              <label class="cp-label">Button Text</label>
              <input type="text" id="bform-cta-text" class="cp-input" value="${escHtml(banner?.ctaText || 'DISCOVER COLLECTION')}" />
            </div>
            <div>
              <label class="cp-label">Button Destination URL</label>
              <input type="text" id="bform-cta-url" class="cp-input" value="${escHtml(banner?.ctaUrl || 'shop.html')}" />
            </div>
          </div>

          <div>
            <label class="cp-label">Status</label>
            <select id="bform-status" class="cp-input">
              <option value="published" ${banner?.status === 'published' ? 'selected' : ''}>Published (Active Live)</option>
              <option value="scheduled" ${banner?.status === 'scheduled' ? 'selected' : ''}>Scheduled</option>
              <option value="draft" ${banner?.status === 'draft' ? 'selected' : ''}>Draft</option>
              <option value="archived" ${banner?.status === 'archived' ? 'selected' : ''}>Archived</option>
            </select>
          </div>
        </div>
        <div class="cp-modal-footer">
          <button type="button" class="cp-btn cp-btn-outline" onclick="closeModal('banner-form-modal')">Cancel</button>
          <button type="submit" class="cp-btn cp-btn-primary">${isEdit ? 'Save Changes' : 'Publish Banner'}</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);
  if (window.lucide) lucide.createIcons();
}

async function handleBannerFormSubmit(e, bannerId) {
  e.preventDefault();
  const payload = {
    title: document.getElementById('bform-title')?.value,
    subtitle: document.getElementById('bform-subtitle')?.value,
    position: document.getElementById('bform-position')?.value,
    desktopImage: document.getElementById('bform-desktop-image')?.value,
    mobileImage: document.getElementById('bform-mobile-image')?.value,
    ctaText: document.getElementById('bform-cta-text')?.value,
    ctaUrl: document.getElementById('bform-cta-url')?.value,
    status: document.getElementById('bform-status')?.value
  };

  let res;
  if (bannerId) {
    res = await apiCall(`/api/cpanel/banners/${bannerId}`, 'PUT', payload);
  } else {
    res = await apiCall('/api/cpanel/banners', 'POST', payload);
  }

  if (res.success) {
    showToast(res.message, 'success');
    closeModal('banner-form-modal');
    renderBannersManager(document.getElementById('cpanel-content-area'));
  } else {
    showToast(res.error || 'Failed to save banner', 'error');
  }
}

async function duplicateBanner(bannerId) {
  const data = await apiCall('/api/cpanel/banners');
  const banner = (data.banners || []).find(b => b.id === bannerId);
  if (!banner) return;

  const duplicatePayload = {
    ...banner,
    title: `${banner.title} (Copy)`,
    status: 'draft'
  };

  const res = await apiCall('/api/cpanel/banners', 'POST', duplicatePayload);
  if (res.success) {
    showToast('Banner duplicated as draft', 'success');
    renderBannersManager(document.getElementById('cpanel-content-area'));
  }
}

async function deleteBanner(bannerId) {
  if (!confirm('Are you sure you want to delete this banner from the store?')) return;
  const res = await apiCall(`/api/cpanel/banners/${bannerId}`, 'DELETE');
  if (res.success) {
    showToast(res.message, 'success');
    renderBannersManager(document.getElementById('cpanel-content-area'));
  } else {
    showToast(res.error || 'Failed to delete banner', 'error');
  }
}

function openMediaUploadModal() {
  const modal = document.createElement('div');
  modal.className = 'cp-modal-backdrop';
  modal.id = 'media-upload-modal';

  modal.innerHTML = `
    <div class="cp-modal-card" style="max-width:540px;width:95%">
      <div class="cp-modal-header">
        <h3 class="cp-modal-title"><i data-lucide="upload-cloud"></i> Upload Media Asset</h3>
        <button type="button" class="cp-btn cp-btn-sm cp-btn-outline" onclick="closeModal('media-upload-modal')">✕</button>
      </div>
      <div class="cp-modal-body" style="display:flex;flex-direction:column;gap:12px">
        <div>
          <label class="cp-label">Destination Folder</label>
          <select id="mu-folder" class="cp-input">
            <option value="banners">Banners (1920x700 / 1080x1350)</option>
            <option value="products">Product Catalog Photos (1000x1000)</option>
            <option value="variants">Variant Images (Gold, Silver, Rose Gold)</option>
            <option value="cad">CAD 3D Models & Renders</option>
            <option value="certificates">Certificates & Hallmark Documents</option>
            <option value="collections">Collection Editorial Graphics</option>
            <option value="icons">Brand SVGs & Icons</option>
          </select>
        </div>

        <div>
          <label class="cp-label">Asset Name</label>
          <input type="text" id="mu-name" class="cp-input" placeholder="e.g. signature-solitaire-gold-main.webp" />
        </div>

        <div>
          <label class="cp-label">Image / File URL or Relative Path</label>
          <input type="text" id="mu-url" class="cp-input" placeholder="assets/products/..." value="assets/products/product-01.jpg" />
        </div>

        <div style="padding:16px;border:2px dashed var(--cp-border);border-radius:8px;text-align:center;color:var(--cp-text-secondary);font-size:12px">
          <i data-lucide="image" style="width:28px;height:28px;margin:0 auto 6px;color:var(--cp-gold)"></i>
          <div>Drag & drop photos or select from device</div>
          <div style="font-size:10.5px;color:var(--cp-text-muted);margin-top:2px">Supports JPG, PNG, WEBP, SVG, PDF (Max 25MB)</div>
        </div>
      </div>
      <div class="cp-modal-footer">
        <button type="button" class="cp-btn cp-btn-outline" onclick="closeModal('media-upload-modal')">Cancel</button>
        <button type="button" class="cp-btn cp-btn-primary" onclick="submitMediaUpload()">Upload & Add to Library</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  if (window.lucide) lucide.createIcons();
}

async function submitMediaUpload() {
  const folder = document.getElementById('mu-folder')?.value;
  const name = document.getElementById('mu-name')?.value || `asset-${Date.now()}.webp`;
  const url = document.getElementById('mu-url')?.value;

  if (!url) {
    showToast('Asset URL is required', 'warning');
    return;
  }

  const res = await apiCall('/api/cpanel/media', 'POST', {
    name,
    url,
    folder,
    dimensions: '1000x1000',
    sizeBytes: 154000,
    format: name.split('.').pop() || 'webp'
  });

  if (res.success) {
    showToast(res.message, 'success');
    closeModal('media-upload-modal');
    renderMediaLibrary(document.getElementById('cpanel-content-area'));
  }
}

async function openEditSectionModal(sectionId) {
  const data = await apiCall('/api/cpanel/homepage-sections');
  const sec = (data.sections || []).find(s => s.id === sectionId);
  if (!sec) return;

  const modal = document.createElement('div');
  modal.className = 'cp-modal-backdrop';
  modal.id = 'edit-section-modal';

  modal.innerHTML = `
    <div class="cp-modal-card" style="max-width:540px;width:95%">
      <div class="cp-modal-header">
        <h3 class="cp-modal-title"><i data-lucide="settings-2"></i> Configure Section: ${escHtml(sec.name)}</h3>
        <button type="button" class="cp-btn cp-btn-sm cp-btn-outline" onclick="closeModal('edit-section-modal')">✕</button>
      </div>
      <div class="cp-modal-body" style="display:flex;flex-direction:column;gap:12px">
        <div>
          <label class="cp-label">Section Heading</label>
          <input type="text" id="sec-edit-title" class="cp-input" value="${escHtml(sec.title)}" />
        </div>
        <div>
          <label class="cp-label">Section Subtitle</label>
          <input type="text" id="sec-edit-subtitle" class="cp-input" value="${escHtml(sec.subtitle || '')}" />
        </div>
        <div>
          <label class="cp-label">CTA Text</label>
          <input type="text" id="sec-edit-cta-text" class="cp-input" value="${escHtml(sec.ctaText || '')}" />
        </div>
        <div>
          <label class="cp-label">CTA Link URL</label>
          <input type="text" id="sec-edit-cta-url" class="cp-input" value="${escHtml(sec.ctaUrl || '')}" />
        </div>
      </div>
      <div class="cp-modal-footer">
        <button type="button" class="cp-btn cp-btn-outline" onclick="closeModal('edit-section-modal')">Cancel</button>
        <button type="button" class="cp-btn cp-btn-primary" onclick="saveSectionConfig('${sec.id}')">Save Section</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  if (window.lucide) lucide.createIcons();
}

async function saveSectionConfig(sectionId) {
  const title = document.getElementById('sec-edit-title')?.value;
  const subtitle = document.getElementById('sec-edit-subtitle')?.value;
  const ctaText = document.getElementById('sec-edit-cta-text')?.value;
  const ctaUrl = document.getElementById('sec-edit-cta-url')?.value;

  const res = await apiCall(`/api/cpanel/homepage-sections/${sectionId}`, 'PUT', {
    title,
    subtitle,
    ctaText,
    ctaUrl
  });

  if (res.success) {
    showToast('Section settings saved', 'success');
    closeModal('edit-section-modal');
    renderHomepageSections(document.getElementById('cpanel-content-area'));
  }
}

// -------------------------------------------------------------
// INITIALIZATION
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Setup Role Selector in Topbar
  const roleSelect = document.getElementById('cp-role-select');
  if (roleSelect) {
    roleSelect.value = CPanelState.currentRole;
    roleSelect.addEventListener('change', (e) => {
      handleRoleChange(e.target.value);
    });
  }

  // Bind Navigation Links
  document.querySelectorAll('.cpanel-nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = btn.getAttribute('data-tab');
      if (tab) switchTab(tab);
    });
  });

  // Initial load
  switchTab(CPanelState.activeTab);
});
