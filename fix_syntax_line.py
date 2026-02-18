path = "src/app/nandix/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

found = False
for i, line in enumerate(lines):
    if "createRoom" in line and "const id =" in line:
        print(f"Found line {i}: {line.strip()}")
        lines[i] = '                                    const id = await createRoom(name, myId || "anonymous");\n'
        found = True

if found:
    with open(path, "w", encoding="utf-8") as f:
        f.writelines(lines)
    print("Fixed syntax error in page.tsx")
else:
    print("Line not found.")
