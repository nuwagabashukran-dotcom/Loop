import React from 'react';
import { Home, Compass, Plus, MessageSquare, User, Search } from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'discover', icon: Compass, label: 'Explore' },
    { id: 'create', icon: Plus, label: 'Create', special: true },
    { id: 'inbox', icon: MessageSquare, label: 'Inbox' },
    { id: 'profile', icon: User, label: 'Me' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-bg-dark/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-2 z-50 pb-safe">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        if (tab.special) {
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => onTabChange(tab.id)}
              className="relative -top-2"
            >
              <div className="w-12 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center text-white relative shadow-lg shadow-primary/30 border border-white/20">
                <Plus size={24} strokeWidth={3} />
              </div>
            </motion.button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 min-w-[64px] transition-all duration-300 ${
              isActive ? 'text-primary' : 'text-text-dim'
            }`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'drop-shadow-[0_0_8px_rgba(255,44,85,0.4)]' : ''} />
            <span className={`text-[10px] font-bold tracking-tight uppercase ${isActive ? 'opacity-100' : 'opacity-60'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
