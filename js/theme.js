// theme.js — Theme toggle logic
// Cycles: light → dark → system → light
// Imported by every page as a module

const THEME_KEY = 'mq-theme';

function getEffectiveTheme(mode) {
  if (mode === 'light') return 'light';
  if (mode === 'dark') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(mode) {
  const effective = getEffectiveTheme(mode);
  document.documentElement.setAttribute('data-theme', effective);
  localStorage.setItem(THEME_KEY, mode);
  updateToggleIcon(mode);
}

function cycleTheme() {
  const current = localStorage.getItem(THEME_KEY) || 'system';
  const next = current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light';
  applyTheme(next);
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

function updateToggleIcon(mode) {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  if (mode === 'light') {
    btn.innerHTML = sunIcon();
    btn.title = 'Light mode (click to switch)';
  } else if (mode === 'dark') {
    btn.innerHTML = moonIcon();
    btn.title = 'Dark mode (click to switch)';
  } else {
    btn.innerHTML = systemIcon();
    btn.title = 'System mode (click to switch)';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem(THEME_KEY) || 'system';
  updateToggleIcon(saved);

  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.addEventListener('click', cycleTheme);
  }
});
