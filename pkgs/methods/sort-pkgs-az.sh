#!/bin/bash

input_file="../pkgs-names.json"

# Check if input file exists
if [ ! -f "$input_file" ]; then
  echo "Error: Input file '$input_file' not found."
  exit 1
fi

# Use jq to read and process the JSON and overwrite the original file
jq '. as $input | reduce keys[] as $k ({}; .[$k] = ($input[$k] | to_entries | sort_by(.key) | from_entries))' "$input_file" > "$input_file.tmp"

# Check if jq produced valid JSON
if [ $? -ne 0 ]; then
  echo "Error: Failed to parse or process JSON using jq."
  exit 1
fi

# Move the temporary file back to the original input file
mv "$input_file.tmp" "$input_file"

echo "JSON sorted successfully and saved to $input_file"
