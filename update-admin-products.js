const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/(admin)/admin/products/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update formFields initial state
content = content.replace(
  /image: '',\s+tags: '',/g,
  `image: '',\n    images: ['', '', '', '', ''],\n    tags: '',`
);

// 2. Update the loadData query
content = content.replace(
  /\.select\('\*, categories\(\*\)'\)/g,
  `.select('*, categories(*), images:product_images(*), variants:product_variants(*)')`
);

// 3. Update handleEdit
content = content.replace(
  /const handleEdit = \(product: Product\) => \{[\s\S]*?setView\('edit'\);\s*\};/g,
  `const handleEdit = (product: Product) => {
    setEditingProductId(product.id);
    
    // Sort images by sort_order
    let loadedImages = ['', '', '', '', ''];
    if (product.images && product.images.length > 0) {
      const sorted = [...product.images].sort((a, b) => a.sort_order - b.sort_order);
      for (let i = 0; i < 5; i++) {
        loadedImages[i] = sorted[i] ? sorted[i].image_url : '';
      }
    } else {
      loadedImages[0] = product.og_image_url || '';
    }

    // Process variants
    let hasSizes = false;
    let hasColors = false;
    let sizesSet = new Set<string>();
    let colorsSet = new Set<string>();
    let vList: any[] = [];

    if (product.variants && product.variants.length > 0) {
      product.variants.forEach(v => {
        let size = '';
        let color = '';
        if (v.option_values && Array.isArray(v.option_values)) {
          v.option_values.forEach((ov: any) => {
            if (ov.option_name === 'Size') {
              size = ov.value;
              sizesSet.add(size);
              hasSizes = true;
            }
            if (ov.option_name === 'Color') {
              color = ov.value;
              colorsSet.add(color);
              hasColors = true;
            }
          });
        }
        vList.push({
          size,
          color,
          priceOverride: v.price ? v.price.toString() : '',
          stock: v.stock_quantity.toString(),
          sku: v.sku
        });
      });
    }

    setAvailableSizes(Array.from(sizesSet).join(', ') || 'S, M, L, XL');
    setAvailableColors(Array.from(colorsSet).join(', ') || 'MATTE BLACK (#121212), BONE WHITE (#F5F0EB)');

    setFormFields({
      title: product.title,
      slug: product.slug,
      description: product.description || '',
      additionalInfo: product.additional_info || '',
      categoryId: product.category_id || '',
      price: product.price.toString(),
      salePrice: product.sale_price?.toString() || '',
      sku: product.sku,
      stockQuantity: product.stock_quantity.toString(),
      trackInventory: product.track_inventory,
      allowBackorders: product.allow_backorders,
      status: product.status,
      image: loadedImages[0],
      images: loadedImages,
      tags: product.tags?.join(', ') || '',
      hasSizes,
      hasColors,
    });
    setVariantsList(vList);
    setView('edit');
  };`
);

// 4. Update handleFormSubmit payload
content = content.replace(
  /og_image_url: formFields\.image \|\| 'https:\/\/images\.unsplash\.com\/photo-1556821840-3a63f95609a7\?q=80&w=600',\s+tags: formFields\.tags\.split\(\',\',/g,
  `og_image_url: formFields.images[0] || formFields.image || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600',
      images: formFields.images,
      variants: variantsList.map(v => {
        const option_values = [];
        if (v.size) option_values.push({ option_name: 'Size', value: v.size });
        if (v.color) option_values.push({ option_name: 'Color', value: v.color });
        return {
          sku: v.sku || \`\${formFields.sku}-\${(v.size || 'OS').toUpperCase().replace(/\\s+/g, '')}\`,
          price: v.priceOverride ? parseFloat(v.priceOverride) : null,
          stock_quantity: parseInt(v.stock),
          option_values,
        };
      }),
      tags: formFields.tags.split(',',`
);

// 5. Update UI for Variations
content = content.replace(
  /value=\{availableColors\}\s+onChange=\{\(e\) => setAvailableColors\(e\.target\.value\)\}\s+\/>/g,
  `value={availableColors}\n                onChange={(e) => setAvailableColors(e.target.value)}\n              />\n              <p className="text-[9px] text-[#666666] mt-1 font-mono uppercase tracking-widest">\n                Format: Name (#hex), Name (#hex). Example: Matte Black (#121212)\n              </p>`
);

// 6. Update UI for Images
const oldImageInputRegex = /<h3 className="font-mono text-\[10px\] font-bold tracking-widest text-\[#666666\] border-b border-\[rgba\(0,0,0,0\.03\)\] pb-3 uppercase mt-8">\s*PRODUCT MEDIA\s*<\/h3>[\s\S]*?<\/div>\s*<\/div>/;

const newImageInputs = `<h3 className="font-mono text-[10px] font-bold tracking-widest text-[#666666] border-b border-[rgba(0,0,0,0.03)] pb-3 uppercase mt-8">
              PRODUCT MEDIA (UP TO 5)
            </h3>
            
            <div className="flex flex-col gap-4">
              {[0, 1, 2, 3, 4].map(idx => (
                <div key={idx} className="flex gap-4 items-center">
                  <div className="flex-1">
                    <label className="block font-mono text-[10px] tracking-widest font-bold text-[#444444] mb-2 uppercase">IMAGE URL {idx + 1}</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-[rgba(0,0,0,0.06)] rounded-sm font-mono text-[11px] text-[#111111] bg-[#FAFAFA] outline-none focus:border-neutral-400 focus:bg-white"
                      placeholder="https://..."
                      value={formFields.images[idx] || ''}
                      onChange={(e) => {
                        const newImages = [...formFields.images];
                        newImages[idx] = e.target.value;
                        setFormFields(f => ({ ...f, images: newImages, image: newImages[0] }));
                      }}
                    />
                  </div>
                  {formFields.images[idx] && (
                    <img src={formFields.images[idx]} alt="preview" className="w-12 h-12 object-cover border border-[rgba(0,0,0,0.06)] rounded-sm" />
                  )}
                </div>
              ))}
            </div>`;

content = content.replace(
  /<h3 className="font-mono text-\[10px\] font-bold tracking-widest text-\[#666666\] border-b border-\[rgba\(0,0,0,0\.03\)\] pb-3 uppercase mt-8">\s*PRODUCT MEDIA\s*<\/h3>[\s\S]*?<div className="w-full h-px bg-\[rgba\(0,0,0,0\.06\)\] my-2"><\/div>/,
  newImageInputs + '\n            <div className="w-full h-px bg-[rgba(0,0,0,0.06)] my-2"></div>'
);

// We need to completely remove the old Insert Variants logic in handleFormSubmit because we moved it to the PUT/POST endpoints
content = content.replace(
  /\/\/ Insert variants if any via API[\s\S]*?toast\('PRODUCT RELEASES PUBLISHED IN CATALOG', 'success'\);/g,
  `toast('PRODUCT RELEASES PUBLISHED IN CATALOG', 'success');`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Updated Admin Products Page');
