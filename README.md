# Toolbox Installer

A static web tool for generating install commands for popular software across multiple platforms.

## Pages

| Page | Description |
|------|-------------|
| [Desktop](desktop.html) | Install commands for desktop apps (Windows, macOS, Linux, FreeBSD) |
| [VS Code](vscode.html) | VS Code extension installer (`code --install-extension`) |
| [Browser Extensions](browser.html) | Firefox & Chromium extension links |
| [Libraries](lib.html) | Language library installer (npm, pip, cargo, Maven, dotnet…) |
| [Library Compatibility](lib-compatibility.html) | Cross-language library comparison table |
| [Desktop OS Compatibility](desktop-os-compatibility.html) | Desktop software availability by OS |
| [VS Code Compatibility](vscode-extensions-compatibility.html) | VS Code extension table |
| [Browser Compatibility](browser-extensions-compatibility.html) | Browser extension table |

## Supported Package Managers (Desktop)

| OS | Package Manager |
|----|----------------|
| Windows | winget |
| macOS | brew |
| Linux (Arch) | pacman, AUR |
| Linux (Debian) | apt |
| Linux (Fedora) | dnf |
| Linux (Gentoo) | emerge |
| Linux (generic) | flatpak, snap, nix |
| FreeBSD | pkg |

## Adding Packages (Desktop / Mobile)

```sh
node .\js\methods\add-package.js --target <desktop|mobile|all> --id <id> --name "<Name>" --category "<Category>" --subcategory "<Subcategory>" [package manager fields]
```

This validates and writes to the JSON, downloads the icon, sorts the file, and regenerates the package list.

## Sorting JSON Files

```sh
node .\js\methods\sort-pkgs-az.js .\pkgs\desktop-pkgs.json .\pkgs\mobile-pkgs.json .\pkgs\vscode-extensions-pkgs.json
```

## Regenerate Package List

```sh
node .\js\methods\extract-pkgs.js .\pkgs\desktop-pkgs.json .\pkgs\mobile-pkgs.json --output .\pkgs\list\list-packages.json
```

## License

MIT
