import re

path = r"c:\Users\nazal_bh8d5aa\OneDrive\Desktop\zelix org\components\storefront\ProductDetails.tsx"

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace specific styles
replacements = [
    (r'bg-black', 'bg-background'),
    (r'text-white', 'text-foreground'),
    (r'bg-neutral-950', 'bg-card'),
    (r'bg-neutral-900', 'bg-muted/30'),
    (r'text-neutral-500', 'text-muted'),
    (r'text-neutral-400', 'text-muted'),
    (r'text-neutral-300', 'text-foreground/80'),
    (r'text-neutral-700', 'text-muted/50'),
    (r'border-white/5', 'border-border'),
    (r'border-white/10', 'border-border'),
    (r'border-white/30', 'border-accent'),
    (r'border-white', 'border-accent'),
    (r'hover:text-white', 'hover:text-accent'),
    (r'fill-white', 'fill-accent'),
    (r'text-[#C9A96E]', 'text-accent'),
    (r'fill-[#C9A96E]', 'fill-accent'),
    (r'bg-[#C9A96E]', 'bg-accent'),
    (r'hover:bg-[#E8CFA0]', 'hover:bg-accent-hover'),
    (r'shadow-\[0_4px_20px_rgba\(201,169,110,0\.15\)\]', 'shadow-sm'),
    (r'text-black', 'text-white'), # Accent button text
    (r'font-mono', 'font-sans'),
    (r'font-black', 'font-bold'),
]

for old, new in replacements:
    content = re.sub(old, new, content)

# Specific fixes for headings
content = re.sub(r'(<h1.*?)(font-sans)(.*?)(>)', r'\1font-serif\3\4', content)
content = re.sub(r'(<h2.*?)(font-sans)(.*?)(>)', r'\1font-serif\3\4', content)
content = re.sub(r'(<h3.*?)(font-sans)(.*?)(>)', r'\1font-serif\3\4', content)
content = re.sub(r'(<h4.*?)(font-sans)(.*?)(>)', r'\1font-serif\3\4', content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("ProductDetails updated successfully.")
