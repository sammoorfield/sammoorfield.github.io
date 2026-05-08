import React, { useState, useMemo, useRef, useEffect } from 'react';
import { format, addDays, startOfToday, eachDayOfInterval, isSameDay, isWeekend, differenceInDays, startOfWeek } from 'date-fns';
import { motion, Reorder, useDragControls } from 'motion/react';
import { Shot, ShotStatus } from '../types.ts';
import { STATUS_COLORS, STATUS_BAR_COLORS, STATUS_OPTIONS } from '../constants.ts';
import { AlertCircle, ChevronLeft, ChevronRight, ImageIcon, AlertTriangle, GripVertical, Filter, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { reorderShots, createShot } from '../services/firebaseService.ts';

interface ScheduleViewProps {
  shots: Shot[];
  onUpdateShot: (shot: Shot) => void;
  onDeleteShot: (shotId: string) => void;
  activeProjectId: string;
}

export default function ScheduleView({ shots, onUpdateShot, onDeleteShot, activeProjectId }: ScheduleViewProps) {
  const [viewDate, setViewDate] = useState(startOfWeek(startOfToday(), { weekStartsOn: 1 }));
  const [statusFilter, setStatusFilter] = useState<ShotStatus | 'ALL'>('ALL');
  const [localShots, setLocalShots] = useState<Shot[]>(shots);
  const daysToShow = 21; 

  // Sync with props but only if not currently dragging/reordering
  useEffect(() => {
    setLocalShots(shots);
  }, [shots]);

  const timelineDays = useMemo(() => {
    return eachDayOfInterval({
      start: viewDate,
      end: addDays(viewDate, daysToShow - 1)
    });
  }, [viewDate, daysToShow]);

  const filteredShots = useMemo(() => {
    if (statusFilter === 'ALL') return localShots;
    return localShots.filter(s => s.status === statusFilter);
  }, [localShots, statusFilter]);

  const nextWeek = () => setViewDate(addDays(viewDate, 7));
  const prevWeek = () => setViewDate(addDays(viewDate, -7));
  const today = () => setViewDate(startOfWeek(startOfToday(), { weekStartsOn: 1 }));

  const COLUMN_WIDTH = 100;
  const reorderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleReorder = (newShots: Shot[]) => {
    // 1. Calculate the new full list optimistically
    let updatedFullList: Shot[];
    
    if (statusFilter !== 'ALL') {
      updatedFullList = [...localShots];
      const visibleIds = new Set(newShots.map(s => s.id));
      
      const indices = localShots
        .map((s, i) => ({ id: s.id, index: i }))
        .filter(item => visibleIds.has(item.id))
        .map(item => item.index);
      
      newShots.forEach((shot, i) => {
        updatedFullList[indices[i]] = shot;
      });
      
      updatedFullList = updatedFullList.map((s, i) => ({ ...s, order: i }));
    } else {
      updatedFullList = newShots.map((shot, index) => ({ ...shot, order: index }));
    }
    
    // 2. Update local state immediately for smooth UI
    setLocalShots(updatedFullList);
    
    // 3. Sync to Firebase - Debounced
    if (reorderTimeoutRef.current) clearTimeout(reorderTimeoutRef.current);
    reorderTimeoutRef.current = setTimeout(async () => {
      await reorderShots(activeProjectId, updatedFullList);
    }, 1000);
  };

  const handleCreateInline = async (shotData: Partial<Shot>) => {
    await createShot(activeProjectId, {
      ...shotData,
      startDate: startOfToday(),
      endDate: startOfToday(),
      order: shots.length
    });
  };

  return (
    <div className="flex flex-col h-full bg-studio-bg overflow-hidden relative">
      {/* Timeline Header Toolbar */}
      <div className="h-14 border-b border-studio-border bg-studio-surface/30 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-6">
          <div className="flex border border-studio-border rounded-lg overflow-hidden bg-studio-surface">
            <button onClick={prevWeek} className="p-2 hover:bg-studio-bg text-studio-muted hover:text-studio-text transition-colors border-r border-studio-border">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={today}
              className="px-4 text-xs font-bold uppercase tracking-wider text-studio-muted hover:text-studio-accent transition-colors bg-studio-surface hover:bg-studio-bg"
            >
              Today
            </button>
            <button onClick={nextWeek} className="p-2 hover:bg-studio-bg text-studio-muted hover:text-studio-text transition-colors border-l border-studio-border">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs font-bold text-studio-text uppercase tracking-widest opacity-60">
            {format(timelineDays[0], 'MMM d')} — {format(timelineDays[daysToShow-1], 'MMM d, yyyy')}
          </span>
        </div>

        <div className="flex items-center gap-3 bg-studio-surface border border-studio-border rounded-lg px-3 group transition-all hover:border-studio-muted">
          <Filter className="w-3.5 h-3.5 text-studio-muted" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="py-1.5 bg-transparent text-xs font-bold text-studio-text outline-none cursor-pointer uppercase tracking-widest"
          >
            <option value="ALL">All Statuses</option>
            {STATUS_OPTIONS.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Gantt Grid */}
      <div className="flex-1 flex flex-col min-h-0 bg-studio-bg relative">
        <div className="flex-1 flex flex-col overflow-x-auto custom-scrollbar-h" 
          onScroll={(e) => {
            const header = document.getElementById('timeline-header-scroll');
            if (header) header.scrollLeft = (e.currentTarget as HTMLDivElement).scrollLeft;
          }}
        >
          <div className="min-w-max flex flex-col flex-1">
            {/* Header */}
            <div className="flex border-b border-studio-border sticky top-0 bg-studio-bg z-30">
              {/* Fixed Metadata Header */}
              <div className="flex shrink-0 border-r border-studio-border bg-studio-bg sticky left-0 z-40 shadow-[2px_0_10px_rgba(0,0,0,0.5)]">
                <div className="w-8 border-r border-studio-border/50" />
                <div className="w-20 px-1 py-3 text-[11px] font-black text-studio-muted uppercase tracking-tighter flex items-end justify-center">T</div>
                <div className="w-48 px-2 py-3 text-[11px] font-black text-studio-muted uppercase tracking-tighter flex items-end justify-center">Name</div>
                <div className="w-16 px-1 py-3 text-[11px] font-black text-studio-muted uppercase tracking-tighter flex items-end justify-center text-center">V</div>
                <div className="w-24 px-1 py-3 text-[11px] font-black text-studio-muted uppercase tracking-tighter flex items-end justify-center"></div>
                <div className="w-36 px-2 py-3 text-[11px] font-black text-studio-muted uppercase tracking-tighter flex items-end justify-center">Status</div>
                <div className="w-12 px-1 py-3 text-[11px] font-black text-studio-muted uppercase tracking-tighter flex items-end justify-center text-center"></div>
              </div>
              
              {/* Scrollable Timeline Header */}
              <div className="flex overflow-hidden bg-studio-bg pointer-events-none" id="timeline-header-scroll">
                <div className="flex">
                  {timelineDays.map(day => (
                    <div 
                      key={day.toISOString()} 
                      className={`w-[100px] border-r border-studio-border/50 px-2 py-3 flex flex-col items-center justify-center gap-0.5 ${
                        isWeekend(day) ? 'bg-studio-bg/50 text-studio-muted' : ''
                      } ${isSameDay(day, startOfToday()) ? 'bg-studio-accent/5' : ''}`}
                    >
                      <span className="text-[8px] font-black text-studio-muted uppercase opacity-15 leading-none">{format(day, 'EEE')}</span>
                      <span className={`text-[11px] font-black leading-none ${isSameDay(day, startOfToday()) ? 'text-studio-accent' : 'text-studio-text'}`}>
                        {format(day, 'dd')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1">
              <Reorder.Group axis="y" values={filteredShots} onReorder={handleReorder} className="flex flex-col divide-y divide-studio-border/10">
                {filteredShots.map(shot => (
                  <ShotRow 
                    key={shot.id} 
                    shot={shot} 
                    onUpdateShot={onUpdateShot} 
                    onDeleteShot={onDeleteShot}
                    timelineDays={timelineDays}
                    columnWidth={COLUMN_WIDTH}
                    maxDays={daysToShow}
                  />
                ))}
                
                {/* Inline Add Row */}
                {statusFilter === 'ALL' && (
                  <InlineAddRow onCreate={handleCreateInline} timelineDays={timelineDays} />
                )}

                {shots.length === 0 && (
                  <div className="py-24 text-center w-full">
                    <p className="text-studio-muted text-[11px] font-bold uppercase tracking-widest opacity-30">No active shots in this pipeline</p>
                  </div>
                )}
              </Reorder.Group>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ShotRowProps {
  key?: string;
  shot: Shot;
  onUpdateShot: (shot: Shot) => void;
  onDeleteShot: (shotId: string) => void;
  timelineDays: Date[];
  columnWidth: number;
  maxDays: number;
}

function ShotRow({ 
  shot, 
  onUpdateShot, 
  onDeleteShot,
  timelineDays, 
  columnWidth, 
  maxDays 
}: ShotRowProps) {
  const [isOver, setIsOver] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragControls = useDragControls();

  const handleStatusChange = (status: ShotStatus) => {
    onUpdateShot({ ...shot, status });
  };

  const handleToggleAlert = () => {
    onUpdateShot({ ...shot, alert: !shot.alert });
  };

  const handleGripContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowTrash(!showTrash);
  };

  const handleShotDelete = () => {
    if (window.confirm(`Delete shot ${shot.name}?`)) {
      onDeleteShot(shot.id);
    }
    setShowTrash(false);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.confirm(`Delete shot ${shot.name}?`)) {
      onDeleteShot(shot.id);
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      onUpdateShot({ ...shot, thumbnail: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    }
  };

  return (
    <Reorder.Item 
      value={shot} 
      dragControls={dragControls}
      dragListener={false}
      className={`flex group hover:bg-studio-surface transition-colors bg-studio-bg min-w-max h-10 ${shot.alert ? 'bg-red-500/5' : ''}`}
    >
      {/* Fixed Columns */}
      <div className="flex shrink-0 border-r border-studio-border bg-studio-bg sticky left-0 z-20 h-full shadow-[2px_0_10px_rgba(0,0,0,0.5)]">
        <div 
          onPointerDown={(e) => dragControls.start(e)}
          onContextMenu={handleGripContextMenu}
          className="w-8 flex items-center justify-center border-r border-studio-border/30 text-studio-muted group-hover:text-studio-text/80 cursor-grab active:cursor-grabbing transition-colors relative"
        >
          {showTrash ? (
            <button 
              onClick={(e) => { e.stopPropagation(); handleShotDelete(); }}
              className="text-red-500 hover:scale-110 transition-transform"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          ) : (
            <GripVertical className="w-3.5 h-3.5" />
          )}
        </div>
        <div className="w-20 px-1 flex items-center justify-center">
          <input 
            value={shot.turnover}
            onChange={(e) => onUpdateShot({ ...shot, turnover: e.target.value })}
            className="w-full bg-transparent text-xs font-black text-studio-text/60 uppercase tracking-tighter text-center outline-none focus:text-studio-text transition-colors"
          />
        </div>
        <div className="w-48 px-2 flex items-center">
          <input 
            value={shot.name}
            onChange={(e) => onUpdateShot({ ...shot, name: e.target.value })}
            className="w-full bg-transparent text-xs font-bold text-studio-text/90 uppercase tracking-tight outline-none focus:text-studio-accent transition-colors"
          />
        </div>
        <div className="w-16 px-1 flex items-center justify-center group/version">
          <div className="flex items-center gap-0.5">
            <span className="text-[9px] font-black text-studio-text/30">v</span>
            <input 
              type="text"
              value={String(shot.version).padStart(3, '0')}
              onChange={(e) => {
                const val = parseInt(e.target.value.replace(/\D/g, '')) || 0;
                onUpdateShot({ ...shot, version: val });
              }}
              className="w-7 bg-transparent text-xs font-black text-studio-text/60 text-center outline-none focus:text-studio-text transition-colors"
            />
            <div className="flex flex-col opacity-0 group-hover/version:opacity-100 transition-opacity">
              <button 
                onClick={() => onUpdateShot({ ...shot, version: shot.version + 1 })}
                className="p-0.5 text-studio-muted/50 hover:text-studio-muted transition-colors"
              >
                <ChevronUp className="w-2.5 h-2.5" />
              </button>
              <button 
                onClick={() => onUpdateShot({ ...shot, version: Math.max(0, shot.version - 1) })}
                className="p-0.5 text-studio-muted/50 hover:text-studio-muted transition-colors"
              >
                <ChevronDown className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Thumbnail with Drag & Drop */}
        <div className="w-24 p-0.5 flex items-center justify-center pointer-events-auto">
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
            onDragLeave={() => setIsOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full h-full rounded-sm border overflow-hidden transition-all relative ${
              isOver ? 'border-studio-accent bg-studio-accent/20' : 'border-studio-border bg-studio-bg hover:border-studio-muted'
            }`}
          >
            {shot.thumbnail ? (
              <img src={shot.thumbnail} className="w-full h-full object-cover" alt={shot.name} referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                 <ImageIcon className={`w-3 h-3 ${isOver ? 'text-studio-accent' : 'text-studio-border'}`} />
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="w-36 px-1 flex items-center justify-center pointer-events-auto">
          <select 
            value={shot.status}
            onChange={(e) => handleStatusChange(e.target.value as ShotStatus)}
            className={`w-full border border-studio-border/20 rounded-sm px-2 py-0.5 text-[10px] font-black uppercase cursor-pointer outline-none transition-all ${STATUS_BAR_COLORS[shot.status]} text-white/90 h-5 flex items-center justify-center text-center ring-0 appearance-none`}
          >
            {STATUS_OPTIONS.map(status => (
              <option key={status} value={status} className="bg-studio-surface text-studio-text">
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Alert Toggle */}
        <div className="w-12 flex items-center justify-center px-1 pointer-events-auto" onContextMenu={handleContextMenu} title="Right-click to delete">
          <button 
            onClick={handleToggleAlert}
            className={`p-1 rounded transition-colors ${shot.alert ? 'text-red-500 bg-red-500/10' : 'text-studio-border/30 hover:text-studio-muted'}`}
          >
            <AlertCircle className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Timeline Scrollable Part */}
      <div className="flex items-center h-full">
        <div className="flex relative items-center h-full">
          {timelineDays.map(day => (
            <div 
              key={day.toISOString()} 
              className={`w-[100px] h-full border-r border-studio-border/10 ${
                isSameDay(day, startOfToday()) ? 'bg-studio-accent/[0.02]' : ''
              }`}
            />
          ))}

          <ShotBar 
            shot={shot} 
            timelineStart={timelineDays[0]} 
            columnWidth={columnWidth} 
            maxDays={maxDays}
            onUpdateShot={onUpdateShot}
          />
        </div>
      </div>
    </Reorder.Item>
  );
}

function InlineAddRow({ onCreate, timelineDays }: { onCreate: (shot: Partial<Shot>) => Promise<void>, timelineDays: Date[] }) {
  const [turnover, setTurnover] = useState('');
  const [name, setName] = useState('');
  const [version, setVersion] = useState<number | string>('');
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isOver, setIsOver] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if ((turnover || name) && !isCreating) {
      setIsCreating(true);
      try {
        const finalTurnover = turnover || 'T000';
        const finalName = name || 'NEW SHOT';
        const finalVersion = typeof version === 'string' ? parseInt(version) || 1 : version;
        await onCreate({ turnover: finalTurnover, name: finalName, version: finalVersion, status: ShotStatus.ACTIVE, thumbnail, alert: false });
        setTurnover('');
        setName('');
        setVersion('');
        setThumbnail(null);
      } finally {
        setIsCreating(false);
      }
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setThumbnail(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex border-b border-studio-accent/20 bg-studio-accent/5 min-w-max h-10">
      <div className="flex shrink-0 border-r border-studio-border bg-studio-surface/20 sticky left-0 z-20 h-full">
        <div className="w-8 border-r border-studio-border/30 flex items-center justify-center bg-studio-accent/10">
          <Plus className="w-3 h-3 text-studio-accent" />
        </div>
        <div className="w-20 px-1 flex items-center">
          <input 
            value={turnover}
            onChange={(e) => setTurnover(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder=""
            className="w-full bg-transparent text-xs font-black text-studio-text/60 outline-none text-center placeholder:text-studio-muted/40 border border-studio-border/10 rounded py-0.5"
          />
        </div>
        <div className="w-48 px-2 flex items-center">
          <input 
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder=""
            className="w-full bg-transparent text-xs font-bold text-studio-text/80 outline-none px-1 placeholder:text-studio-text/50 uppercase tracking-widest border border-studio-border/10 rounded py-0.5"
          />
        </div>
        <div className="w-16 px-1 flex items-center">
          <input 
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="w-full bg-transparent text-xs font-black text-studio-text/60 outline-none text-center border border-studio-border/10 rounded py-0.5"
            placeholder=""
          />
        </div>
        
        <div className="w-24 p-0.5 flex items-center">
           <div 
            onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
            onDragLeave={() => setIsOver(false)}
            onDrop={(e) => {
               e.preventDefault();
               setIsOver(false);
               const file = e.dataTransfer.files[0];
               if (file) handleFileUpload(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-full rounded-sm border border-studio-border border-dashed flex items-center justify-center cursor-pointer hover:border-studio-accent transition-colors overflow-hidden"
          >
            {thumbnail ? (
              <img src={thumbnail} className="w-full h-full object-cover" alt="Preview" />
            ) : (
              <ImageIcon className="w-2.5 h-2.5 text-studio-muted/30" />
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} />
          </div>
        </div>
        <div className="w-36 px-1 flex items-center justify-center">
          <button 
            disabled={(!turnover && !name) || isCreating}
            onClick={handleSubmit}
            className="w-full h-6 rounded-sm bg-studio-accent hover:bg-studio-accent/80 text-white text-[9px] font-black uppercase tracking-widest disabled:opacity-0 transition-all shadow-lg shadow-studio-accent/20"
          >
            {isCreating ? 'ADDING...' : 'CREATE'}
          </button>
        </div>
        <div className="w-12 px-1" />
      </div>
      <div className="flex-1 bg-studio-bg h-full flex">
        {timelineDays.map(day => (
          <div key={day.toISOString()} className="shrink-0 w-[100px] h-full border-r border-studio-border/5" />
        ))}
      </div>
    </div>
  );
}

function ShotBar({ shot, timelineStart, columnWidth, maxDays, onUpdateShot }: { shot: Shot, timelineStart: Date, columnWidth: number, maxDays: number, onUpdateShot: (shot: Shot) => void }) {
  const [localDates, setLocalDates] = useState({ start: shot.startDate, end: shot.endDate });
  
  // Sync local dates with shot prop when not resizing
  const [resizing, setResizing] = useState<'START' | 'END' | 'MOVE' | null>(null);
  
  useEffect(() => {
    if (!resizing) {
      setLocalDates({ start: shot.startDate, end: shot.endDate });
    }
  }, [shot.startDate, shot.endDate, resizing]);

  const diffIn = differenceInDays(localDates.start, timelineStart);
  const duration = differenceInDays(localDates.end, localDates.start) + 1;
  const left = diffIn * columnWidth;
  const width = duration * columnWidth;

  const startX = useRef(0);
  const initialStartDate = useRef<Date>(new Date());
  const initialEndDate = useRef<Date>(new Date());

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX.current;
      const daysDelta = Math.round(deltaX / columnWidth);
      
      if (resizing === 'START') {
        const newStart = addDays(initialStartDate.current, daysDelta);
        if (newStart <= localDates.end) {
          setLocalDates(prev => ({ ...prev, start: newStart }));
        }
      } else if (resizing === 'END') {
        const newEnd = addDays(initialEndDate.current, daysDelta);
        if (newEnd >= localDates.start) {
          setLocalDates(prev => ({ ...prev, end: newEnd }));
        }
      } else if (resizing === 'MOVE') {
        const newStart = addDays(initialStartDate.current, daysDelta);
        const newEnd = addDays(initialEndDate.current, daysDelta);
        setLocalDates({ start: newStart, end: newEnd });
      }
    };

    const handleMouseUp = () => {
      onUpdateShot({ ...shot, startDate: localDates.start, endDate: localDates.end });
      setResizing(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, shot, columnWidth, onUpdateShot, localDates]);

  const startInteraction = (e: React.MouseEvent, type: 'START' | 'END' | 'MOVE') => {
    e.stopPropagation();
    e.preventDefault();
    setResizing(type);
    startX.current = e.clientX;
    initialStartDate.current = shot.startDate;
    initialEndDate.current = shot.endDate;
  };

  if (diffIn + duration < 0 || diffIn > maxDays) return null;

  return (
    <div 
      className={`absolute h-7 rounded-sm border group/bar z-10 origin-left shadow-lg ${STATUS_BAR_COLORS[shot.status]} border-white/5 flex items-center justify-between`}
      style={{ 
        left: Math.max(0, left), 
        width: Math.min(width, maxDays * columnWidth - (left < 0 ? Math.abs(left) : 0)),
      }}
    >
      <div 
        onMouseDown={(e) => startInteraction(e, 'START')}
        className="w-1.5 h-full cursor-ew-resize hover:bg-white/30 transition-colors z-20 shrink-0" 
      />
      <div 
        onMouseDown={(e) => startInteraction(e, 'MOVE')}
        className="flex-1 h-full cursor-grab active:cursor-grabbing" 
      />
      <div 
        onMouseDown={(e) => startInteraction(e, 'END')}
        className="w-1.5 h-full cursor-ew-resize hover:bg-white/30 transition-colors z-20 shrink-0" 
      />
    </div>
  );
}
