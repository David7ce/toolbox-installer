#!/bin/bash

input_file="../packages-info.json"

output_file="../list/list-pkgs.txt"

jq -r '.packages[] | .name' "$input_file" > "$output_file"
