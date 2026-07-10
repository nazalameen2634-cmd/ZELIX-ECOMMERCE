const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'app/(admin)/admin/products/page.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the prepended JSX at the top of the file
const lines = content.split('\n');
const useClientIndex = lines.findIndex(line => line.includes("'use client'"));
if (useClientIndex > 0) {
    // Delete everything before 'use client'
    content = lines.slice(useClientIndex).join('\n');
}

// 2. Now properly replace the old PRODUCT MEDIA section
const oldMediaRegex = /<h3 className="font-mono text-\[10px\] font-bold tracking-widest text-\[#666666\] border-b border-\[rgba\(0,0,0,0\.03\)\] pb-3 uppercase mt-8">\s*PRODUCT MEDIA\s*<\/h3>[\s\S]*?<div className="w-full h-px bg-\[rgba\(0,0,0,0\.06\)\] my-2"><\/div>/;

const newMediaJSX = `<h3 className="font-mono text-[10px] font-bold tracking-widest text-[#666666] border-b border-[rgba(0,0,0,0.03)] pb-3 uppercase mt-8">
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
            </div>\n            <div className="w-full h-px bg-[rgba(0,0,0,0.06)] my-2"></div>`;

content = content.replace(oldMediaRegex, newMediaJSX);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed syntax error');
