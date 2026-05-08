import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion } from 'motion/react';

interface ProjectModalProps {
  onClose: () => void;
  onSubmit: (name: string, description: string) => void;
}

export default function ProjectModal({ onClose, onSubmit }: ProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name, description);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-studio-surface border border-studio-border w-full max-w-md rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-studio-border flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-white">Create New Project</h2>
          <button onClick={onClose} className="text-studio-muted hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-studio-muted uppercase tracking-wider">Project Name</label>
            <input 
              autoFocus
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-studio-bg border border-studio-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-studio-accent transition-colors placeholder:text-studio-muted/70"
              placeholder=""
              required
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-studio-muted uppercase tracking-wider">Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-studio-bg border border-studio-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-studio-accent transition-colors min-h-[100px] resize-none placeholder:text-studio-muted/70"
              placeholder=""
            />
          </div>
          
          <div className="pt-2 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 bg-studio-border hover:bg-studio-border/80 text-studio-text py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-2 bg-studio-accent hover:bg-studio-accent/90 text-white py-2.5 rounded-lg text-sm font-semibold shadow-lg shadow-studio-accent/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Create Project
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
