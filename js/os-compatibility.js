/**
 * OS Compatibility Table Script
 * Handles package data loading, sorting, filtering, and statistics
 */

// ============================================================================
// GLOBAL VARIABLES
// ============================================================================
let packagesData = [];
let filteredPackages = [];
let currentSort = { column: 'name', direction: 'asc' };
let activeOsFilters = new Set(['all']);
const windowsNonWingetPackages = [
    { id: 'ardour', name: 'Ardour' },
    { id: 'davinci-resolve', name: 'DaVinci Resolve' },
    { id: 'eaglemode', name: 'Eagle-Mode' },
    { id: 'freefilesync', name: 'FreeFileSync' },
    { id: 'mediawiki', name: 'MediaWiki' },
    { id: 'moodle', name: 'Moodle' },
    { id: 'stability-matrix', name: 'StabilityMatrix' },
    { id: 'strawberry', name: 'Strawberry' },
    { id: 'vmware', name: 'VMware' }
];
const windowsNonWingetIds = new Set(windowsNonWingetPackages.map(pkg => pkg.id));

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

// Load package data
async function loadPackages() {
    try {
        const response = await fetch('pkgs/packages-info.json');
        const data = await response.json();
        
        packagesData = Object.entries(data.packages).map(([id, pkg]) => {
            const pm = pkg.package_manager;

            const isPresent = (value) => {
                if (typeof value === 'string') {
                    return value.trim().length > 0;
                }
                return value !== null && value !== undefined;
            };

            // Check OS availability based on package_manager entries
            const hasWinget = isPresent(pm?.windows_winget);
            const isNonWingetWindows = windowsNonWingetIds.has(id);
            const hasWindows = hasWinget || isNonWingetWindows;
            const hasMacOS = isPresent(pm?.macos_brew);
            const hasLinux = [
                pm?.linux_arch_pacman,
                pm?.linux_arch_aur,
                pm?.linux_debian_apt,
                pm?.linux_fedora_rpm,
                pm?.linux_gentoo_emerge,
                pm?.linux_flatpak,
                pm?.linux_snap,
                pm?.unix_nix_env
            ].some(isPresent);
            const hasFreeBSD = isPresent(pm?.freebsd_pkg);

            return {
                id,
                name: pkg.name,
                category: pkg.category,
                subcategory: pkg.subcategory,
                windows: hasWindows,
                windowsStatus: hasWinget ? 'winget' : (isNonWingetWindows ? 'non-winget' : 'none'),
                macos: hasMacOS,
                linux: hasLinux,
                freebsd: hasFreeBSD
            };
        });

        sortTable('name', 'asc');
        setupFilters();
        applyFilters();
    } catch (error) {
        console.error('Error loading packages:', error);
        document.getElementById('tableBody').innerHTML = 
            '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #999;">Error loading data</td></tr>';
    }
}

// Render table
function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    filteredPackages.forEach(pkg => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="sticky-col category-col"><span class="category-badge">${pkg.category}</span></td>
            <td class="sticky-col app-col">
                <div class="app-info">
                    <img class="app-logo" src="img/${pkg.id}.svg" 
                         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2232%22 height=%2232%22%3E%3Crect width=%2232%22 height=%2232%22 fill=%22%23ddd%22 rx=%224%22/%3E%3Ctext x=%2216%22 y=%2220%22 font-size=%2216%22 text-anchor=%22middle%22 fill=%22%23999%22%3E${pkg.name.charAt(0)}%3C/text%3E%3C/svg%3E'" 
                         alt="${pkg.name}">
                    <span class="app-name">${pkg.name}</span>
                </div>
            </td>
            <td class="os-available">${pkg.windowsStatus === 'winget' ? '✅' : (pkg.windowsStatus === 'non-winget' ? '⚠️' : '❌')}</td>
            <td class="os-available">${pkg.macos ? '✅' : '❌'}</td>
            <td class="os-available">${pkg.linux ? '✅' : '❌'}</td>
            <td class="os-available">${pkg.freebsd ? '✅' : '❌'}</td>
        `;
        tbody.appendChild(row);
    });
}

// Toggle sort direction
function toggleSort(column) {
    if (currentSort.column === column) {
        // Toggle direction if same column
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        // Default to ascending for new column
        currentSort.column = column;
        currentSort.direction = 'asc';
    }
    
    sortTable(column, currentSort.direction);
}

// Sort table
function sortTable(column, direction) {
    currentSort = { column, direction };

    packagesData.sort((a, b) => {
        let valA = a[column].toLowerCase();
        let valB = b[column].toLowerCase();

        if (direction === 'asc') {
            return valA < valB ? -1 : valA > valB ? 1 : 0;
        } else {
            return valA > valB ? -1 : valA < valB ? 1 : 0;
        }
    });

    applyFilters();
    updateSortArrows();
    updateSortAria();
}

// Update sort arrow indicators
function updateSortArrows() {
    document.querySelectorAll('.sort-arrow').forEach(arrow => {
        arrow.classList.remove('active');
    });

    const activeArrow = document.querySelector(
        `.sort-arrow[data-column="${currentSort.column}"][data-direction="${currentSort.direction}"]`
    );
    
    if (activeArrow) {
        activeArrow.classList.add('active');
    }
}

function updateSortAria() {
    document.querySelectorAll('th.sortable').forEach(header => {
        header.setAttribute('aria-sort', 'none');
    });

    const activeHeader = document.querySelector(`th.sortable[data-column="${currentSort.column}"]`);
    if (activeHeader) {
        const ariaValue = currentSort.direction === 'asc' ? 'ascending' : 'descending';
        activeHeader.setAttribute('aria-sort', ariaValue);
    }
}

// Filter table
function filterTable() {
    applyFilters();
}

// Update statistics
function updateStats(list = filteredPackages) {
    const windowsNonWingetCount = list.filter(p => p.windowsStatus === 'non-winget').length;
    const windowsWingetCount = list.filter(p => p.windowsStatus === 'winget').length;
    const stats = {
        total: list.length,
        windows: list.filter(p => p.windows).length,
        macos: list.filter(p => p.macos).length,
        linux: list.filter(p => p.linux).length,
        freebsd: list.filter(p => p.freebsd).length
    };

    document.getElementById('totalPackages').textContent = stats.total;
    document.getElementById('windowsCount').textContent = `${windowsWingetCount} + (${windowsNonWingetCount})`;
    document.getElementById('macosCount').textContent = stats.macos;
    document.getElementById('linuxCount').textContent = stats.linux;
    document.getElementById('freebsdCount').textContent = stats.freebsd;
}

function setupFilters() {
    const chips = document.querySelectorAll('.filter-chip');
    if (!chips.length) {
        return;
    }

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            const os = chip.dataset.os;
            if (!os) {
                return;
            }

            if (os === 'all') {
                activeOsFilters = new Set(['all']);
            } else {
                if (activeOsFilters.has('all')) {
                    activeOsFilters.delete('all');
                }

                if (activeOsFilters.has(os)) {
                    activeOsFilters.delete(os);
                } else {
                    activeOsFilters.add(os);
                }

                if (activeOsFilters.size === 0) {
                    activeOsFilters.add('all');
                }
            }

            updateFilterChipState();
            applyFilters();
        });
    });

    updateFilterChipState();
}

function updateFilterChipState() {
    document.querySelectorAll('.filter-chip').forEach(chip => {
        const os = chip.dataset.os;
        const isActive = activeOsFilters.has(os);
        chip.classList.toggle('active', isActive);
        chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
}

function applyFilters() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const hasOsFilter = !activeOsFilters.has('all');

    filteredPackages = packagesData.filter(pkg => {
        const text = `${pkg.name} ${pkg.category} ${pkg.subcategory}`.toLowerCase();
        const matchesSearch = searchTerm.length === 0 || text.includes(searchTerm);

        if (!hasOsFilter) {
            return matchesSearch;
        }

        const matchesOs = (
            (activeOsFilters.has('windows') && pkg.windows) ||
            (activeOsFilters.has('macos') && pkg.macos) ||
            (activeOsFilters.has('linux') && pkg.linux) ||
            (activeOsFilters.has('freebsd') && pkg.freebsd)
        );

        return matchesSearch && matchesOs;
    });

    renderTable();
    updateStats(filteredPackages);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded - initializing OS compatibility table');
    document.querySelectorAll('th.sortable').forEach(header => {
        header.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                const column = header.dataset.column;
                if (column) {
                    toggleSort(column);
                }
            }
        });
    });

    loadPackages();
});
