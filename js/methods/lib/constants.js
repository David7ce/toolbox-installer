const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', '..');

const CONFIG = {
    root: ROOT,
    desktopFile: path.join(ROOT, 'pkgs', 'desktop-pkgs.json'),
    mobileFile: path.join(ROOT, 'pkgs', 'mobile-pkgs.json'),
    iconOutputDir: path.join(ROOT, 'img', 'apps'),
    fallbackIcon: path.join(ROOT, 'img', 'apps', 'files.svg'),
    simpleIconsUrl: 'https://cdn.simpleicons.org/',
    encoding: 'utf8',
    indentation: 2,
    timeoutMs: 15000,
};

const DESKTOP_PM_KEYS = [
    'linux_arch_aur',
    'linux_arch_pacman',
    'linux_debian_apt',
    'linux_fedora_rpm',
    'linux_gentoo_emerge',
    'linux_flatpak',
    'linux_snap',
    'freebsd_pkg',
    'macos_brew',
    'unix_nix_env',
    'windows_winget',
];

const MOBILE_PM_KEYS = [
    'android_pkg',
    'ios_pkg',
];

module.exports = {
    CONFIG,
    DESKTOP_PM_KEYS,
    MOBILE_PM_KEYS,
};
