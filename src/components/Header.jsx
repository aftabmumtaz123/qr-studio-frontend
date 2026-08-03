import { Search, Bell, Moon, Sun, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const Header = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('qr_theme') !== 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('qr_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('qr_theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const next = !prev;
      toast.success(next ? 'Dark Mode Activated 🌙' : 'Light Mode Activated ☀️');
      return next;
    });
  };

  return (
    <header className="h-14 bg-surface-900 border-b border-surface-800 px-6 flex items-center justify-between flex-shrink-0 z-10">
      {/* Search Bar */}
      <div className="relative w-72">
        {/* <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /> */}
        {/* <input
          type="text"
          placeholder="Search QR codes, templates..."
          className="w-full bg-surface-800 border border-surface-700 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-brand-500 transition-colors"
        /> */}
      </div>

      {/* Header Right Actions */}
      <div className="flex items-center gap-3">
        {/* Dark / Light Mode Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-white border border-surface-700 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          title="Toggle Dark/Light Mode"
        >
          {darkMode ? (
            <>
              <Sun size={15} className="text-amber-400" />
              <span className="hidden md:inline text-slate-300">Light</span>
            </>
          ) : (
            <>
              <Moon size={15} className="text-brand-400" />
              <span className="hidden md:inline text-slate-300">Dark</span>
            </>
          )}
        </button>

        {/* Notifications */}
        {/* <button className="relative p-2 rounded-lg bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-white border border-surface-700 transition-colors">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500"></span>
        </button> */}
      </div>
    </header>
  );
};

export default Header;
