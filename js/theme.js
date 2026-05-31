// theme.js
// Handles the light, dark, and system theme toggle for all pages.
// Reads and saves the user's preference in localStorage under "mq-theme".
// Builds a click-to-open dropdown with three options: Light, Dark, System.
// Imported as a module by every page.

const THEME_KEY = 'mq-theme';

// Resolve the actual theme to apply based on the saved mode.
// "system" reads the OS preference via prefers-color-scheme.
function getEffectiveTheme(mode) {
  if (mode === 'light') return 'light';
  if (mode === 'dark') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Apply a theme mode by setting data-theme on the html element,
// saving the preference to localStorage, and updating the toggle icon.
function applyTheme(mode) {
  const effective = getEffectiveTheme(mode);
  document.documentElement.setAttribute('data-theme', effective);
  localStorage.setItem(THEME_KEY, mode);
  updateToggleIcon(mode);
}

function sunIcon() {
  return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
}

function moonIcon() {
  return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
}

function systemIcon() {
  return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`;
}

// Update the toggle button icon to reflect the current mode.
// Sun icon for light, moon for dark, monitor for system.
function updateToggleIcon(mode) {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  if (mode === 'light') {
    btn.innerHTML = sunIcon();
    btn.title = 'Light mode';
  } else if (mode === 'dark') {
    btn.innerHTML = moonIcon();
    btn.title = 'Dark mode';
  } else {
    btn.innerHTML = systemIcon();
    btn.title = 'System mode';
  }
}

// Run after the DOM is ready.
// Build the dropdown menu and wire all click listeners.
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem(THEME_KEY) || 'system';
  updateToggleIcon(saved);

  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  // Build dropdown
  const dropdown = document.createElement('div');
  dropdown.className = 'theme-dropdown';
  dropdown.style.display = 'none';

  const options = [
    { mode: 'light',  icon: sunIcon(),    label: 'Light'  },
    { mode: 'dark',   icon: moonIcon(),   label: 'Dark'   },
    { mode: 'system', icon: systemIcon(), label: 'System' },
  ];

  options.forEach(({ mode, icon, label }) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'theme-dropdown-item';
    item.dataset.mode = mode;
    item.innerHTML = `${icon} ${label}`;
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      applyTheme(mode);
      dropdown.style.display = 'none';
      updateActiveItem();
    });
    dropdown.appendChild(item);
  });

  // Insert dropdown after the toggle button inside its wrapper
  toggleBtn.insertAdjacentElement('afterend', dropdown);

  function updateActiveItem() {
    const current = localStorage.getItem(THEME_KEY) || 'system';
    dropdown.querySelectorAll('.theme-dropdown-item').forEach(item => {
      item.classList.toggle('active', item.dataset.mode === current);
    });
  }

  // Toggle dropdown on button click
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.style.display === 'block';
    dropdown.style.display = isOpen ? 'none' : 'block';
    if (!isOpen) updateActiveItem();
  });

  // Close the dropdown if the user clicks anywhere outside it.
  document.addEventListener('click', (e) => {
    if (!toggleBtn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
});
