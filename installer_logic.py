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