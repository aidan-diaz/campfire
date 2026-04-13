import { ApplicationStage, stageStoryLabels, stageLabels } from '@/data/ats/mockData';
import { CheckCircle2, Circle, XCircle, Trophy, MapPin } from 'lucide-react';

const mainStages: ApplicationStage[] = ['applied', 'screening', 'interview', 'final_round', 'offered', 'hired'];

interface JourneyPathProps {
  currentStage: ApplicationStage;
  compact?: boolean;
}

export function JourneyPath({ currentStage, compact = false }: JourneyPathProps) {
  const isRejected = currentStage === 'rejected';

  const getStageStatus = (stage: ApplicationStage): 'completed' | 'current' | 'future' | 'rejected' => {
    if (isRejected) return stage === currentStage ? 'rejected' : 'completed';
    const mainStageIndex = mainStages.indexOf(stage);
    const currentIndex = mainStages.indexOf(currentStage);
    if (mainStageIndex < currentIndex) return 'completed';
    if (mainStageIndex === currentIndex) return 'current';
    return 'future';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {mainStages.map((stage, i) => {
          const status = getStageStatus(stage);
          return (
            <div key={stage} className="flex items-center gap-1">
              <div
                className="rounded-full transition-all"
                style={{
                  width: status === 'current' ? 10 : 6,
                  height: status === 'current' ? 10 : 6,
                  background:
                    status === 'completed' ? '#10b981'
                      : status === 'current' ? '#7c3aed'
                      : status === 'rejected' ? '#ef4444'
                      : '#1e293b',
                  boxShadow: status === 'current' ? '0 0 8px rgba(124,58,237,0.6)' : 'none',
                }}
              />
              {i < mainStages.length - 1 && (
                <div style={{ width: 12, height: 1, background: status === 'completed' ? '#10b981' : '#1e293b' }} />
              )}
            </div>
          );
        })}
        <span className="ml-2" style={{ fontSize: 11, color: isRejected ? '#ef4444' : currentStage === 'hired' ? '#10b981' : '#a78bfa', fontWeight: 600 }}>
          {stageStoryLabels[currentStage]}
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Connecting line */}
      <div
        className="absolute top-5 left-5 right-5"
        style={{ height: 2, background: 'rgba(124,58,237,0.12)', zIndex: 0 }}
      />
      <div className="flex items-start justify-between relative" style={{ zIndex: 1 }}>
        {mainStages.map((stage) => {
          const status = getStageStatus(stage);
          return (
            <div key={stage} className="flex flex-col items-center gap-2" style={{ minWidth: 0, flex: 1 }}>
              <div
                className="flex items-center justify-center rounded-full transition-all duration-300"
                style={{
                  width: 40,
                  height: 40,
                  background:
                    status === 'completed' ? 'rgba(16,185,129,0.15)'
                      : status === 'current' ? 'rgba(124,58,237,0.2)'
                      : status === 'rejected' ? 'rgba(239,68,68,0.15)'
                      : 'rgba(255,255,255,0.03)',
                  border: `2px solid ${
                    status === 'completed' ? '#10b981'
                      : status === 'current' ? '#7c3aed'
                      : status === 'rejected' ? '#ef4444'
                      : '#1e293b'
                  }`,
                  boxShadow: status === 'current' ? '0 0 20px rgba(124,58,237,0.4)' : 'none',
                }}
              >
                {status === 'completed' ? (
                  <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                ) : status === 'current' ? (
                  stage === 'hired' ? <Trophy size={18} style={{ color: '#f59e0b' }} /> : <MapPin size={18} style={{ color: '#a78bfa' }} />
                ) : status === 'rejected' ? (
                  <XCircle size={18} style={{ color: '#ef4444' }} />
                ) : (
                  <Circle size={16} style={{ color: '#334155' }} />
                )}
              </div>
              <div className="text-center px-1">
                <div style={{
                  fontSize: 10,
                  fontWeight: status === 'current' ? 700 : 500,
                  color: status === 'completed' ? '#10b981' : status === 'current' ? '#a78bfa' : status === 'rejected' ? '#ef4444' : '#475569',
                  whiteSpace: 'nowrap',
                }}>
                  {stageLabels[stage]}
                </div>
                {status === 'current' && (
                  <div style={{ fontSize: 9, color: '#7c3aed', fontWeight: 600 }}>
                    {stageStoryLabels[stage]}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
