 
**Features:**
- Loads package data from JSON (categorized, multi-platform commands)
- Detects OS (Windows/macOS/Linux distros)
- Interactive multi-select (with inquirer)
- Import/export selections as JSON
- Generates and optionally executes install commands
- Emoji-enhanced output
- `toolbox` command installed via `setup.py`

Below is a ready-to-use file structure and content.  
---

## 1. `pkgs/packages-info.json`
*Not shown here as you already have it in your repo, and it may be large. The app expects this file at `pkgs/packages-info.json`.*

---

## 2. `installer_logic.py`
Handles loading packages, OS detection, command building, import/export, and execution.

```python
import os
import json
import platform
from typing import List, Dict, Any

PKG_JSON_PATH = os.path.join(os.path.dirname(__file__), "pkgs", "packages-info.json")

def load_packages() -> Dict[str, Any]:
    with open(PKG_JSON_PATH, encoding="utf-8") as f:
        return json.load(f)

def detect_platform() -> Dict[str, str]:
    sys = platform.system()
    if sys == "Windows":
        return {"os": "windows", "manager": "winget"}
    elif sys == "Darwin":
        return {"os": "macos", "manager": "brew"}
    elif sys == "Linux":
        # Detect package manager
        for mgr in ["apt", "dnf", "pacman"]:
            if os.system(f"which {mgr} > /dev/null 2>&1") == 0:
                return {"os": "linux", "manager": mgr}
        return {"os": "linux", "manager": "unknown"}
    else:
        return {"os": "unknown", "manager": "unknown"}

def build_install_commands(selection: List[str], packages: Dict[str, Any], manager: str) -> List[str]:
    cmds = []
    # Flatten all packages into {pkg_name: {info}}
    pkg_lookup = {p['name']: p for group in packages.values() for p in group}
    for name in selection:
        pkg = pkg_lookup.get(name)
        if not pkg:
            continue
        cmd = pkg.get("install", {}).get(manager)
        if cmd:
            cmds.append(cmd)
    return cmds

def export_selection(selection: List[str], filename: str):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(selection, f, indent=2)

def import_selection(filename: str) -> List[str]:
    with open(filename, encoding="utf-8") as f:
        return json.load(f)
```

---

## 3. `cli_full.py`
The command line entry point using argparse and inquirer.

```python
import argparse
import sys
from installer_logic import (
    load_packages, detect_platform, build_install_commands,
    export_selection, import_selection
)
import inquirer

EMOJI = {
    "success": "✅",
    "warn": "⚠️",
    "rocket": "🚀",
    "pkg": "📦"
}

def main():
    parser = argparse.ArgumentParser(description="toolbox: Multi-platform package installer.")
    parser.add_argument("--import", dest="import_file", help="Import selection from JSON file")
    parser.add_argument("--export", dest="export_file", help="Export selection to JSON file")
    parser.add_argument("--no-execute", action="store_true", help="Only show install commands, do not execute")
    parser.add_argument("--file", dest="pkg_file", help="Path to packages-info.json", default=None)
    args = parser.parse_args()

    # Load and optionally override package file
    packages = load_packages() if not args.pkg_file else json.load(open(args.pkg_file))
    platform_info = detect_platform()
    manager = platform_info["manager"]
    print(f"{EMOJI['rocket']} Detected platform: {platform_info['os']} (manager: {manager})")

    # Get selection (import or interactive)
    if args.import_file:
        selection = import_selection(args.import_file)
        print(f"{EMOJI['success']} Imported package selection from {args.import_file}")
    else:
        selection = []
        for group, pkgs in packages.items():
            choices = [inquirer.Checkbox(
                group,
                message=f"Select {group}",
                choices=[f"{EMOJI['pkg']} {p['name']} - {p.get('desc','')}" for p in pkgs]
            )]
            answers = inquirer.prompt(choices)
            selected = [c.split(" ",2)[1] for c in answers[group]] if answers and group in answers else []
            selection.extend(selected)

    if args.export_file:
        export_selection(selection, args.export_file)
        print(f"{EMOJI['success']} Exported selection to {args.export_file}")

    # Build commands
    commands = build_install_commands(selection, packages, manager)
    if not commands:
        print(f"{EMOJI['warn']} No install commands generated for your platform.")
        sys.exit(1)

    print(f"{EMOJI['rocket']} Generated install commands:")
    for c in commands:
        print(f"  {EMOJI['pkg']} {c}")

    if not args.no_execute:
        print(f"{EMOJI['rocket']} Executing install commands...")
        for c in commands:
            ret = os.system(c)
            if ret == 0:
                print(f"{EMOJI['success']} Installed: {c}")
            else:
                print(f"{EMOJI['warn']} Failed: {c}")

if __name__ == "__main__":
    main()
```

---

## 4. `setup.py`
Registers the CLI as `toolbox` command.

```python
from setuptools import setup, find_packages

setup(
    name="toolbox_installer",
    version="1.0.0",
    description="Multi-platform interactive package installer",
    author="David7ce",
    packages=find_packages(),
    install_requires=[
        "inquirer",
    ],
    entry_points={
        "console_scripts": [
            "toolbox=cli_full:main"
        ]
    },
    include_package_data=True,
    package_data={"": ["pkgs/packages-info.json"]}
)
```

---

## 5. `README.md`
Basic usage.

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
