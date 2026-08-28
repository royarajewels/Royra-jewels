import fs from 'fs';

const file = 'admin/product-form.html';
let content = fs.readFileSync(file, 'utf8');

const newContent = `
      <div class="admin-content" style="max-width: 1000px; margin: 0 auto; padding-bottom: 60px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <a href="products.html" style="color: #6D7175; text-decoration: none;"><i data-lucide="arrow-left" style="width:20px;height:20px;"></i></a>
            <h1 style="font-size: 20px; font-weight: 700; color: #202223;">Add product</h1>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-admin-secondary" style="padding: 6px 12px; font-size: 13px;">Discard</button>
            <button class="btn-admin-primary" style="padding: 6px 16px; font-size: 13px;">Save</button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
          <!-- LEFT COLUMN -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            
            <!-- Title & Description -->
            <div class="admin-card" style="padding: 16px;">
              <div class="form-group">
                <label class="form-label" style="font-size:13px; color:#202223;">Title</label>
                <input type="text" class="form-input" placeholder="Diamond Flower Charm Studs" style="padding: 8px; font-size: 14px; border: 1px solid #C9CCCF; border-radius: 4px;" />
              </div>
              <div class="form-group" style="margin-top: 16px;">
                <label class="form-label" style="font-size:13px; color:#202223;">Description</label>
                <div style="border: 1px solid #C9CCCF; border-radius: 4px; overflow:hidden;">
                  <div style="background: #F9FAFB; padding: 8px; border-bottom: 1px solid #C9CCCF; display: flex; gap: 8px;">
                    <button style="border:none;background:none;cursor:pointer;"><i data-lucide="type" style="width:14px;height:14px;"></i> Paragraph <i data-lucide="chevron-down" style="width:12px;height:12px;"></i></button>
                    <div style="width:1px; background:#C9CCCF;"></div>
                    <button style="border:none;background:none;cursor:pointer;"><i data-lucide="bold" style="width:14px;height:14px;"></i></button>
                    <button style="border:none;background:none;cursor:pointer;"><i data-lucide="italic" style="width:14px;height:14px;"></i></button>
                    <button style="border:none;background:none;cursor:pointer;"><i data-lucide="underline" style="width:14px;height:14px;"></i></button>
                    <div style="width:1px; background:#C9CCCF;"></div>
                    <button style="border:none;background:none;cursor:pointer;"><i data-lucide="align-left" style="width:14px;height:14px;"></i></button>
                    <button style="border:none;background:none;cursor:pointer;"><i data-lucide="list" style="width:14px;height:14px;"></i></button>
                    <button style="border:none;background:none;cursor:pointer;"><i data-lucide="link" style="width:14px;height:14px;"></i></button>
                    <button style="border:none;background:none;cursor:pointer;"><i data-lucide="image" style="width:14px;height:14px;"></i></button>
                  </div>
                  <textarea rows="4" style="width: 100%; border:none; padding: 12px; font-size: 14px; resize:vertical; outline:none;"></textarea>
                </div>
              </div>
            </div>

            <!-- Media -->
            <div class="admin-card" style="padding: 16px;">
              <h3 style="font-size:14px; font-weight:600; margin-bottom:12px;">Media</h3>
              <div style="border: 1px dashed #C9CCCF; border-radius: 8px; padding: 32px; text-align: center; background: #F9FAFB;">
                <div style="display:flex; justify-content:center; gap:8px; margin-bottom: 8px;">
                  <button class="btn-admin-secondary" style="font-size:13px; font-weight:600; padding:4px 12px; border-radius:4px;">Upload new</button>
                  <button class="btn-admin-secondary" style="font-size:13px; font-weight:600; padding:4px 12px; border-radius:4px;">Select existing</button>
                </div>
                <div style="font-size:13px; color:#6D7175;">Accepts images, videos, or 3D models</div>
              </div>
            </div>

            <!-- Category -->
            <div class="admin-card" style="padding: 16px;">
              <h3 style="font-size:14px; font-weight:600; margin-bottom:12px;">Category</h3>
              <select class="form-select" style="width:100%; padding:8px; font-size:14px; border:1px solid #C9CCCF; border-radius:4px;">
                <option>Choose a product category</option>
                <option>Earrings</option>
                <option>Rings</option>
                <option>Necklaces</option>
              </select>
              <p style="font-size:12px; color:#6D7175; margin-top:8px;">Determines tax rates and adds metafields to improve search, filters, and cross-channel sales</p>
            </div>

            <!-- Pricing -->
            <div class="admin-card" style="padding: 16px;">
              <h3 style="font-size:14px; font-weight:600; margin-bottom:12px;">Pricing</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <div>
                  <label style="font-size:13px; color:#202223;">Price</label>
                  <div style="position:relative;">
                    <span style="position:absolute; left:12px; top:10px; color:#6D7175;">₹</span>
                    <input type="text" class="form-input" placeholder="0.00" style="padding: 8px 8px 8px 24px; width:100%; border:1px solid #C9CCCF; border-radius:4px;" />
                  </div>
                </div>
                <div>
                  <label style="font-size:13px; color:#202223;">Compare-at price</label>
                  <div style="position:relative;">
                    <span style="position:absolute; left:12px; top:10px; color:#6D7175;">₹</span>
                    <input type="text" class="form-input" placeholder="0.00" style="padding: 8px 8px 8px 24px; width:100%; border:1px solid #C9CCCF; border-radius:4px;" />
                  </div>
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:8px; margin-bottom: 16px; font-size:13px; color:#202223;">
                <input type="checkbox" checked /> <span>Charge tax on this product</span>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; padding-top: 16px; border-top: 1px solid #E1E3E5;">
                <div>
                  <label style="font-size:13px; color:#202223;">Cost per item</label>
                  <div style="position:relative;">
                    <span style="position:absolute; left:12px; top:10px; color:#6D7175;">₹</span>
                    <input type="text" class="form-input" placeholder="0.00" style="padding: 8px 8px 8px 24px; width:100%; border:1px solid #C9CCCF; border-radius:4px;" />
                  </div>
                </div>
                <div>
                  <label style="font-size:13px; color:#202223;">Profit</label>
                  <div style="padding: 8px 0; color:#6D7175;">--</div>
                </div>
                <div>
                  <label style="font-size:13px; color:#202223;">Margin</label>
                  <div style="padding: 8px 0; color:#6D7175;">--</div>
                </div>
              </div>
            </div>

            <!-- Inventory -->
            <div class="admin-card" style="padding: 16px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <h3 style="font-size:14px; font-weight:600;">Inventory</h3>
                <label style="display:flex; align-items:center; gap:8px; font-size:13px;"><input type="checkbox" checked /> Track quantity</label>
              </div>
              <div style="display:grid; grid-template-columns:1fr; gap:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-size:13px;">Shop location</span>
                  <input type="number" value="0" style="width:80px; padding:6px; border:1px solid #C9CCCF; border-radius:4px; text-align:right;" />
                </div>
                <div style="display:flex; gap:16px; margin-top:12px; padding-top:12px; border-top:1px solid #E1E3E5;">
                  <div style="flex:1;">
                    <label style="font-size:13px; color:#202223;">SKU (Stock Keeping Unit)</label>
                    <input type="text" style="width:100%; padding:8px; border:1px solid #C9CCCF; border-radius:4px; margin-top:4px;" />
                  </div>
                  <div style="flex:1;">
                    <label style="font-size:13px; color:#202223;">Barcode (ISBN, UPC, GTIN, etc.)</label>
                    <input type="text" style="width:100%; padding:8px; border:1px solid #C9CCCF; border-radius:4px; margin-top:4px;" />
                  </div>
                </div>
                <div style="margin-top:8px;">
                  <label style="display:flex; align-items:center; gap:8px; font-size:13px;"><input type="checkbox" /> Continue selling when out of stock</label>
                </div>
              </div>
            </div>

            <!-- Shipping -->
            <div class="admin-card" style="padding: 16px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <h3 style="font-size:14px; font-weight:600;">Shipping</h3>
                <label style="display:flex; align-items:center; gap:8px; font-size:13px;"><input type="checkbox" checked /> Physical product</label>
              </div>
              <div style="display:flex; gap:16px;">
                 <div style="flex:1;">
                    <label style="font-size:13px; color:#202223;">Weight</label>
                    <div style="display:flex; border:1px solid #C9CCCF; border-radius:4px; overflow:hidden; margin-top:4px;">
                      <input type="number" step="0.1" style="flex:1; border:none; padding:8px; outline:none;" />
                      <select style="background:#F9FAFB; border:none; border-left:1px solid #C9CCCF; padding:0 8px;">
                        <option>kg</option>
                        <option>g</option>
                        <option>lb</option>
                        <option>oz</option>
                      </select>
                    </div>
                 </div>
                 <div style="flex:1;">
                    <label style="font-size:13px; color:#202223;">Country/Region of origin</label>
                    <select style="width:100%; padding:8px; border:1px solid #C9CCCF; border-radius:4px; margin-top:4px;">
                      <option>India</option>
                    </select>
                 </div>
              </div>
            </div>

            <!-- Variants -->
            <div class="admin-card" style="padding: 16px;">
              <h3 style="font-size:14px; font-weight:600; margin-bottom:12px;">Variants</h3>
              <button class="btn-admin-secondary" style="font-size:13px; padding:4px 12px; border-radius:4px; display:flex; align-items:center; gap:4px;"><i data-lucide="plus" style="width:14px;height:14px;"></i> Add options like size or color</button>
            </div>
            
            <!-- Jewellery Specific Fields -->
            <div class="admin-card" style="padding: 16px;">
              <h3 style="font-size:14px; font-weight:600; margin-bottom:12px; color:#A68B5B;"><i data-lucide="gem" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;"></i> Jewellery Specifications</h3>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                  <label style="font-size:13px; color:#202223;">Metal</label>
                  <select style="width:100%; padding:6px; border:1px solid #C9CCCF; border-radius:4px; font-size:13px;">
                    <option>925 Silver</option><option>14K Gold</option><option>18K Gold</option>
                  </select>
                </div>
                <div>
                  <label style="font-size:13px; color:#202223;">Metal Color</label>
                  <select style="width:100%; padding:6px; border:1px solid #C9CCCF; border-radius:4px; font-size:13px;">
                    <option>Yellow Gold</option><option>Rose Gold</option><option>White Gold</option>
                  </select>
                </div>
                <div>
                  <label style="font-size:13px; color:#202223;">Purity</label>
                  <input type="text" style="width:100%; padding:6px; border:1px solid #C9CCCF; border-radius:4px; font-size:13px;" />
                </div>
                <div>
                  <label style="font-size:13px; color:#202223;">Gross Weight (g)</label>
                  <input type="number" step="0.01" style="width:100%; padding:6px; border:1px solid #C9CCCF; border-radius:4px; font-size:13px;" />
                </div>
                <div>
                  <label style="font-size:13px; color:#202223;">Stone Type</label>
                  <input type="text" style="width:100%; padding:6px; border:1px solid #C9CCCF; border-radius:4px; font-size:13px;" />
                </div>
                <div>
                  <label style="font-size:13px; color:#202223;">Stone Quality</label>
                  <input type="text" placeholder="e.g. VVS/FG" style="width:100%; padding:6px; border:1px solid #C9CCCF; border-radius:4px; font-size:13px;" />
                </div>
                <div>
                  <label style="font-size:13px; color:#202223;">Making Charges</label>
                  <input type="text" style="width:100%; padding:6px; border:1px solid #C9CCCF; border-radius:4px; font-size:13px;" />
                </div>
                <div>
                  <label style="font-size:13px; color:#202223;">Hallmark</label>
                  <select style="width:100%; padding:6px; border:1px solid #C9CCCF; border-radius:4px; font-size:13px;">
                    <option>BIS Hallmarked</option><option>None</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- SEO -->
            <div class="admin-card" style="padding: 16px;">
              <h3 style="font-size:14px; font-weight:600; margin-bottom:4px;">Search engine listing</h3>
              <p style="font-size:13px; color:#6D7175; margin-bottom:12px;">Add a title and description to see how this product might appear in a search engine listing</p>
            </div>
            
          </div>

          <!-- RIGHT COLUMN -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            
            <!-- Status -->
            <div class="admin-card" style="padding: 16px;">
              <h3 style="font-size:14px; font-weight:600; margin-bottom:12px;">Status</h3>
              <select style="width:100%; padding:8px; border:1px solid #C9CCCF; border-radius:4px; font-size:14px; background:#F9FAFB;">
                <option>Active</option>
                <option>Draft</option>
                <option>Archived</option>
              </select>
            </div>

            <!-- Publishing -->
            <div class="admin-card" style="padding: 16px;">
              <h3 style="font-size:14px; font-weight:600; margin-bottom:12px;">Publishing</h3>
              <ul style="list-style:none; padding:0; margin:0; font-size:13px;">
                <li style="display:flex; align-items:center; gap:8px; margin-bottom:8px;"><i data-lucide="circle-dot" style="width:14px;height:14px;color:#008060;"></i> Online Store</li>
                <li style="display:flex; align-items:center; gap:8px; color:#6D7175;"><i data-lucide="circle" style="width:14px;height:14px;"></i> Point of Sale</li>
              </ul>
            </div>

            <!-- Product organization -->
            <div class="admin-card" style="padding: 16px;">
              <h3 style="font-size:14px; font-weight:600; margin-bottom:12px;">Product organization</h3>
              <div style="margin-bottom:12px;">
                <label style="font-size:13px; color:#202223;">Type</label>
                <select style="width:100%; padding:8px; border:1px solid #C9CCCF; border-radius:4px; font-size:14px; margin-top:4px;">
                  <option>Earrings</option>
                </select>
              </div>
              <div style="margin-bottom:12px;">
                <label style="font-size:13px; color:#202223;">Vendor</label>
                <select style="width:100%; padding:8px; border:1px solid #C9CCCF; border-radius:4px; font-size:14px; margin-top:4px;">
                  <option>Royra Jewels</option>
                </select>
              </div>
              <div style="margin-bottom:12px;">
                <label style="font-size:13px; color:#202223;">Collections</label>
                <input type="text" placeholder="Search collections" style="width:100%; padding:8px; border:1px solid #C9CCCF; border-radius:4px; margin-top:4px; font-size:14px;" />
                <div style="display:flex; gap:4px; margin-top:8px; flex-wrap:wrap;">
                  <span style="background:#EBEBEB; padding:2px 8px; border-radius:12px; font-size:12px; display:flex; align-items:center; gap:4px;">Earrings <i data-lucide="x" style="width:12px;height:12px;"></i></span>
                  <span style="background:#EBEBEB; padding:2px 8px; border-radius:12px; font-size:12px; display:flex; align-items:center; gap:4px;">New Arrivals <i data-lucide="x" style="width:12px;height:12px;"></i></span>
                </div>
              </div>
              <div>
                <label style="font-size:13px; color:#202223;">Tags</label>
                <input type="text" placeholder="Search tags" style="width:100%; padding:8px; border:1px solid #C9CCCF; border-radius:4px; margin-top:4px; font-size:14px;" />
                <div style="display:flex; gap:4px; margin-top:8px; flex-wrap:wrap;">
                  <span style="background:#EBEBEB; padding:2px 8px; border-radius:12px; font-size:12px; display:flex; align-items:center; gap:4px;">silver <i data-lucide="x" style="width:12px;height:12px;"></i></span>
                  <span style="background:#EBEBEB; padding:2px 8px; border-radius:12px; font-size:12px; display:flex; align-items:center; gap:4px;">flower <i data-lucide="x" style="width:12px;height:12px;"></i></span>
                  <span style="background:#EBEBEB; padding:2px 8px; border-radius:12px; font-size:12px; display:flex; align-items:center; gap:4px;">stud <i data-lucide="x" style="width:12px;height:12px;"></i></span>
                </div>
              </div>
            </div>

            <!-- Theme template -->
            <div class="admin-card" style="padding: 16px;">
              <h3 style="font-size:14px; font-weight:600; margin-bottom:12px;">Theme template</h3>
              <select style="width:100%; padding:8px; border:1px solid #C9CCCF; border-radius:4px; font-size:14px;">
                <option>Default product</option>
              </select>
            </div>

            <!-- Product metafields -->
            <div class="admin-card" style="padding: 16px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3 style="font-size:14px; font-weight:600;">Product metafields</h3>
                <i data-lucide="chevron-down" style="width:16px;height:16px;"></i>
              </div>
            </div>
            
          </div>
        </div>
      </div>
`;

content = content.replace(/<div class="admin-content">[\s\S]*?(?=<\/main>)/, newContent);
fs.writeFileSync(file, content, 'utf8');
console.log('Updated product-form.html body');
