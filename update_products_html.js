import fs from 'fs';
import path from 'path';

const file = 'admin/products.html';
let content = fs.readFileSync(file, 'utf8');

const newContent = `
      <div class="admin-content" style="max-width: 1200px; margin: 0 auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #202223;">Products</h1>
          <div style="display: flex; gap: 8px;">
            <button class="btn-admin-secondary" style="padding: 6px 12px; font-size: 13px;">Export</button>
            <button class="btn-admin-secondary" style="padding: 6px 12px; font-size: 13px;">Import</button>
            <button class="btn-admin-secondary" style="padding: 6px 12px; font-size: 13px;">More actions <i data-lucide="chevron-down" style="width:14px;height:14px;vertical-align:middle;"></i></button>
            <a href="product-form.html" class="btn-admin-primary" style="padding: 6px 12px; font-size: 13px; text-decoration: none;">Add product</a>
          </div>
        </div>

        <div class="admin-card" style="overflow: visible;">
          <div style="padding: 12px; border-bottom: 1px solid var(--admin-border); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 300px;">
              <button class="btn-admin-secondary" style="padding: 6px 12px; border:none; box-shadow:none; font-weight:600; background:#F3F3F3;">All <i data-lucide="chevron-down" style="width:14px;height:14px;"></i></button>
              <div class="global-search" style="background: #FFF; border: 1px solid #C9CCCF; border-radius: 4px; flex: 1;">
                <i data-lucide="search" style="color: #8C9196; width: 14px; margin-left: 8px;"></i>
                <input type="text" placeholder="Search products" style="color: #202223;" />
              </div>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <button class="btn-admin-secondary" style="border-radius:4px; border: 1px dashed #C9CCCF; padding:4px 8px; font-size: 13px;">Status <i data-lucide="chevron-down" style="width:14px;height:14px;"></i></button>
              <button class="btn-admin-secondary" style="border-radius:4px; border: 1px dashed #C9CCCF; padding:4px 8px; font-size: 13px;">Category <i data-lucide="chevron-down" style="width:14px;height:14px;"></i></button>
              <button class="btn-admin-secondary" style="border-radius:4px; padding:4px 8px; font-size: 13px;"><i data-lucide="filter" style="width:14px;height:14px;margin-right:4px;"></i> More filters</button>
              <button class="btn-admin-secondary" style="border-radius:4px; padding:4px 8px; font-size: 13px;">Sort by: Newest <i data-lucide="chevron-down" style="width:14px;height:14px;"></i></button>
              <div style="display:flex; border: 1px solid #C9CCCF; border-radius: 4px; overflow:hidden;">
                <button style="padding: 4px; background: #F3F3F3; border:none; cursor:pointer;"><i data-lucide="list" style="width:16px;height:16px;color:#202223;"></i></button>
                <button style="padding: 4px; background: #FFF; border:none; border-left:1px solid #C9CCCF; cursor:pointer;"><i data-lucide="grid" style="width:16px;height:16px;color:#8C9196;"></i></button>
              </div>
            </div>
          </div>

          <div class="table-responsive">
            <table class="admin-table" style="width: 100%; text-align: left; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 1px solid var(--admin-border); font-size: 13px; color: #6D7175; font-weight: 600;">
                  <th style="padding: 12px; width: 40px;"><input type="checkbox" /></th>
                  <th style="padding: 12px;">Product</th>
                  <th style="padding: 12px;">Status</th>
                  <th style="padding: 12px;">Inventory</th>
                  <th style="padding: 12px;">Category</th>
                  <th style="padding: 12px;">Channels</th>
                  <th style="padding: 12px;">Type</th>
                  <th style="padding: 12px;">Vendor</th>
                  <th style="padding: 12px;"></th>
                </tr>
              </thead>
              <tbody style="font-size: 14px; color: #202223;">
                <!-- Sample Product 1 -->
                <tr style="border-bottom: 1px solid var(--admin-border);">
                  <td style="padding: 12px;"><input type="checkbox" /></td>
                  <td style="padding: 12px; display: flex; align-items: center; gap: 12px;">
                    <div style="width: 40px; height: 40px; background: #F6F6F7; border-radius: 4px; overflow:hidden; border: 1px solid #E1E3E5;">
                      <img src="../assets/products/roy-earring-5.jpg" style="width:100%; height:100%; object-fit:cover;" />
                    </div>
                    <div>
                      <div style="font-weight: 500;">Diamond Flower Charm Studs</div>
                      <div style="color: #6D7175; font-size: 12px;">SKU: RJ-ER-1001</div>
                    </div>
                  </td>
                  <td style="padding: 12px;"><span style="background: #E3F1DF; color: #008060; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">Active</span></td>
                  <td style="padding: 12px; color: #D82C0D; font-weight: 500;">5 in stock</td>
                  <td style="padding: 12px;">Earrings</td>
                  <td style="padding: 12px;">2 <i data-lucide="chevron-down" style="width:12px;height:12px;"></i></td>
                  <td style="padding: 12px;">925 Silver</td>
                  <td style="padding: 12px;">Royra Jewels</td>
                  <td style="padding: 12px;"><button style="background:none;border:none;cursor:pointer;"><i data-lucide="eye" style="color:#8C9196;"></i></button></td>
                </tr>
                <!-- Sample Product 2 -->
                <tr style="border-bottom: 1px solid var(--admin-border);">
                  <td style="padding: 12px;"><input type="checkbox" /></td>
                  <td style="padding: 12px; display: flex; align-items: center; gap: 12px;">
                    <div style="width: 40px; height: 40px; background: #F6F6F7; border-radius: 4px; overflow:hidden; border: 1px solid #E1E3E5;">
                      <img src="../assets/products/roy-ig-1.jpg" style="width:100%; height:100%; object-fit:cover;" />
                    </div>
                    <div>
                      <div style="font-weight: 500;">Classic Solitaire Ring</div>
                      <div style="color: #6D7175; font-size: 12px;">SKU: RJ-RG-1002</div>
                    </div>
                  </td>
                  <td style="padding: 12px;"><span style="background: #E3F1DF; color: #008060; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">Active</span></td>
                  <td style="padding: 12px; color: #008060; font-weight: 500;">12 in stock</td>
                  <td style="padding: 12px;">Rings</td>
                  <td style="padding: 12px;">2 <i data-lucide="chevron-down" style="width:12px;height:12px;"></i></td>
                  <td style="padding: 12px;">925 Silver</td>
                  <td style="padding: 12px;">Royra Jewels</td>
                  <td style="padding: 12px;"><button style="background:none;border:none;cursor:pointer;"><i data-lucide="eye" style="color:#8C9196;"></i></button></td>
                </tr>
                <!-- Sample Product 3 -->
                <tr style="border-bottom: 1px solid var(--admin-border);">
                  <td style="padding: 12px;"><input type="checkbox" /></td>
                  <td style="padding: 12px; display: flex; align-items: center; gap: 12px;">
                    <div style="width: 40px; height: 40px; background: #F6F6F7; border-radius: 4px; overflow:hidden; border: 1px solid #E1E3E5;">
                      <img src="../assets/products/roy-necklace-1.jpg" style="width:100%; height:100%; object-fit:cover;" />
                    </div>
                    <div>
                      <div style="font-weight: 500;">Dainty Heart Necklace</div>
                      <div style="color: #6D7175; font-size: 12px;">SKU: RJ-NK-1003</div>
                    </div>
                  </td>
                  <td style="padding: 12px;"><span style="background: #E3F1DF; color: #008060; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">Active</span></td>
                  <td style="padding: 12px; color: #008060; font-weight: 500;">18 in stock</td>
                  <td style="padding: 12px;">Necklaces</td>
                  <td style="padding: 12px;">2 <i data-lucide="chevron-down" style="width:12px;height:12px;"></i></td>
                  <td style="padding: 12px;">925 Silver</td>
                  <td style="padding: 12px;">Royra Jewels</td>
                  <td style="padding: 12px;"><button style="background:none;border:none;cursor:pointer;"><i data-lucide="eye" style="color:#8C9196;"></i></button></td>
                </tr>
                 <!-- Sample Product 4 -->
                <tr style="border-bottom: 1px solid var(--admin-border);">
                  <td style="padding: 12px;"><input type="checkbox" /></td>
                  <td style="padding: 12px; display: flex; align-items: center; gap: 12px;">
                    <div style="width: 40px; height: 40px; background: #F6F6F7; border-radius: 4px; overflow:hidden; border: 1px solid #E1E3E5;">
                      <img src="../assets/products/roy-2.jpg" style="width:100%; height:100%; object-fit:cover;" />
                    </div>
                    <div>
                      <div style="font-weight: 500;">Tennis Bracelet</div>
                      <div style="color: #6D7175; font-size: 12px;">SKU: RJ-BR-1004</div>
                    </div>
                  </td>
                  <td style="padding: 12px;"><span style="background: #E3F1DF; color: #008060; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">Active</span></td>
                  <td style="padding: 12px; color: #D82C0D; font-weight: 500;">8 in stock</td>
                  <td style="padding: 12px;">Bracelets</td>
                  <td style="padding: 12px;">2 <i data-lucide="chevron-down" style="width:12px;height:12px;"></i></td>
                  <td style="padding: 12px;">925 Silver</td>
                  <td style="padding: 12px;">Royra Jewels</td>
                  <td style="padding: 12px;"><button style="background:none;border:none;cursor:pointer;"><i data-lucide="eye" style="color:#8C9196;"></i></button></td>
                </tr>
                 <!-- Sample Product 5 -->
                <tr>
                  <td style="padding: 12px;"><input type="checkbox" /></td>
                  <td style="padding: 12px; display: flex; align-items: center; gap: 12px;">
                    <div style="width: 40px; height: 40px; background: #F6F6F7; border-radius: 4px; overflow:hidden; border: 1px solid #E1E3E5;">
                      <img src="../assets/products/roy-wh00829.webp" style="width:100%; height:100%; object-fit:cover;" />
                    </div>
                    <div>
                      <div style="font-weight: 500;">Pearl Drop Pendant</div>
                      <div style="color: #6D7175; font-size: 12px;">SKU: RJ-PD-1005</div>
                    </div>
                  </td>
                  <td style="padding: 12px;"><span style="background: #F1F2F3; color: #202223; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">Draft</span></td>
                  <td style="padding: 12px; color: #D82C0D; font-weight: 500;">0 in stock</td>
                  <td style="padding: 12px;">Pendants</td>
                  <td style="padding: 12px;">2 <i data-lucide="chevron-down" style="width:12px;height:12px;"></i></td>
                  <td style="padding: 12px;">925 Silver</td>
                  <td style="padding: 12px;">Royra Jewels</td>
                  <td style="padding: 12px;"><button style="background:none;border:none;cursor:pointer;"><i data-lucide="eye" style="color:#8C9196;"></i></button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style="padding: 12px; border-top: 1px solid var(--admin-border); display: flex; justify-content: space-between; align-items: center; color: #6D7175; font-size: 13px;">
            <span>Showing 1 to 5 of 5 products</span>
            <div style="display: flex; gap: 8px;">
              <button class="btn-admin-secondary" style="padding: 4px 8px;" disabled><i data-lucide="chevron-left" style="width:16px;height:16px;"></i></button>
              <button class="btn-admin-secondary" style="padding: 4px 12px; font-weight: 600; background: #F3F3F3;">1</button>
              <button class="btn-admin-secondary" style="padding: 4px 8px;" disabled><i data-lucide="chevron-right" style="width:16px;height:16px;"></i></button>
            </div>
          </div>
        </div>
      </div>
`;

content = content.replace(/<div class="admin-content">[\s\S]*?(?=<\/main>)/, newContent);
fs.writeFileSync(file, content, 'utf8');
console.log('Updated products.html body');
