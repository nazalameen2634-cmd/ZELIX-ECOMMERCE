const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'app/(admin)/admin/products/page.tsx');
let content = fs.readFileSync(file, 'utf8');

const regex = /\{formFields\.hasColors && \([\s\S]*?<Input theme="light" label="AVAILABLE COLORS \(COMMA SEPARATED\)" value=\{availableColors\} onChange=\{\(e\) => setAvailableColors\(e\.target\.value\)\} \/>[\s\S]*?<p className="text-\[9px\] text-\[#666666\] mt-1 font-mono uppercase tracking-widest">[\s\S]*?Format: Name \(#hex\), Name \(#hex\)\. Example: Matte Black \(#121212\)[\s\S]*?<\/p>[\s\S]*?\)\}/;

const replacementStr = `{formFields.hasColors && (
                  <>
                    <Input theme="light" label="AVAILABLE COLORS (COMMA SEPARATED)" value={availableColors} onChange={(e) => setAvailableColors(e.target.value)} />
                    <p className="text-[9px] text-[#666666] mt-1 font-mono uppercase tracking-widest">
                      Format: Name (#hex), Name (#hex). Example: Matte Black (#121212)
                    </p>
                  </>
                )}`;

content = content.replace(regex, replacementStr);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed fragment');
