// Módulo para renderizar la tabla de paquetes (desktop y mobile)
export function getPackagesJsonUrl() {
    const path = window.location.pathname;
    if (path.includes('mobile')) {
        return './pkgs/packages-info-mobile.json';
    } else if (path.includes('desktop')) {
        return './pkgs/packages-info-desktop.json';
    }
    return './pkgs/packages-info.json';
}

function buildPlayStoreUrl(androidPackageName) {
    return `https://play.google.com/store/apps/details?id=${encodeURIComponent(androidPackageName)}`;
}

function buildAppleStoreUrl(iosPackageName) {
    return `https://apps.apple.com/app/${iosPackageName}`;
}

function createLinkCell(url, label, iconText) {
    const cell = document.createElement('td');
    if (!url || url.trim() === '') {
        cell.textContent = '-';
        return cell;
    }
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.classList.add('store-link');
    const icon = document.createElement('span');
    icon.classList.add('store-icon');
    icon.textContent = iconText;
    const text = document.createElement('span');
    text.textContent = label;
    link.appendChild(icon);
    link.appendChild(text);
    cell.appendChild(link);
    return cell;
}

export function renderPackagesTable(data) {
    const tbody = document.querySelector('#packagesTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    const packageEntries = Object.entries(data?.packages || {});
    packageEntries
        .sort(([, a], [, b]) => (a.name || '').localeCompare(b.name || ''))
        .forEach(([, pkgInfo]) => {
            const packageName = pkgInfo?.name || '-';
            const androidPackageName = pkgInfo?.package_manager?.android_pkg?.trim() || '';
            const iosPackageName = pkgInfo?.package_manager?.ios_pkg?.trim() || '';
            const row = document.createElement('tr');
            const packageNameCell = document.createElement('td');
            packageNameCell.textContent = packageName;
            const androidPackageCell = document.createElement('td');
            androidPackageCell.textContent = androidPackageName || '-';
            const iosPackageCell = document.createElement('td');
            iosPackageCell.textContent = iosPackageName || '-';
            const androidUrl = androidPackageName ? buildPlayStoreUrl(androidPackageName) : '';
            const iosUrl = iosPackageName ? buildAppleStoreUrl(iosPackageName) : '';
            const androidLinkCell = createLinkCell(androidUrl, 'Play Store', '▶');
            const iosLinkCell = createLinkCell(iosUrl, 'App Store', '');
            row.appendChild(packageNameCell);
            row.appendChild(androidPackageCell);
            row.appendChild(iosPackageCell);
            row.appendChild(androidLinkCell);
            row.appendChild(iosLinkCell);
            tbody.appendChild(row);
        });
}

export async function loadPackagesTable() {
    const tbody = document.querySelector('#packagesTable tbody');
    try {
        const response = await fetch(getPackagesJsonUrl());
        if (!response.ok) {
            throw new Error(`Failed to load packages data: ${response.statusText}`);
        }
        const data = await response.json();
        renderPackagesTable(data);
    } catch (error) {
        console.error('Error loading table data:', error);
        if (tbody) tbody.innerHTML = '<tr><td colspan="5">Could not load package table.</td></tr>';
    }
}
