// Theme Manager: Handles dark/light mode switching and persistence

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    
    // Function to set theme
    function setTheme(isDark) {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        themeToggle.checked = isDark;
        localStorage.setItem('dark-mode', isDark ? 'true' : 'false');
    }
    
    // Check for saved user preference
    const prefersDark = localStorage.getItem('dark-mode') === 'true';
    
    // If no stored preference, check system preference
    if (localStorage.getItem('dark-mode') === null) {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(systemPrefersDark);
    } else {
        setTheme(prefersDark);
    }
    
    // Listen for toggle changes
    themeToggle.addEventListener('change', () => {
        setTheme(themeToggle.checked);
    });
    
    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
        if (localStorage.getItem('dark-mode') === null) {
            setTheme(event.matches);
        }
    });
});