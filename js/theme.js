const themes = {
    default: {
        '--primary-color': '#2c3e50',
        '--secondary-color': '#3498db',
        '--background-color': '#ecf0f1',
        '--input-background-color': '#dcdcdc', // Grigio chiaro per input, ma più scuro
        '--text-color': '#2c3e50',
        '--accent-color': '#e74c3c'
    },
    dark: {
        '--primary-color': '#1e1e1e',
        '--secondary-color': '#1e90ff',
        '--background-color': '#121212',
        '--input-background-color': '#2a2a2a', // Grigio scuro per input
        '--text-color': '#ffffff',
        '--accent-color': '#ff6f61'
    },
    light: {
        '--primary-color': '#ffffff',
        '--secondary-color': '#3498db',
        '--background-color': '#f9f9f9',
        '--input-background-color': '#e0e0e0', // Grigio chiaro per input, ma più scuro
        '--text-color': '#333333',
        '--accent-color': '#e74c3c'
    },
    contrast: {
        '--primary-color': '#000000',
        '--secondary-color': '#ffffff',
        '--background-color': '#ffffff',
        '--input-background-color': '#dcdcdc', // Grigio chiaro per input, ma più scuro
        '--text-color': '#000000',
        '--accent-color': '#ff0000'
    },
    forest: {
        '--primary-color': '#2b3a2e',
        '--secondary-color': '#8cbf8c',
        '--background-color': '#e6f2e6',
        '--input-background-color': '#d0d0d0', // Grigio chiaro per input, ma più scuro
        '--text-color': '#2c3e00',
        '--accent-color': '#ff7f7f'
    },
    ocean: {
        '--primary-color': '#002b36',
        '--secondary-color': '#007ea7',
        '--background-color': '#e8f4f8',
        '--input-background-color': '#d0d0d0', // Grigio chiaro per input, ma più scuro
        '--text-color': '#00171f',
        '--accent-color': '#ff7043'
    },
    pastel: {
        '--primary-color': '#d49a9a',
        '--secondary-color': '#e1b7b7',
        '--background-color': '#ffe6e6',
        '--input-background-color': '#dcdcdc', // Grigio chiaro per input, ma più scuro
        '--text-color': '#5b4b5b',
        '--accent-color': '#9ed9a0'
    },
    sunset: {
        '--primary-color': '#d65f5f',
        '--secondary-color': '#ff9e00',
        '--background-color': '#ffe8d6',
        '--input-background-color': '#dcdcdc', // Grigio chiaro per input, ma più scuro
        '--text-color': '#3b2a3a',
        '--accent-color': '#00b59f'
    },
    neon: {
        '--primary-color': '#0a0a0a',
        '--secondary-color': '#39ff14',
        '--background-color': '#000000',
        '--input-background-color': '#2a2a2a', // Grigio scuro per input
        '--text-color': '#39ff14',
        '--accent-color': '#ff00ff'
    },
    vintage: {
        '--primary-color': '#6b4f4f',         // Marrone scuro
        '--secondary-color': '#b79a6c',       // Beige
        '--background-color': '#f7e6d8',      // Rosa pallido
        '--input-background-color': '#e0b0b0', // Rosa chiaro per input
        '--text-color': '#3f2b2b',            // Marrone scuro per il testo
        '--accent-color': '#cc7a7a'           // Rosso tenue
    },
    cyberpunk: {
        '--primary-color': '#222222',         // Nero
        '--secondary-color': '#ff007f',       // Rosa neon
        '--background-color': '#0d0d0d',      // Grigio scuro
        '--input-background-color': '#333333', // Grigio scuro per input
        '--text-color': '#ffffff',             // Bianco per il testo
        '--accent-color': '#00ffcc'           // Verde acqua neon
    },
    autumn: {
        '--primary-color': '#8e5b3e',         // Marrone autunnale
        '--secondary-color': '#d68a3c',       // Arancione
        '--background-color': '#f3e1d4',      // Beige chiaro
        '--input-background-color': '#e0b0 b0', // Rosa chiaro per input
        '--text-color': '#3f2b2b',            // Marrone scuro per il testo
        '--accent-color': '#ff9900'           // Arancione scuro
    },
    winter: {
        '--primary-color': '#2f4f7f',         // Blu ghiaccio
        '--secondary-color': '#66d9ef',       // Azzurro chiaro
        '--background-color': '#e5e5e5',      // Grigio chiaro
        '--input-background-color': '#dcdcdc', // Grigio chiaro per input
        '--text-color': '#2c3e50',            // Blu scuro per il testo
        '--accent-color': '#ff69b4'           // Rosa chiaro
    }
};

function populateThemeSelector() {
    const themeSelector = document.getElementById('theme');
    themeSelector.innerHTML = ''; // Clear existing options

    Object.entries(themes).forEach(([themeName, themeColors]) => {
        const option = document.createElement('option');
        option.value = themeName;
        option.textContent = `${themeName.charAt(0).toUpperCase() + themeName.slice(1)} (${themeColors['--primary-color']})`;
        themeSelector.appendChild(option);
    });
}

function changeTheme() {
    const theme = document.getElementById('theme').value;
    const root = document.documentElement;
    const themeColors = themes[theme] || themes.default; // Fallback to default if theme not found

    Object.entries(themeColors).forEach(([property, value]) => {
        root.style.setProperty(property, value);
    });

    localStorage.setItem('selectedTheme', theme);
}

function applyTheme(theme) {
    const root = document.documentElement;
    const themeColors = themes[theme] || themes.default; // Fallback to default if theme not found
    
    Object.entries(themeColors).forEach(([property, value]) => {
        root.style.setProperty(property, value);
    });
}

// Call populateThemeSelector on page load
window.onload = function() {
    populateThemeSelector();
    //changeTheme(); // Apply the saved theme if any
};

window.changeTheme = changeTheme;
window.applyTheme = applyTheme;
