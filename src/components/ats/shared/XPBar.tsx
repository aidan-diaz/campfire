import { getXPLevelThreshold } from '@/data/ats/mockData';
import { Sparkles, Star, TrendingUp } from 'lucide-react';

interface XPBarProps {
  level: number;
  xp: number;
  xpToNextLevel: number;
  compact?: boolean;
}

export function XPBar({ level, xp, xpToNextLevel, compact = false }: XPBarProps) {
  const levelStart = getXPLevelThreshold(level - 1);
  const levelEnd = xpToNextLevel;
  const progress = Math.min(((xp - levelStart) / (levelEnd - levelStart)) * 100, 100);

  const rankNames = [
    '', 'Wanderer', 'Seeker', 'Apprentice', 'Challenger', 'Contender',
    'Artisan', 'Pathfinder', 'Champion', 'Elite', 'Master',
    'Grandmaster', 'Legendary', 'Mythic', 'Transcendent', 'Apex'
  ];

  const rankName = rankNames[Math.min(level, rankNames.length - 1)];

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center rounded-lg text-xs shrink-0"
          style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: 'white', fontWeight: 700 }}
        >
          {level}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>{rankName}</span>
            <span style={{ fontSize: 10, color: '#64748b' }}>{xp.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP</span>
          </div>
          <div className="rounded-full overflow-hidden" style={{ height: 4, background: 'rgba(245,158,11,0.15)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#f59e0b,#fbbf24)', boxShadow: '0 0 8px rgba(245,158,11,0.5)' }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ width: 48, height: 48, background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 0 24px rgba(245,158,11,0.4)' }}
          >
            <Star size={24} color="white" fill="white" />
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>Career Level</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b', lineHeight: 1 }}>{level}</div>
            <div style={{ fontSize: 11, color: '#d97706', fontWeight: 600 }}>{rankName}</div>
          </div>
        </div>
        <div className="text-right">
          <div style={{ fontSize: 11, color: '#64748b' }}>Total XP Earned</div>
          <div className="flex items-center gap-1 justify-end">
            <Sparkles size={14} style={{ color: '#f59e0b' }} />
            <span style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>{xp.toLocaleString()}</span>
          </div>
          <div style={{ fontSize: 10, color: '#64748b' }}>{(xpToNextLevel - xp).toLocaleString()} XP to Level {level + 1}</div>
        </div>
      </div>

      <div className="rounded-full overflow-hidden mb-1.5" style={{ height: 8, background: 'rgba(245,158,11,0.12)' }}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#f59e0b,#fbbf24,#f59e0b)', backgroundSize: '200% 100%', boxShadow: '0 0 12px rgba(245,158,11,0.5)' }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <TrendingUp size={10} style={{ color: '#64748b' }} />
          <span style={{ fontSize: 10, color: '#64748b' }}>Lvl {level}</span>
        </div>
        <span style={{ fontSize: 10, color: '#64748b' }}>{Math.round(progress)}%</span>
        <span style={{ fontSize: 10, color: '#64748b' }}>Lvl {level + 1}</span>
      </div>
    </div>
  );
}
