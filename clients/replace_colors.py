import os
import re

directories = [
    r"C:\Users\USER\OneDrive\Desktop\coding\medvault+\medvaults\clients\app",
    r"C:\Users\USER\OneDrive\Desktop\coding\medvault+\medvaults\clients\components"
]

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace purple accents with Teal (#009b7c)
    new_content = re.sub(r'#(a855f7|b9b9e3|8b5cf6|c084fc)', '#009b7c', content, flags=re.IGNORECASE)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for directory in directories:
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.jsx') or file.endswith('.tsx'):
                replace_in_file(os.path.join(root, file))

print("Done.")
