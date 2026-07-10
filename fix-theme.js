const fs = require('fs');
const path = require('path');

// 1. Update globals.css
const globalsPath = path.join(__dirname, 'app', 'globals.css');
let globalsContent = fs.readFileSync(globalsPath, 'utf8');
globalsContent = globalsContent.replace(/--color-accent: #[0-9A-Fa-f]{6};/, '--color-accent: #D99A9A;');
globalsContent = globalsContent.replace(/--color-accent-hover: #[0-9A-Fa-f]{6};/, '--color-accent-hover: #C98A8A;');
fs.writeFileSync(globalsPath, globalsContent);

// Helper for replacements
function replaceColors(content) {
    let newContent = content;
    // page.tsx layout colors
    newContent = newContent.replace(/bg-\[#FDFBF7\]/g, 'bg-background');
    newContent = newContent.replace(/text-\[#212121\]/g, 'text-foreground');
    newContent = newContent.replace(/border-\[#212121\]/g, 'border-foreground');
    newContent = newContent.replace(/text-\[#D99A9A\]/g, 'text-accent');
    newContent = newContent.replace(/bg-\[#D99A9A\]/g, 'bg-accent');
    newContent = newContent.replace(/hover:bg-\[#C98A8A\]/g, 'hover:bg-accent-hover');
    newContent = newContent.replace(/hover:border-\[#D99A9A\]/g, 'hover:border-accent');
    newContent = newContent.replace(/hover:text-\[#D99A9A\]/g, 'hover:text-accent');
    newContent = newContent.replace(/border-\[#E8E3DC\]/g, 'border-border');
    newContent = newContent.replace(/text-\[#666666\]/g, 'text-muted');
    newContent = newContent.replace(/bg-\[#212121\]\/20/g, 'bg-foreground/20');
    newContent = newContent.replace(/text-\[#212121\]\/50/g, 'text-foreground/50');
    
    // products page inline styles
    newContent = newContent.replace(/style={{ color: '[^']+' }}/g, ''); // we will manually fix products page if needed, but let's try to remove inline color styles that are static
    newContent = newContent.replace(/style={{ color: sortParam === opt\.value \? '#C9A96E' : '#4A4642' }}/g, '');
    newContent = newContent.replace(/style={{ color: !categoryParam \? '#C9A96E' : '#4A4642' }}/g, '');
    newContent = newContent.replace(/style={{ color: categoryParam === cat\.slug \? '#C9A96E' : '#4A4642' }}/g, '');
    newContent = newContent.replace(/style={{ color: sizeParam === s \? '#C9A96E' : '#4A4642' }}/g, '');
    
    // products page specific tailwind additions for the removed inline styles
    // We will do this via more specific replaces
    return newContent;
}

// 2. Update page.tsx
const pagePath = path.join(__dirname, 'app', '(storefront)', 'page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');
pageContent = replaceColors(pageContent);
fs.writeFileSync(pagePath, pageContent);

// 3. Update products page
const productsPath = path.join(__dirname, 'app', '(storefront)', 'products', 'page.tsx');
let prodContent = fs.readFileSync(productsPath, 'utf8');

// Replace inline colors with tailwind active/inactive classes
prodContent = prodContent.replace(
    /className="text-left font-mono text-\[10px\] tracking-\[0\.12em\] py-1 transition-colors duration-200"\s*style={{ color: sortParam === opt\.value \? '#C9A96E' : '#4A4642' }}/g,
    'className={`text-left font-mono text-[10px] tracking-[0.12em] py-1 transition-colors duration-200 ${sortParam === opt.value ? "text-accent" : "text-muted hover:text-foreground"}`}'
);

prodContent = prodContent.replace(
    /className="text-left font-mono text-\[10px\] tracking-\[0\.12em\] py-1 transition-colors"\s*style={{ color: !categoryParam \? '#C9A96E' : '#4A4642' }}/g,
    'className={`text-left font-mono text-[10px] tracking-[0.12em] py-1 transition-colors ${!categoryParam ? "text-accent" : "text-muted hover:text-foreground"}`}'
);

prodContent = prodContent.replace(
    /className="text-left font-mono text-\[10px\] tracking-\[0\.12em\] py-1 transition-colors"\s*style={{ color: categoryParam === cat\.slug \? '#C9A96E' : '#4A4642' }}/g,
    'className={`text-left font-mono text-[10px] tracking-[0.12em] py-1 transition-colors ${categoryParam === cat.slug ? "text-accent" : "text-muted hover:text-foreground"}`}'
);

prodContent = prodContent.replace(
    /className="font-mono text-\[10px\] tracking-\[0\.12em\] text-center py-2 border transition-colors"\s*style={{[^}]+}}/g,
    'className={`font-mono text-[10px] tracking-[0.12em] text-center py-2 border transition-colors ${sizeParam === s ? "border-accent text-accent" : "border-border text-muted hover:border-foreground hover:text-foreground"}`}'
);

// Any leftover static '#9A9490' or '#4A4642' or '#C9A96E' in products page
prodContent = prodContent.replace(/style={{ color: '#9A9490' }}/g, 'className="text-muted"'); // this might conflict if className already exists
prodContent = prodContent.replace(/<h4 className="([^"]+)" style={{ color: '#9A9490' }}/g, '<h4 className="$1 text-foreground/60"');
prodContent = prodContent.replace(/<span className="ml-2" style={{ color: '#C9A96E' }}>/g, '<span className="ml-2 text-accent">');
prodContent = prodContent.replace(/background: 'rgba\(245,240,235,0\.05\)'/g, "background: 'var(--color-border)'");
prodContent = prodContent.replace(/style={{ height: '1px', background: 'rgba\(245,240,235,0\.05\)' }}/g, 'className="h-px bg-border w-full"');
prodContent = prodContent.replace(/<span className="ml-2">/g, '<span className="ml-2 text-accent">'); // ensure the little star uses accent

// other stuff
prodContent = prodContent.replace(/text-\[#111111\]/g, 'text-foreground');
prodContent = prodContent.replace(/text-\[#4A4642\]/g, 'text-muted');

fs.writeFileSync(productsPath, prodContent);

console.log("Theme fixed globally");
