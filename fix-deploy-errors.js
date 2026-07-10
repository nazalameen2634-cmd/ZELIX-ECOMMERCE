const fs = require('fs');
const path = require('path');

// 1. Fix ProductDetails.tsx
const pdFile = path.join(__dirname, 'components/storefront/ProductDetails.tsx');
let pdContent = fs.readFileSync(pdFile, 'utf8');

// Replace the lines with onMouseMove and onMouseLeave
pdContent = pdContent.replace(
  /onMouseMove=\{handleMouseMove\}\s*onMouseLeave=\{handleMouseLeave\}/g,
  ''
);
// Fix the implicit any in the map function
pdContent = pdContent.replace(
  /\{productImages\.map\(\(img, idx\) => \(/g,
  '{productImages.map((img: string, idx: number) => ('
);
fs.writeFileSync(pdFile, pdContent, 'utf8');
console.log('Fixed ProductDetails.tsx');

// 2. Fix dynamic server error in API route
const trackFile = path.join(__dirname, 'app/api/orders/track/route.ts');
let trackContent = fs.readFileSync(trackFile, 'utf8');

if (!trackContent.includes("export const dynamic = 'force-dynamic';")) {
  trackContent = "export const dynamic = 'force-dynamic';\n" + trackContent;
  fs.writeFileSync(trackFile, trackContent, 'utf8');
  console.log('Fixed track route.ts');
}

// 3. Fix TS errors in Header.tsx
const headerFile = path.join(__dirname, 'components/storefront/Header.tsx');
let headerContent = fs.readFileSync(headerFile, 'utf8');

// Fix 'any' implicit types in NAV_LINKS sub
headerContent = headerContent.replace(
  /\{link\.sub\.map\(\(sub\) => \(/g,
  '{link.sub.map((sub: any) => ('
);

fs.writeFileSync(headerFile, headerContent, 'utf8');
console.log('Fixed Header.tsx');
