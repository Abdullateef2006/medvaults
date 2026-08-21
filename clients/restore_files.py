import json
import sys

transcript_path = r'C:\Users\USER\.gemini\antigravity-ide\brain\4291e566-cc17-4185-84b3-6b62cefed2be\.system_generated\logs\transcript_full.jsonl'
output_dir = r'C:\Users\USER\OneDrive\Desktop\coding\medvault+\medvaults\clients\restored_files'

import os
os.makedirs(output_dir, exist_ok=True)

files_to_restore = [
    'app/(tabs)/_layout.tsx',
    'app/(tabs)/gethealthtips.jsx',
    'app/(tabs)/index.jsx',
    'app/(tabs)/profile.jsx',
    'app/(tabs)/food_scan.jsx',
    'app/(tabs)/scan_history.jsx',
    'app/(tabs)/save_money.jsx',
    'app/emergency-profile.jsx',
    'app/health_setup.jsx',
    'app/login.jsx',
    'app/register.jsx',
    'app/food_scanner.jsx',
    'components/CircularTabButton.tsx'
]

file_contents = {k: None for k in files_to_restore}

# Also capture multi_replace_file_content TargetContent
for line in open(transcript_path, 'r', encoding='utf-8'):
    try:
        data = json.loads(line)
        if data.get('type') == 'PLANNER_RESPONSE':
            for tc in data.get('tool_calls', []):
                if tc['name'] == 'multi_replace_file_content' or tc['name'] == 'replace_file_content':
                    target = tc['arguments'].get('TargetFile', '')
                    for f in files_to_restore:
                        if target.endswith(f.replace('/', '\\')):
                            # We might have TargetContent which gives us original text, 
                            # but it's not the full file.
                            pass
        elif data.get('type') == 'TOOL_RESPONSE':
            # look for view_file
            if 'File Path: `file:///C:/Users/USER/OneDrive/Desktop/coding/medvault+/medvaults/clients/app' in data.get('content', ''):
                lines = data['content'].split('\n')
                file_path = None
                content_lines = []
                capturing = False
                for l in lines:
                    if l.startswith('File Path: `'):
                        file_path = l.split('`')[1]
                    if capturing and l.startswith('The above content'):
                        capturing = False
                    if capturing:
                        # remove the line number prefix e.g. "1: "
                        parts = l.split(': ', 1)
                        if len(parts) == 2 and parts[0].isdigit():
                            content_lines.append(parts[1])
                        else:
                            content_lines.append(l)
                    if l.startswith('The following code has been modified to include a line number'):
                        capturing = True
                if file_path:
                    for f in files_to_restore:
                        url_path = f.replace('(', '%28').replace(')', '%29')
                        if url_path in file_path:
                            file_contents[f] = '\n'.join(content_lines)
    except Exception as e:
        print(f"Error parsing line: {e}")

for f, content in file_contents.items():
    if content:
        out_path = os.path.join(output_dir, os.path.basename(f))
        with open(out_path, 'w', encoding='utf-8') as outfile:
            outfile.write(content)
        print(f"Restored {f}")
    else:
        print(f"Could not find full content for {f}")
