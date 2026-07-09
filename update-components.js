const fs = require('fs');
const path = require('path');

const directory = 'c:/Users/nazal_bh8d5aa/OneDrive/Desktop/zelix org/app/(admin)/admin';

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      // Add theme="light" to <Input ...> if not already there
      if (content.includes('<Input') && !content.includes('theme="light"')) {
        content = content.replace(/<Input([\s\S]*?)>/g, (match, p1) => {
          if (p1.includes('theme=')) return match;
          return `<Input theme="light"${p1}>`;
        });
        changed = true;
      }
      
      // Add theme="light" to <Modal ...> if not already there
      if (content.includes('<Modal') && !content.includes('theme="light"')) {
        content = content.replace(/<Modal([\s\S]*?)>/g, (match, p1) => {
          if (p1.includes('theme=')) return match;
          return `<Modal theme="light"${p1}>`;
        });
        changed = true;
      }

      // Also fix the invisible button text
      const buttonRegex = /bg-black([\s\S]*?)text-\[#111111\]/g;
      if (buttonRegex.test(content)) {
        content = content.replace(buttonRegex, 'bg-black$1text-[#FFFFFF]');
        changed = true;
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(directory);
