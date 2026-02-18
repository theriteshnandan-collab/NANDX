import re

path = "src/app/nandix/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Pattern slightly flexible to catch variations
pattern = r'const id = await createRoom\(name, myId \|\| "[\s\S]*?\\?\);'
replacement = 'const id = await createRoom(name, myId || "anonymous");'

new_content = re.sub(pattern, replacement, content)

if new_content != content:
    print("Fixed syntax error in page.tsx")
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)
else:
    print("Pattern not found, no changes made.")
