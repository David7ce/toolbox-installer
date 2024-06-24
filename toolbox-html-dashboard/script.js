async function generateCommand() {
    console.log('Generate command button clicked');
    try {
        const selectedDistro = document.querySelector('input[name="distribution"]:checked').value;

        const selectedPackages = Array.from(document.querySelectorAll('input[name="pkg"]:checked'))
            .map(checkbox => checkbox.value);

        const response = await fetch('../pkgs/pkgs-names.json');

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const pkgs = await response.json();

        if (!pkgs[selectedDistro]) {
            throw new Error(`Distribution ${selectedDistro} not found in pkgs-names.json`);
        }

        const installationCommands = [];
        const aurCommands = [];
        const nonInstallablePackages = [];

        selectedPackages.forEach(pkg => {
            if (pkgs[selectedDistro][pkg]) {
                installationCommands.push(pkgs[selectedDistro][pkg]);
            } else if (selectedDistro === 'arch_pacman' && pkgs['arch_aur'][pkg]) {
                aurCommands.push(pkgs['arch_aur'][pkg]);
            } else {
                nonInstallablePackages.push(pkg);
            }
        });

        let commandPrefix;
        switch (selectedDistro) {
            case 'arch_pacman':
                commandPrefix = 'sudo pacman -S';
                break;
            case 'debian_apt':
                commandPrefix = 'sudo apt install';
                break;
            case 'fedora_rpm':
                commandPrefix = 'sudo dnf install';
                break;
            case 'linux_flatpak':
                commandPrefix = 'flatpak install flathub'
                break;
            case 'macos_brew':
                commandPrefix = 'brew install --cask';
                break;
            case 'windows_winget':
                commandPrefix = 'winget install';
                break;
            default:
                throw new Error('Unsupported distribution');
        }

        const finalCommand = installationCommands.length
            ? `${commandPrefix} ${installationCommands.join(' ')}`
            : '';

        const aurCommand = aurCommands.length
            ? `yay -S ${aurCommands.join(' ')}`
            : '';

        const resultCommand = [finalCommand, aurCommand].filter(cmd => cmd).join(' && ');

        if (!resultCommand) {
            throw new Error('No installation commands generated. Please select at least one package.');
        }

        // Clear any existing content
        const outputElement = document.getElementById("output");
        outputElement.innerHTML = '';

        // Create and append the installation command element
        const installationCodeElement = document.createElement('code');
        installationCodeElement.id = 'installation-command';
        installationCodeElement.textContent = resultCommand;
        outputElement.appendChild(installationCodeElement);

        // Create and append the non-installable packages element if needed
        if (nonInstallablePackages.length) {
            const nonInstallablePackagesElement = document.createElement('code');
            nonInstallablePackagesElement.id = 'not-installable-packages';
            nonInstallablePackagesElement.innerHTML = `<strong>Packages not found:</strong> ${nonInstallablePackages.join(', ')}`;
            outputElement.appendChild(nonInstallablePackagesElement);
        }
    } catch (error) {
        alert(`There was an error generating the installation command: ${error.message}`);
    }
}


// Function to select and deselect packages from button toggleSelectAllPackages()
function toggleSelectAllPackages() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"][name="pkg"]');
    const selectAllButton = document.querySelector('button');

    // Check if any checkboxes are not checked
    const anyUnchecked = Array.from(checkboxes).some(checkbox => !checkbox.checked);

    // Toggle the state of all checkboxes based on the state of anyUnchecked
    checkboxes.forEach(checkbox => {
        checkbox.checked = anyUnchecked;
    });

    // Update the text of the button
    if (anyUnchecked) {
        selectAllButton.textContent = "Deselect All";
    } else {
        selectAllButton.textContent = "Select All";
    }
}

async function favPackages() {
    try {
        const response = await fetch('../pkgs/fav-pkgs.txt');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const text = await response.text();
        const specificPackages = text.split('\n').map(pkg => pkg.trim()).filter(pkg => pkg);
        const form = document.getElementById('packageForm');
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');

        checkboxes.forEach(checkbox => {
            if (specificPackages.includes(checkbox.value)) {
                checkbox.checked = true;
            } else {
                checkbox.checked = false;
            }
        });
    } catch (error) {
        console.error('Failed to fetch packages:', error);
    }
}

window.onload = favPackages;

// Copy generated command
/*
function copyCode() {
    const codeElement = document.getElementById('installation-command');
    const codeText = codeElement.textContent;

    // Create a textarea element to hold the code temporarily
    const textarea = document.createElement('textarea');
    textarea.value = codeText;
    document.body.appendChild(textarea);

    // Select the text inside the textarea
    textarea.select();
    textarea.setSelectionRange(0, 99999); // For mobile devices

    // Copy the text to the clipboard
    document.execCommand('copy');

    // Remove the textarea element
    document.body.removeChild(textarea);

    // Provide feedback to the user
    alert('Code copied to clipboard!');
}
*/
