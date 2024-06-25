import json

input_file = '../packages-info.json'

output_file = '../list/list-pkgs.txt'

with open(input_file, 'r') as f:
    data = json.load(f)

names = [package['name'] for package in data['packages'].values()]

with open(output_file, 'w') as f:
    for name in names:
        f.write(name + '\n')
