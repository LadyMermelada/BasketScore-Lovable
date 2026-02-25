import { motion } from 'framer-motion';

type Tab = 'cancha' | 'club' | 'perfil';

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const tabs: { id: Tab; icon: string; label: string }[] = [
  { id: 'cancha', icon: '🏀', label: 'Cancha' },
  { id: 'club', icon: '🏆', label: 'Club' },
  { id: 'perfil', icon: '👤', label: 'Perfil' },
];

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 w-full h-16 border-t border-border bg-card/90 backdrop-blur-lg flex justify-around items-center z-50">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex flex-col items-center gap-0.5 transition-all duration-200 relative ${
            active === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {active === tab.id && (
            <motion.div
              layoutId="nav-indicator"
              className="absolute -top-1 w-6 h-0.5 rounded-full bg-primary"
              style={{ boxShadow: '0 0 8px hsl(var(--primary) / 0.6)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <span className="text-lg">{tab.icon}</span>
          <span className="text-[0.6rem] font-bold uppercase tracking-wider">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
