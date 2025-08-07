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