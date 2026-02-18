import sys

path = "src/app/nandix/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'const id = await createRoom(name, myId || " anonymous\\);' in line:
        print(f"Fixing line {i+1}")
        lines[i] = line.replace('const id = await createRoom(name, myId || " anonymous\\);', 'const id = await createRoom(name, myId || "anonymous");')

with open(path, "w", encoding="utf-8") as f:
    f.writelines(lines)
