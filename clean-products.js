const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'app', '(storefront)', 'products', 'page.tsx');
let prodContent = fs.readFileSync(productsPath, 'utf8');

// Replace hex codes anywhere in the file with standard Tailwind class equivalents if they are in className
prodContent = prodContent.replace(/text-\[#C9A96E\]/g, 'text-accent');
prodContent = prodContent.replace(/text-\[#4A4642\]/g, 'text-muted');
prodContent = prodContent.replace(/border-\[#C9A96E\]/g, 'border-accent');
prodContent = prodContent.replace(/bg-\[#C9A96E\]/g, 'bg-accent');
prodContent = prodContent.replace(/text-\[#111111\]/g, 'text-foreground');
prodContent = prodContent.replace(/text-\[#080808\]/g, 'text-white');

// For style={{ ... }} we can replace the actual strings
prodContent = prodContent.replace(/'#C9A96E'/g, "'var(--color-accent)'");
prodContent = prodContent.replace(/'#4A4642'/g, "'var(--color-muted)'");
prodContent = prodContent.replace(/'#080808'/g, "'#ffffff'");
prodContent = prodContent.replace(/'#FAFAFA'/g, "'var(--color-card)'");
prodContent = prodContent.replace(/rgba\(201,169,110,/g, "rgba(217,154,154,"); // D99A9A in rgba is approx 217,154,154
prodContent = prodContent.replace(/rgba\(245,240,235,/g, "rgba(232,227,220,"); // E8E3DC border in rgba

fs.writeFileSync(productsPath, prodContent);

console.log("Products page cleaned!");
