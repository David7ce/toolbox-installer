import json
import shutil

input_file = "pkgs-names.json"

# Check if input file exists
try:
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
except FileNotFoundError:
    print(f"Error: Input file '{input_file}' not found.")
    exit(1)
except json.JSONDecodeError as e:
    print(f"Error decoding JSON: {e}")
    exit(1)

# Sort each object within the JSON
for key in data:
    data[key] = dict(sorted(data[key].items()))

# Write sorted JSON back to the original file
try:
    with open(input_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
except Exception as e:
    print(f"Error writing JSON to file: {e}")
    exit(1)

print(f"JSON sorted successfully and saved to {input_file}")
