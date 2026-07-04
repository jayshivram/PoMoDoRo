import { useTheme } from '../context/ThemeContext';
import { HiOutlineCog6Tooth } from 'react-icons/hi2';
import { IoSunnyOutline, IoMoonOutline } from 'react-icons/io5';
import { MdOutlineDarkMode } from 'react-icons/md';
import WeatherWidget from './WeatherWidget';

export default function Navbar({ onOpenSettings }) {
  const { theme, cycleTheme } = useTheme();

  const themeIcon = {
    light: <IoSunnyOutline />,
    dark: <IoMoonOutline />,
    amoled: <MdOutlineDarkMode />,
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">P</div>
        <div className="navbar-title-group">
          <span className="navbar-title">PoMoDoRo</span>
          <span className="navbar-tagline">Focus Studio</span>
        </div>
      </div>

      <div className="navbar-actions">
        <WeatherWidget onOpenSettings={onOpenSettings} />
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
