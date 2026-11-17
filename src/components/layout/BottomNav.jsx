import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, Award, Trophy } from 'lucide-react';

export function BottomNav() {
  const location = useLocation();
  const navItems = [
    {
      label: 'Accueil',
      path: '/',
      icon: Home,
      exact: true,
    },
    {
      label: 'Candidats',
      path: '/candidats',
      icon: Users,
    },
    {
      label: '52 Prix',
      path: '/categories',
      icon: Award,
    },
    {
      label: 'Classement',
      path: '/classement',
      icon: Trophy,
    },
    {
      label: 'Palmarès',
      path: '/resultats',
      icon: Award,
    },
  ];

  const isCurrentActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <nav
      aria-label="Navigation principale mobile"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0F1117]/95 backdrop-blur-lg border-t border-white/10 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(0,0,0,0.3)]"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1 items-center">
        {navItems.map((item) => {
          const active = isCurrentActive(item);
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center h-full py-1.5 px-1 relative transition-all duration-200 active:scale-95 ${
                active
                  ? 'text-[#B8973E]'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {/* Active pill bar indicator top */}
              {active && (
                <span className="absolute top-0 w-8 h-0.5 bg-[#B8973E] rounded-full shadow-[0_0_8px_#B8973E]" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    active ? 'stroke-[2.2] scale-110' : 'stroke-[1.7]'
                  }`}
                />
              </div>

              <span
                className={`text-[10px] tracking-tight mt-1 truncate max-w-full font-medium ${
                  active ? 'font-bold text-[#B8973E]' : 'text-stone-400'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

