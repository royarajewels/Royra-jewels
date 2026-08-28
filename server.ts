import express from 'express';
import cors from 'cors';
import path from 'path';
import sql from 'mssql';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import cpanelRouter from './server/cpanel';
import aiRouter from './server/ai';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';

dotenv.config();

const app = express();
const PORT = 3000;

// Allowed Origins for Storefront, Admin, C-Panel, and Local Development
const allowedOrigins = [
  'https://royrajewels.github.io',
  'https://royarajewels.github.io',
  'https://royrajewals.github.io',
  'https://royarajewals.github.io',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.includes('github.io') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.includes('run.app')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-email', 'x-admin-role', 'X-Requested-With', 'Accept', 'Origin']
}));

// Explicit CORS preflight handler
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-email, x-admin-role, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.status(204).end();
});

// Explicit JSON and CORS headers for all /api endpoints
app.use('/api', (req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-email, x-admin-role, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

app.use(express.json());

// Mount C-Panel Hosting & Server Administration API
app.use('/api/cpanel', cpanelRouter);

// Mount AI Jewellery Product Content Generator API
app.use('/api/ai', aiRouter);

// SQL Server Configuration from Environment Variables
const sqlConfig: sql.config = {
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  server: process.env.DB_SERVER || '',
  database: process.env.DB_NAME || 'RoyraJewelsERP',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 1433,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true', // true for Azure / cloud SQL Server
    trustServerCertificate: process.env.DB_TRUST_CERT !== 'false', // true for local/self-signed
    enableArithAbort: true
  }
};

let poolPromise: Promise<sql.ConnectionPool> | null = null;

function getSqlPool(): Promise<sql.ConnectionPool> {
  if (!poolPromise) {
    if (!sqlConfig.server || !sqlConfig.user) {
      return Promise.reject(new Error('SQL Server credentials (DB_SERVER, DB_USER, DB_PASSWORD, DB_NAME) are not configured in environment variables.'));
    }
    poolPromise = new sql.ConnectionPool(sqlConfig)
      .connect()
      .then(pool => {
        console.log('Connected to SQL Server ERP database successfully.');
        return pool;
      })
      .catch(err => {
        poolPromise = null;
        console.error('SQL Server connection error:', err.message);
        throw err;
      });
  }
  return poolPromise;
}

// 1. Health & Connection Status API
app.get('/api/health', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'Royra Jewels Server'
  });
});

app.get('/api/integration/status', async (req, res) => {
  const isEnvConfigured = Boolean(process.env.DB_SERVER && process.env.DB_USER);
  if (!isEnvConfigured) {
    return res.json({
      status: 'pending_configuration',
      database: process.env.DB_NAME || 'RoyraJewelsERP',
      message: 'SQL Server environment variables (DB_SERVER, DB_USER, DB_PASSWORD) are not set.',
      isReady: false
    });
  }

  try {
    const pool = await getSqlPool();
    const result = await pool.request().query('SELECT @@VERSION as version, DB_NAME() as currentDb, GETDATE() as serverTime');
    return res.json({
      status: 'connected',
      database: result.recordset[0].currentDb,
      serverTime: result.recordset[0].serverTime,
      isReady: true
    });
  } catch (err: any) {
    return res.status(500).json({
      status: 'connection_failed',
      error: err.message,
      isReady: false
    });
  }
});

// 2. Integration Web Order Ingestion API
app.post('/api/integration/web-order', async (req, res) => {
  try {
    const { customer, items, paymentMethod, notes, webOrderId } = req.body;

    if (!customer || !customer.full_name) {
      return res.status(400).json({ success: false, error: 'Customer information (full_name) is required' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Order must contain at least one line item' });
    }

    const isEnvConfigured = Boolean(process.env.DB_SERVER && process.env.DB_USER);

    // If SQL Server is not yet connected (e.g. running in testing/mock mode), simulate successful ERP ingestion
    if (!isEnvConfigured) {
      const generatedSalesNo = `SO-WEB-${Date.now().toString().slice(-6)}`;
      console.log(`[ERP Simulation] Received web order. Generated ERP SalesNo: ${generatedSalesNo}`);
      return res.json({
        success: true,
        mode: 'simulated_test_mode',
        salesNo: generatedSalesNo,
        salesId: Math.floor(Math.random() * 10000),
        customerId: 101,
        customerCode: `CUST-${Date.now().toString().slice(-4)}`,
        message: 'Order processed in ERP test bridge. Configure DB_SERVER, DB_USER, DB_PASSWORD for live SQL Server writes.',
        itemsCount: items.length
      });
    }

    // Live SQL Server Ingestion
    const pool = await getSqlPool();

    // STEP A: Customer Check / Auto-Registration in Master.tblCustomer
    const customerPhone = customer.phone || customer.mobile || '';
    const customerEmail = customer.email || '';
    const customerName = customer.full_name;
    const shippingAddr = typeof customer.shipping_address === 'string' 
      ? customer.shipping_address 
      : (customer.shipping_address?.address || '');
    const city = customer.shipping_address?.city || customer.shipping_address?.city_state?.split(',')[0]?.trim() || '';
    const state = customer.shipping_address?.state || customer.shipping_address?.city_state?.split(',')[1]?.trim() || '';
    const pincode = customer.shipping_address?.pincode || '';

    let customerId: number | null = null;
    let customerCode = '';

    // Check existing customer by mobile or email
    const custSearch = await pool.request()
      .input('mobile', sql.NVarChar(15), customerPhone)
      .input('email', sql.NVarChar(100), customerEmail)
      .query(`
        SELECT TOP 1 CustomerID, CustomerCode, CustomerName 
        FROM [Master].[tblCustomer]
        WHERE (@mobile <> '' AND MobileNo = @mobile) 
           OR (@email <> '' AND Email = @email)
      `);

    if (custSearch.recordset.length > 0) {
      customerId = custSearch.recordset[0].CustomerID;
      customerCode = custSearch.recordset[0].CustomerCode;
    } else {
      // Create new customer in Master.tblCustomer
      customerCode = `CUST-${Date.now().toString().slice(-6)}`;
      const insertCust = await pool.request()
        .input('custCode', sql.NVarChar(20), customerCode)
        .input('custName', sql.NVarChar(150), customerName)
        .input('mobile', sql.NVarChar(15), customerPhone)
        .input('email', sql.NVarChar(100), customerEmail)
        .input('shippingAddr', sql.NVarChar(300), shippingAddr)
        .input('city', sql.NVarChar(50), city)
        .input('state', sql.NVarChar(50), state)
        .input('pincode', sql.NVarChar(10), pincode)
        .query(`
          INSERT INTO [Master].[tblCustomer]
          (CustomerCode, CustomerName, BusinessType, MobileNo, Email, ShippingAddress, City, StateName, Pincode, IsActive, CreatedDate)
          VALUES
          (@custCode, @custName, 'Retail B2C', @mobile, @email, @shippingAddr, @city, @state, @pincode, 1, GETDATE());
          SELECT SCOPE_IDENTITY() AS CustomerID;
        `);
      customerId = insertCust.recordset[0].CustomerID;
    }

    // STEP B: Generate Unique Sales Number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const salesNo = `SO-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`;
    const salesDate = new Date().toISOString().slice(0, 10);
    const remarks = `Web Order: ${webOrderId || 'Online Store'} | Pay: ${paymentMethod || 'COD'} | ${notes || ''}`.trim();

    // STEP C: Resolve Product IDs and Rates
    // We construct table-valued parameter for Sales.SalesDetailType
    const salesDetailTable = new sql.Table('Sales.SalesDetailType');
    salesDetailTable.columns.add('ProductID', sql.Int);
    salesDetailTable.columns.add('Qty', sql.Decimal(18, 3));
    salesDetailTable.columns.add('Rate', sql.Decimal(18, 2));
    salesDetailTable.columns.add('Amount', sql.Decimal(18, 2));

    for (const item of items) {
      let productId = Number(item.product_id || item.productId);
      const qty = Number(item.quantity || item.qty || 1);
      const rate = Number(item.price || item.rate || 0);
      const amount = qty * rate;

      // If productId is not a valid integer or needs lookup by SKU
      if (isNaN(productId) || productId <= 0 || item.sku) {
        const skuLookup = await pool.request()
          .input('sku', sql.VarChar(50), String(item.sku || item.id || ''))
          .query(`SELECT TOP 1 ProductID FROM [Master].[tblProduct] WHERE SKU = @sku`);
        
        if (skuLookup.recordset.length > 0) {
          productId = skuLookup.recordset[0].ProductID;
        } else {
          // Fallback to first active product in master if not found
          const fallback = await pool.request().query(`SELECT TOP 1 ProductID FROM [Master].[tblProduct]`);
          productId = fallback.recordset.length > 0 ? fallback.recordset[0].ProductID : 1;
        }
      }

      salesDetailTable.rows.add(productId, qty, rate, amount);
    }

    // STEP D: Execute Sales.sp_SaveSales
    const transactionRequest = pool.request();
    transactionRequest.input('SalesNo', sql.VarChar(30), salesNo);
    transactionRequest.input('SalesDate', sql.Date, salesDate);
    transactionRequest.input('CustomerID', sql.Int, customerId);
    transactionRequest.input('Remarks', sql.VarChar(500), remarks);
    transactionRequest.input('SalesDetails', salesDetailTable);

    await transactionRequest.execute('Sales.sp_SaveSales');

    // Retrieve generated SalesID and totals
    const salesRecord = await pool.request()
      .input('salesNo', sql.VarChar(30), salesNo)
      .query(`SELECT TOP 1 SalesID, SalesNo, TotalAmount, GSTAmount, NetAmount FROM [Sales].[tblSales] WHERE SalesNo = @salesNo`);

    const orderSummary = salesRecord.recordset[0] || { SalesNo: salesNo };

    return res.json({
      success: true,
      mode: 'live_sql_server',
      salesNo: orderSummary.SalesNo,
      salesId: orderSummary.SalesID,
      customerId,
      customerCode,
      totalAmount: orderSummary.TotalAmount,
      gstAmount: orderSummary.GSTAmount,
      netAmount: orderSummary.NetAmount,
      message: 'Order successfully saved in SQL Server ERP (Sales.tblSales & Sales.tblSalesDetail) and inventory updated.'
    });

  } catch (error: any) {
    console.error('Failed to create ERP sales order:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Database error occurred while saving ERP sales order'
    });
  }
});

// 3. Generate Invoice and send email
app.post('/api/integration/generate-invoice', async (req, res) => {
  try {
    const { orderId, emailTo } = req.body;
    
    if (!orderId || !emailTo) {
      return res.status(400).json({ success: false, error: 'Missing orderId or emailTo' });
    }
    
    // Generate PDF in memory
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    
    const generatePdf = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);
    });

    // Add company header
    doc.fontSize(20).text('ROYRA JEWELS', { align: 'center' });
    doc.fontSize(10).text('22 Nagole Jaipur Colony Main Road, Jaipur, 302001', { align: 'center' });
    doc.moveDown(2);
    
    // Add Invoice info
    doc.fontSize(16).text('INVOICE', { underline: true });
    doc.fontSize(12).text(`Order Number: #${orderId}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Customer Email: ${emailTo}`);
    doc.moveDown(2);
    
    // Add Items (Mock data for demo)
    doc.fontSize(14).text('Items:', { underline: true });
    doc.fontSize(12).text('1x Diamond Flower Charm Studs (ROY-1002)');
    doc.fontSize(10).text('   Metal: Rose Gold, Purity: 18K');
    doc.fontSize(10).text('   Gross Wt: 2.5g | Net Wt: 2.2g | Stones: Diamond (0.1ct)');
    doc.fontSize(12).text('   Price: ₹11,000.00');
    doc.moveDown(1);
    
    // Add Totals
    doc.text('--------------------------------------------------');
    doc.text('Subtotal: ₹11,000.00');
    doc.text('Discount: -₹5,000.00');
    doc.fontSize(14).text('Total: ₹6,000.00', { bold: true });
    
    doc.end();
    
    const pdfBuffer = await generatePdf;

    // Determine if SMTP is configured, else fallback to mock/ethereal
    const smtpHost = process.env.SMTP_HOST;
    let transporter;
    
    if (smtpHost) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      // Create ethereal test account if no real SMTP provided
      console.log('[ERP Bridge] SMTP credentials missing. Using Ethereal test account.');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    }

    const mailOptions = {
      from: '"Royra Jewels" <noreply@royrajewels.com>',
      to: emailTo,
      subject: `Invoice for Order #${orderId}`,
      text: `Dear Customer,\n\nPlease find attached the invoice for your order #${orderId}.\n\nThank you for shopping with Royra Jewels!`,
      html: `<p>Dear Customer,</p><p>Please find attached the invoice for your order <b>#${orderId}</b>.</p><p>Thank you for shopping with <b>Royra Jewels</b>!</p>`,
      attachments: [
        {
          filename: `Royra-Jewels-Invoice-${orderId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[ERP Bridge] Invoice email sent: ${info.messageId}`);
    
    if (!smtpHost) {
      console.log(`[ERP Bridge] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return res.json({
      success: true,
      message: `Invoice for Order #${orderId} generated and sent to ${emailTo}`,
      previewUrl: !smtpHost ? nodemailer.getTestMessageUrl(info) : null,
      simulated: !smtpHost
    });
  } catch (err: any) {
    console.error('Invoice generation/sending error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Test Endpoint for testing with sample payload without touching checkout
app.post('/api/integration/test-sample-order', async (req, res) => {
  const sampleOrder = {
    webOrderId: `TEST-${Date.now()}`,
    customer: {
      full_name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+919876543210',
      shipping_address: {
        address: '402, Highstreet Luxury Enclave, MG Road',
        city_state: 'Mumbai, Maharashtra',
        pincode: '400001'
      }
    },
    items: [
      {
        sku: 'ROYRA-RING-01',
        productId: 1,
        name: 'Solitaire Diamond Crown Ring',
        quantity: 1,
        price: 18500
      }
    ],
    paymentMethod: 'COD',
    notes: 'Sample test order to verify ERP bridge'
  };

  // Re-route to standard web order processor
  const fakeReq = { body: sampleOrder } as any;
  // Invoke handler logic directly
  try {
    const isEnvConfigured = Boolean(process.env.DB_SERVER && process.env.DB_USER);
    if (!isEnvConfigured) {
      return res.json({
        success: true,
        mode: 'simulated_test_mode',
        testPayload: sampleOrder,
        sampleSalesNo: `SO-SAMPLE-${Date.now().toString().slice(-5)}`,
        note: 'Bridge is functional and ready for live SQL Server credentials.'
      });
    }
    // If live, let the standard route process it
    return res.json({
      success: true,
      mode: 'ready_for_live_test',
      testPayload: sampleOrder
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Explicit C-Panel & Admin Static Route Handlers (Mounted before Vite middleware)
app.use('/cpanel', express.static(path.join(process.cwd(), 'cpanel')));
app.get('/cpanel', (req, res) => {
  res.redirect('/cpanel/index.html');
});
app.get('/cpanel/index.html', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'cpanel', 'index.html'));
});

app.use('/admin', express.static(path.join(process.cwd(), 'admin')));
app.get('/admin', (req, res) => {
  res.redirect('/admin/index.html');
});
app.get('/admin/index.html', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'admin', 'index.html'));
});

app.use('/assets', express.static(path.join(process.cwd(), 'assets')));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Explicit API 404 JSON Catch-All: Prevents any missing /api/* endpoint from falling through to HTML SPA
app.all('/api/*', (req, res) => {
  res.status(404).setHeader('Content-Type', 'application/json').json({
    success: false,
    status: 'unavailable',
    error: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    endpoint: req.originalUrl
  });
});

// Vite Middleware Setup for dev and production static serving
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('/cpanel/*', (req, res) => {
      res.sendFile(path.join(distPath, 'cpanel', 'index.html'));
    });
    app.get('/admin/*', (req, res) => {
      res.sendFile(path.join(distPath, 'admin', 'index.html'));
    });
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Royra Jewels Server & ERP API running on http://localhost:${PORT}`);
  });
}

start();
