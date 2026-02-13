import { useEffect, useState } from 'react';

export default function Footer({ userInfo, metadata }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const mockUserInfo = userInfo || {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@utilities.ca',
    role: 'PSPS Coordinator',
  };

  return (
    <footer className="bg-gray-900 text-gray-100 border-t border-gray-800 shadow-inner">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left: User Info */}
        <div className="flex items-center gap-6">
          {/* User Avatar + Details */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center font-semibold text-white text-sm">
              {mockUserInfo.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold text-white">{mockUserInfo.name}</p>
              <p className="text-xs text-gray-400">{mockUserInfo.role}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-700"></div>

          {/* MET Push Info */}
          <div className="flex flex-col gap-0.5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Last MET Push</p>
            <p className="text-sm font-semibold text-green-400">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
          </div>
        </div>

        {/* Right: Help Links + Version */}
        <div className="flex items-center gap-6">
          {/* Links */}
          <div className="flex items-center gap-4">
            <a
              href="#help"
              className="text-xs text-gray-400 hover:text-blue-400 transition-colors font-medium"
              aria-label="Help documentation"
            >
              📚 Help
            </a>
            <a
              href="#job-aid"
              className="text-xs text-gray-400 hover:text-blue-400 transition-colors font-medium"
              aria-label="Job aid document"
            >
              📋 Job Aid
            </a>
            <a
              href="#settings"
              className="text-xs text-gray-400 hover:text-blue-400 transition-colors font-medium"
              aria-label="Settings"
            >
              ⚙️ Settings
            </a>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-700"></div>

          {/* Version & Date */}
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <span>Version 1.0</span>
            <span className="text-gray-700">•</span>
            <span>{currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
