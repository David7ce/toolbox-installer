/**
 * OS Compatibility Table Script
 * Handles package data loading, sorting, filtering, and statistics
 */

// ============================================================================
// GLOBAL VARIABLES
// ============================================================================
let packagesData = [];
let currentSort = { column: 'name', direction: 'asc' };

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
            
            // Check OS availability
            const hasWindows = pm.windows_winget !== null && pm.windows_winget !== undefined;
            const hasMacOS = pm.macos_brew !== null && pm.macos_brew !== undefined;
            const hasLinux = pm.linux_arch_pacman !== null || 
                            pm.linux_arch_aur !== null || 
                            pm.linux_debian_apt !== null || 
                            pm.linux_fedora_rpm !== null || 
                            pm.linux_flatpak !== null || 
                            pm.linux_snap !== null ||
                            pm.linux_void_xbps !== null ||
                            pm.linux_gentoo_emerge !== null;
            const hasFreeBSD = pm.freebsd_pkg !== null && pm.freebsd_pkg !== undefined;

            return {
                id,
                name: pkg.name,
                category: pkg.category,
                subcategory: pkg.subcategory,
                windows: hasWindows,
                macos: hasMacOS,
                linux: hasLinux,
                freebsd: hasFreeBSD
            };
        });

        sortTable('name', 'asc');
        updateStats();
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

    packagesData.forEach(pkg => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="category-badge">${pkg.category}</span></td>
            <td>
                <div class="app-info">
                    <img class="app-logo" src="img/${pkg.id}.svg" 
                         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2232%22 height=%2232%22%3E%3Crect width=%2232%22 height=%2232%22 fill=%22%23ddd%22 rx=%224%22/%3E%3Ctext x=%2216%22 y=%2220%22 font-size=%2216%22 text-anchor=%22middle%22 fill=%22%23999%22%3E${pkg.name.charAt(0)}%3C/text%3E%3C/svg%3E'" 
                         alt="${pkg.name}">
                    <span class="app-name">${pkg.name}</span>
                </div>
            </td>
            <td class="os-available">${pkg.windows ? '✅' : '❌'}</td>
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

    renderTable();
    updateSortArrows();
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

// Filter table
function filterTable() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#tableBody tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Update statistics
function updateStats() {
    const stats = {
        total: packagesData.length,
        windows: packagesData.filter(p => p.windows).length,
        macos: packagesData.filter(p => p.macos).length,
        linux: packagesData.filter(p => p.linux).length,
        freebsd: packagesData.filter(p => p.freebsd).length
    };

    document.getElementById('totalPackages').textContent = stats.total;
    document.getElementById('windowsCount').textContent = stats.windows;
    document.getElementById('macosCount').textContent = stats.macos;
    document.getElementById('linuxCount').textContent = stats.linux;
    document.getElementById('freebsdCount').textContent = stats.freebsd;
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded - initializing OS compatibility table');
    loadPackages();
});
