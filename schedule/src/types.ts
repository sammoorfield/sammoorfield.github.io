export enum ShotStatus {
  ACTIVE = 'ACTIVE',
  IN_PROGRESS = 'IN PROGRESS',
  RENDER = 'RENDER',
  DELIVERED_DRAFT = 'DELIVERED (DRAFT)',
  APPROVED_DRAFT = 'APPROVED (DRAFT)',
  DELIVERED_FINAL = 'DELIVERED (FINAL)',
  ON_HOLD = 'ON HOLD',
  CANCELLED = 'CANCELLED'
}

export interface Shot {
  id: string;
  turnover: string;
  name: string;
  version: number;
  thumbnail: string | null;
  status: ShotStatus;
  alert: boolean;
  startDate: Date;
  endDate: Date;
  projectId: string;
  order: number;
}

export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  projectId: string;
  order: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  ownerId: string;
}
