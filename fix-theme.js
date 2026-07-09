const fs = require('fs');
const path = require('path');

const directory = 'c:/Users/nazal_bh8d5aa/OneDrive/Desktop/zelix org/app/(admin)/admin';

const replacements = [
  { regex: /bg-\[#0A0A0A\]/g, replacement: 'bg-[#FFFFFF]' },
  { regex: /bg-\[#0F0F0F\]/g, replacement: 'bg-[#FFFFFF]' },
  { regex: /bg-\[#111111\]/g, replacement: 'bg-[#FAFAFA]' },
  { regex: /bg-\[#050507\]/g, replacement: 'bg-[#FAFAFA]' },
  { regex: /bg-\[#09090A\]/g, replacement: 'bg-[#FAFAFA]' },
  { regex: /bg-\[#000\]/g, replacement: 'bg-[#FAFAFA]' },
  { regex: /text-\[#F5F0EB\]/g, replacement: 'text-[#111111]' },
  { regex: /text-white/g, replacement: 'text-[#111111]' },
  { regex: /border-\[rgba\(245,240,235,0\.06\)\]/g, replacement: 'border-[rgba(0,0,0,0.06)]' },
  { regex: /border-\[rgba\(245,240,235,0\.03\)\]/g, replacement: 'border-[rgba(0,0,0,0.03)]' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const { regex, replacement } of replacements) {
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(directory);
