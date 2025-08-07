# Basic usage.

# toolbox_installer

A cross-platform interactive package installer.

## Usage

```sh
# Interactively select and install
toolbox

# Only show commands, don't execute
toolbox --no-execute

# Export your selection for later reuse
toolbox --export my-selection.json

# Import a previous selection
toolbox --import my-selection.json

# Specify a different package list
toolbox --file path/to/packages-info.json
```

## Requirements

- Python 3.7+
- `pip install inquirer`
