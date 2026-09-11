// src/components/BottomNav.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Users, Activity, UserCircle, Shield, Tag
} from 'lucide-react';

export default function BottomNav({ currentUser, isAdmin }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: 'dashboard', label: 'HOME', icon: <Home size={18} />, path: '/dashboard' },
    { key: 'groups', label: 'GRUP', icon: <Users size={18} />, path: '/groups' },
    { key: 'categories', label: 'KATEGORI', icon: <Tag size={18} />, path: '/categories' },
    { key: 'activity', label: 'AKTIVITAS', icon: <Activity size={18} />, path: '/activity' },
  ];

  const adminItem = {
    key: 'admin',
    label: 'ADMIN',
    icon: <Shield size={18} />,
    path: '/admin'
  };

  const profileItem = {
    key: 'profile',
    label: 'PROFIL',
    icon: <UserCircle size={18} />,
    path: '/profile'
  };

  const allItems = [...menuItems];
  if (isAdmin) allItems.push(adminItem);
  allItems.push(profileItem);

  const isActive = (path) => location.pathname === path;

  return (
    <nav 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#fefcf7] border-t-2 border-stone-300"
      style={{
        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.08)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 12px)',
      }}
    >
      <div className="flex items-center justify-around px-1 pt-1.5 max-w-[600px] mx-auto">
        {allItems.map((item) => (
          <button
            key={item.key}
            onClick={() => navigate(item.path)}
            className={`
              flex flex-col items-center gap-1 px-2 py-1.5 transition-colors
              min-w-[52px] relative
              ${isActive(item.path) 
                ? 'text-stone-900' 
                : 'text-stone-400 hover:text-stone-700'
              }
            `}
          >
            <div className="relative">
              {item.icon}
            </div>
            <span className={`
              font-mono text-[8px] font-bold uppercase tracking-widest
              ${isActive(item.path) ? 'text-stone-900' : 'text-stone-400'}
            `}>
              {item.label}
            </span>
            {isActive(item.path) && (
              <span className="absolute top-0 left-3 right-3 border-t-2 border-dashed border-stone-900" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}