const fs = require('fs');

const path = "c:\\Users\\nazal_bh8d5aa\\OneDrive\\Desktop\\zelix org\\components\\storefront\\ProductDetails.tsx";

let content = fs.readFileSync(path, 'utf8');

const replacements = [
    [/bg-black/g, 'bg-background'],
    [/text-white/g, 'text-foreground'],
    [/bg-neutral-950/g, 'bg-card'],
    [/bg-neutral-900/g, 'bg-muted/30'],
    [/text-neutral-500/g, 'text-muted'],
    [/text-neutral-400/g, 'text-muted'],
    [/text-neutral-300/g, 'text-foreground/80'],
    [/text-neutral-700/g, 'text-muted/50'],
    [/border-white\/5/g, 'border-border'],
    [/border-white\/10/g, 'border-border'],
    [/border-white\/30/g, 'border-accent'],
    [/border-white/g, 'border-accent'],
    [/hover:text-white/g, 'hover:text-accent'],
    [/fill-white/g, 'fill-accent'],
    [/text-\[#C9A96E\]/g, 'text-accent'],
    [/fill-\[#C9A96E\]/g, 'fill-accent'],
    [/bg-\[#C9A96E\]/g, 'bg-accent'],
    [/hover:bg-\[#E8CFA0\]/g, 'hover:bg-accent-hover'],
    [/shadow-\[0_4px_20px_rgba\(201,169,110,0\.15\)\]/g, 'shadow-sm'],
    [/text-black/g, 'text-white'], 
    [/font-mono/g, 'font-sans'],
    [/font-black/g, 'font-bold'],
];

for (const [oldRegex, newStr] of replacements) {
    content = content.replace(oldRegex, newStr);
}

// Fix headings to use font-serif
content = content.replace(/(<h[1-6].*?)font-sans(.*?)(>)/g, '$1font-serif$2$3');

fs.writeFileSync(path, content, 'utf8');

console.log("ProductDetails updated successfully.");
