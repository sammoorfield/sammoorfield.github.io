import { useState, useMemo } from 'react';
import { Shot, ShotStatus } from '../types.ts';
import { STATUS_COLORS, STATUS_BAR_COLORS, STATUS_OPTIONS } from '../constants.ts';
import { AlertCircle, Image as ImageIcon, MoreVertical, Search, Filter, Trash2, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface ShotsViewProps {
  shots: Shot[];
  onUpdateShot: (shot: Shot) => void;
  onDeleteShot: (shotId: string) => void;
}

export default function ShotsView({ shots, onUpdateShot, onDeleteShot }: ShotsViewProps) {
  const [statusFilter, setStatusFilter] = useState<ShotStatus | 'ALL'>('ALL');

  const filteredShots = useMemo(() => {
    return shots.filter(shot => {
      const matchesStatus = statusFilter === 'ALL' || shot.status === statusFilter;
      return matchesStatus;
    });
  }, [shots, statusFilter]);

  const groupedShots = useMemo(() => {
    const groups: Record<string, Shot[]> = {};
    
    STATUS_OPTIONS.forEach(status => {
      groups[status] = [];
    });

    filteredShots.forEach(shot => {
      if (groups[shot.status]) {
        groups[shot.status].push(shot);
      }
    });

    Object.keys(groups).forEach(status => {
      groups[status].sort((a, b) => a.name.localeCompare(b.name));
    });

    return groups;
  }, [filteredShots]);

  return (
    <div className="p-8 w-full space-y-12">
      <div className="flex justify-end gap-6 border-b border-studio-border pb-8">
        <div className="flex items-center gap-2 bg-studio-surface border border-studio-border rounded-lg px-3 group transition-all hover:border-studio-muted">
          <Filter className="w-4 h-4 text-studio-muted" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="py-2 bg-transparent text-sm text-studio-text outline-none cursor-pointer uppercase font-bold tracking-widest"
          >
            <option value="ALL">All Statuses</option>
            {STATUS_OPTIONS.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-16">
        {STATUS_OPTIONS.map(status => {
          const groupShots = groupedShots[status];
          if (!groupShots || groupShots.length === 0) return null;

          return (
            <section key={status} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className={`h-8 w-1.5 rounded-full ${STATUS_BAR_COLORS[status as ShotStatus]}`} />
                <h3 className="text-lg font-bold text-studio-text tracking-wide uppercase">{status} ({groupShots.length})</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                {groupShots.map((shot, index) => (
                  <ShotCard key={shot.id} shot={shot} index={index} onDeleteShot={onDeleteShot} />
                ))}
              </div>
            </section>
          );
        })}
        
        {filteredShots.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-studio-border rounded-3xl bg-studio-surface/20 text-studio-muted">
            <ImageIcon className="w-16 h-16 mb-6 opacity-10" />
            <p className="text-lg font-medium italic">No shots match your current filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ShotCard({ shot, index, onDeleteShot }: { shot: Shot, index: number, onDeleteShot: (id: string) => void, key?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      className="group bg-studio-surface border border-studio-border rounded-xl shadow-sm hover:shadow-2xl hover:shadow-studio-accent/10 transition-all duration-300 flex flex-col overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-studio-bg overflow-hidden border-b border-studio-border">
        {shot.thumbnail ? (
          <img 
            src={shot.thumbnail} 
            alt={shot.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-studio-muted/10">
            <ImageIcon className="w-10 h-10 mb-2" />
          </div>
        )}
      </div>

      {/* Info Container */}
      <div className="p-3 flex-1 flex flex-col justify-center bg-studio-surface/50">
        <div className="w-full flex h-8 gap-1.5 text-[12px] font-black uppercase tracking-wider">
          {/* Turnover 15% */}
          <div className="w-[18%] h-full bg-studio-bg/50 flex items-center justify-center text-studio-muted border border-studio-border/30 rounded-sm">
            {shot.turnover}
          </div>
          {/* Name 70% */}
          <div className="flex-1 h-full bg-studio-bg/50 flex items-center justify-center px-2 text-studio-text/90 border border-studio-border/30 rounded-sm min-w-0">
            <span className="truncate">{shot.name}</span>
          </div>
          {/* Version 15% */}
          <div className="w-[20%] h-full bg-studio-bg/50 flex items-center justify-center text-studio-muted border border-studio-border/30 rounded-sm">
            v_{String(shot.version).padStart(3, '0')}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
