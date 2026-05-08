import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Task } from '../types.ts';
import { CheckCircle2, Circle, Plus, Trash2, Filter, GripVertical } from 'lucide-react';
import { motion, Reorder, useDragControls } from 'motion/react';
import { subscribeTasks, updateTask, deleteTask, createTask, reorderTasks } from '../services/firebaseService.ts';

interface TodoViewProps {
  activeProjectId: string;
}

export default function TodoView({ activeProjectId }: TodoViewProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  useEffect(() => {
    if (!activeProjectId) return;
    return subscribeTasks(activeProjectId, (newTasks) => {
      setTasks(newTasks);
    });
  }, [activeProjectId]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (filter === 'ACTIVE') return !t.isCompleted;
      if (filter === 'COMPLETED') return t.isCompleted;
      return true;
    });
  }, [tasks, filter]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await createTask(activeProjectId, newTaskTitle, tasks.length);
    setNewTaskTitle('');
  };

  const handleToggle = (task: Task) => {
    updateTask(activeProjectId, task.id, { isCompleted: !task.isCompleted });
  };

  const handleDelete = (taskId: string) => {
    deleteTask(activeProjectId, taskId);
  };

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleReorder = (newTasks: Task[]) => {
    let updatedFullList: Task[];
    
    if (filter !== 'ALL') {
      updatedFullList = [...tasks];
      const visibleIds = new Set(newTasks.map(t => t.id));
      const indices = tasks
        .map((t, i) => ({ id: t.id, index: i }))
        .filter(item => visibleIds.has(item.id))
        .map(item => item.index);
      
      newTasks.forEach((task, i) => {
        updatedFullList[indices[i]] = task;
      });
      
      updatedFullList = updatedFullList.map((t, i) => ({ ...t, order: i }));
    } else {
      updatedFullList = newTasks.map((task, index) => ({ ...task, order: index }));
    }

    setTasks(updatedFullList); // Local update for smooth drag
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      await reorderTasks(activeProjectId, updatedFullList);
    }, 1000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row gap-4">
        <form onSubmit={handleCreateTask} className="flex-1 flex gap-2">
          <input 
            type="text" 
            placeholder="" 
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-1 bg-studio-surface border border-studio-border rounded-xl px-4 py-3 text-studio-text focus:outline-none focus:border-studio-accent transition-all font-mono text-sm placeholder:text-studio-text/50"
          />
          <button 
            type="submit"
            className="px-6 bg-studio-accent text-white rounded-xl font-bold hover:bg-studio-accent/90 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add
          </button>
        </form>

        <div className="flex items-center gap-2 bg-studio-surface border border-studio-border rounded-xl px-3 group transition-all hover:border-studio-muted">
          <Filter className="w-4 h-4 text-studio-muted" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="py-3 bg-transparent text-xs font-bold text-studio-text outline-none cursor-pointer uppercase tracking-widest"
          >
            <option value="ALL">All Jobs</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      <div className="bg-studio-surface border border-studio-border rounded-2xl overflow-hidden shadow-xl">
        <Reorder.Group axis="y" values={filteredTasks} onReorder={handleReorder} className="divide-y divide-studio-border min-h-[200px]">
          {filteredTasks.map((task) => (
            <TaskRow 
              key={task.id} 
              task={task} 
              onToggle={handleToggle} 
              onDelete={handleDelete} 
            />
          ))}

          {filteredTasks.length === 0 && (
            <div className="py-24 text-center">
              <p className="text-studio-muted text-sm italic font-mono uppercase tracking-[0.2em] opacity-40">Null_Queue // No Tasks</p>
            </div>
          )}
        </Reorder.Group>
      </div>
    </div>
  );
}

interface TaskRowProps {
  key: string;
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

function TaskRow({ task, onToggle, onDelete }: TaskRowProps) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={task}
      dragControls={dragControls}
      dragListener={false}
      className="group px-6 py-4 flex items-center gap-4 hover:bg-studio-bg bg-studio-surface"
    >
      <div 
        onPointerDown={(e) => dragControls.start(e)}
        className="w-6 flex items-center justify-center text-studio-muted group-hover:text-studio-text cursor-grab active:cursor-grabbing transition-colors"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      <button 
        onClick={() => onToggle(task)}
        className="shrink-0 transition-transform active:scale-90"
      >
        {task.isCompleted ? (
          <CheckCircle2 className="w-6 h-6 text-studio-accent" />
        ) : (
          <Circle className="w-6 h-6 text-studio-border group-hover:text-studio-muted transition-colors" />
        )}
      </button>
      
      <span className={`flex-1 text-sm font-medium transition-all font-mono ${task.isCompleted ? 'text-studio-muted line-through opacity-50' : 'text-studio-text'}`}>
        {task.title}
      </span>

      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
        <button 
          onClick={() => onDelete(task.id)}
          className="p-2 text-studio-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </Reorder.Item>
  );
}
