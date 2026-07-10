const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'components/storefront/ProductDetails.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Image container fixes
content = content.replace(
  /className="relative w-full aspect-\[4\/5\] bg-card overflow-hidden border border-border group rounded-sm"[\s\S]*?onMouseMove=\{handleMouseMove\}[\s\S]*?onMouseLeave=\{handleMouseLeave\}/,
  `className="relative w-full aspect-[3/4] max-w-[85%] mx-auto bg-card overflow-hidden border border-border group rounded-sm"`
);

// 2. Remove zoom style states and handlers
content = content.replace(/const \[zoomStyle, setZoomStyle\] = useState[\s\S]*?\}\);/, '');
content = content.replace(/const handleMouseMove = \([\s\S]*?setZoomStyle\(\{ display: 'none', backgroundPosition: '0% 0%' \}\);\s*\};/, '');

// Remove magnifying glass overlay
content = content.replace(
  /\{\/\* Magnifying glass overlay box \*\/\}[\s\S]*?className="hidden md:block transition-\[background-position\] duration-75"\s*\/>/g,
  ''
);

// 3. Dynamic sizes and colors
content = content.replace(
  /const colors = \['BLACK', 'TACTICAL GREY', 'OFF-WHITE'\];\s*const sizes = product\.options[\s\S]*?\['S', 'M', 'L', 'XL'\];/,
  `const uniqueColors = new Set<string>();
  const uniqueSizes = new Set<string>();
  if (product.variants) {
    product.variants.forEach(v => {
      if (v.option_values && Array.isArray(v.option_values)) {
        v.option_values.forEach((ov: any) => {
          if (ov.option_name === 'Color') uniqueColors.add(ov.value);
          if (ov.option_name === 'Size') uniqueSizes.add(ov.value);
        });
      }
    });
  }
  const colors = Array.from(uniqueColors);
  const sizes = Array.from(uniqueSizes).length > 0 ? Array.from(uniqueSizes) : ['S', 'M', 'L', 'XL'];`
);

// 4. Update the color swatch rendering
const colorRenderSearch = `backgroundColor:
                          color === 'BLACK' ? '#111111' : color === 'TACTICAL GREY' ? '#555555' : '#EFEFEE',`;

content = content.replace(
  colorRenderSearch,
  `backgroundColor: (() => {
                          const match = color.match(/(.+?)\\s*\\((#[0-9a-fA-F]+)\\)/);
                          return match ? match[2] : '#212121';
                        })(),`
);

// Update tooltip text
content = content.replace(
  /SWATCH \/\/ COLOR: \{selectedColor\}/,
  `SWATCH // COLOR: {(() => {
                  const match = selectedColor.match(/(.+?)\\s*\\((#[0-9a-fA-F]+)\\)/);
                  return match ? match[1].trim() : selectedColor;
                })()}`
);

// Fix size selection visibility
content = content.replace(
  /selectedSize === size\s*\?\s*'bg-white text-white border-accent'/g,
  `selectedSize === size ? 'bg-accent text-white border-accent'`
);

fs.writeFileSync(file, content, 'utf8');
console.log('ProductDetails updated');
