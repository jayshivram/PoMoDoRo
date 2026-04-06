import { useTheme } from '../context/ThemeContext';
import { useTimer } from '../context/TimerContext';
import { useState } from 'react';
import { HiOutlineCog6Tooth } from 'react-icons/hi2';
import { IoSunnyOutline, IoMoonOutline, IoPhonePortraitOutline } from 'react-icons/io5';
import { MdOutlineDarkMode } from 'react-icons/md';

export default function Navbar({ onOpenSettings }) {
  const { theme, cycleTheme } = useTheme();
  const { sessionsCompleted } = useTimer();

  const themeIcon = {
    light: <IoSunnyOutline />,
    dark: <IoMoonOutline />,
    amoled: <MdOutlineDarkMode />,
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">P</div>
        <span className="navbar-title">PoMoDoRo</span>
      </div>

      <div className="navbar-actions">
        <button
          className="navbar-btn"
          onClick={cycleTheme}
          title={`Theme: ${theme}`}
          id="theme-toggle-btn"
          aria-label="Toggle theme"
        >
          {themeIcon[theme]}
        </button>
        <button
          className="navbar-btn"
          onClick={onOpenSettings}
          title="Settings"
          id="settings-btn"
          aria-label="Open settings"
        >
          <HiOutlineCog6Tooth />
        </button>
      </div>
    </nav>
  );
}
