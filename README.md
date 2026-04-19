# Toolbox Installer: Universal Command Installer Generator

Easily generate installation commands for popular software packages across all major desktop operating systems. This project provides a unified reference for package managers and repositories, making it simple to find and install software whether you're on Windows, macOS, or Linux.

## Features

- Quick lookup for package managers and their repositories
- Cross-platform: Windows, macOS, and multiple Linux distributions
- Direct links to official package repositories
- Designed for automation and scripting

## Supported Operating Systems & Package Managers

| OS               | Package Manager | Repository / Link                                                                |
|------------------|-----------------|----------------------------------------------------------------------------------|
| Windows          | winget          | [Winget pkgs](https://github.com/microsoft/winget-pkgs)                          |
| Linux (Arch)     | pacman          | [Arch pkgs](https://archlinux.org/packages/) + [AUR](https://aur.archlinux.org/) |
| Linux (Debian)   | deb             | [Debian pkgs](https://packages.debian.org/stable/)                               |
| Linux (Fedora)   | rpm             | [Fedora pkgs](https://packages.fedoraproject.org/index-static.html)              |
| Linux (Gentoo)   | emerge          | [Gentoo pkgs](https://packages.gentoo.org/)                                      |
| Linux (generic)  | flatpak         | [Flathub](https://flathub.org/)                                                  |
| Linux (generic)  | nix             | [Nixpkgs](https://search.nixos.org/packages)                                     |
| Linux (generic)  | snap            | [Snap Store](https://snapcraft.io/store)                                         |
| macOS            | brew            | [Homebrew](https://formulae.brew.sh/cask/)                                       |
| FreeBSD          | pkg             | [FreeBSD pkgs](https://www.freshports.org/)                                      |

## Usage

1. Clone this repository or open the web interface.
2. Select your operating system and desired package manager.
3. Search for the software you want to install.
4. Copy the generated install command and run it in your terminal.

## Validation (winget)

Validate `windows_winget` package IDs using the winget.run API:

```sh
node .\pkgs\methods\validate-winget.js --target desktop --write .\pkgs\methods\winget-report.json
```

Optional flags:

- `--limit 10` to keep more suggestions for missing IDs
- `--delay-ms 200` to slow down requests

## Add Packages Workflow

Primary flow to add packages in the new architecture:

```sh
node .\pkgs\methods\add-package.js --target <desktop|mobile|all> --id <id> --name "<Name>" --category "<Category>" --subcategory "<Subcategory>" [package manager fields]
```

The workflow performs all required steps:

1. Validates and writes package info into `desktop-pkgs.json` and/or `mobile-pkgs.json`.
2. Downloads SVG icon (or fallback) and minimizes it.
3. Sorts JSON files A-Z using generic sorter.
4. Regenerates package list at `pkgs/list/list-packages.json`.

## Sort Pkgs JSON (Generic)

Sort all `*-pkgs.json` files:

```sh
node .\pkgs\methods\sort-pkgs-az.js
```

Sort specific file/targets:

```sh
node .\pkgs\methods\sort-pkgs-az.js desktop
node .\pkgs\methods\sort-pkgs-az.js mobile-pkgs.json
```

## Extract Package List

Generate sorted unique package names list from desktop and mobile JSON files:

```sh
node .\pkgs\methods\extract-pkgs.js
```

## Example

To install VLC on Windows using winget:

```sh
winget install VideoLAN.VLC
```

To install VLC on Arch Linux:

```sh
sudo pacman -S vlc
```

## Contributing

Contributions are welcome! Please submit issues or pull requests for new package managers, improvements, or bug fixes.

## License

MIT License
