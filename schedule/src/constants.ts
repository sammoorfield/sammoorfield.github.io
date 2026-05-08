import { ShotStatus } from './types.ts';

export const STATUS_OPTIONS = Object.values(ShotStatus);

export const STATUS_COLORS: Record<ShotStatus, string> = {
  [ShotStatus.ACTIVE]: 'bg-blue-600 text-white border-blue-500',
  [ShotStatus.IN_PROGRESS]: 'bg-cyan-600 text-white border-cyan-500',
  [ShotStatus.RENDER]: 'bg-indigo-600 text-white border-indigo-500',
  [ShotStatus.DELIVERED_DRAFT]: 'bg-teal-600 text-white border-teal-500',
  [ShotStatus.APPROVED_DRAFT]: 'bg-emerald-600 text-white border-emerald-500',
  [ShotStatus.DELIVERED_FINAL]: 'bg-green-600 text-white border-green-500',
  [ShotStatus.ON_HOLD]: 'bg-slate-600 text-white border-slate-500',
  [ShotStatus.CANCELLED]: 'bg-red-600 text-white border-red-500'
};

export const STATUS_BAR_COLORS: Record<ShotStatus, string> = {
  [ShotStatus.ACTIVE]: 'bg-blue-500',
  [ShotStatus.IN_PROGRESS]: 'bg-cyan-500',
  [ShotStatus.RENDER]: 'bg-indigo-500',
  [ShotStatus.DELIVERED_DRAFT]: 'bg-teal-500',
  [ShotStatus.APPROVED_DRAFT]: 'bg-emerald-500',
  [ShotStatus.DELIVERED_FINAL]: 'bg-green-500',
  [ShotStatus.ON_HOLD]: 'bg-slate-500',
  [ShotStatus.CANCELLED]: 'bg-red-500'
};
