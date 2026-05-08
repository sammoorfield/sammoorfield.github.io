import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  where,
  Timestamp,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Project, Shot, Task } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Projects ---

export async function createProject(name: string, description: string): Promise<string> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Unauthorized");
  
  const projectId = crypto.randomUUID();
  const path = `projects/${projectId}`;
  try {
    await setDoc(doc(db, 'projects', projectId), {
      name,
      description,
      ownerId: userId,
      createdAt: Timestamp.now()
    });
    return projectId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return '';
  }
}

export function subscribeProjects(callback: (projects: Project[]) => void) {
  const userId = auth.currentUser?.uid;
  if (!userId) return () => {};

  const q = query(collection(db, 'projects'), where('ownerId', '==', userId), orderBy('createdAt', 'desc'));
  const path = 'projects';
  
  return onSnapshot(q, (snapshot) => {
    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp).toDate()
    } as Project));
    callback(projects);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

// --- Shots ---

export async function createShot(projectId: string, shotData: Partial<Shot>): Promise<string> {
  const shotId = crypto.randomUUID();
  const path = `projects/${projectId}/shots/${shotId}`;
  try {
    const data = {
      ...shotData,
      projectId,
      startDate: Timestamp.fromDate(shotData.startDate || new Date()),
      endDate: Timestamp.fromDate(shotData.endDate || new Date()),
      order: shotData.order || 0
    };
    
    await setDoc(doc(db, 'projects', projectId, 'shots', shotId), data);
    return shotId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return '';
  }
}

export function subscribeShots(projectId: string, callback: (shots: Shot[]) => void) {
  const path = `projects/${projectId}/shots`;
  const q = query(collection(db, 'projects', projectId, 'shots'), orderBy('order', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const shots = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: (doc.data().startDate as Timestamp).toDate(),
      endDate: (doc.data().endDate as Timestamp).toDate()
    } as Shot));
    callback(shots);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function reorderShots(projectId: string, shots: Shot[]) {
  const path = `projects/${projectId}/shots`;
  try {
    const batch = writeBatch(db);
    shots.forEach((shot) => {
      const shotRef = doc(db, 'projects', projectId, 'shots', shot.id);
      batch.update(shotRef, { order: shot.order });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateShotData(projectId: string, shotId: string, updates: Partial<Shot>) {
  const path = `projects/${projectId}/shots/${shotId}`;
  try {
    const data: any = { ...updates };
    if (updates.startDate) data.startDate = Timestamp.fromDate(updates.startDate);
    if (updates.endDate) data.endDate = Timestamp.fromDate(updates.endDate);
    delete data.tasks;
    
    await updateDoc(doc(db, 'projects', projectId, 'shots', shotId), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteShot(projectId: string, shotId: string) {
  const path = `projects/${projectId}/shots/${shotId}`;
  try {
    await deleteDoc(doc(db, 'projects', projectId, 'shots', shotId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Tasks ---

export async function createTask(projectId: string, title: string, order: number) {
  const taskId = crypto.randomUUID();
  const path = `projects/${projectId}/tasks/${taskId}`;
  try {
    await setDoc(doc(db, 'projects', projectId, 'tasks', taskId), {
      title,
      isCompleted: false,
      projectId,
      order
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeTasks(projectId: string, callback: (tasks: Task[]) => void) {
  const path = `projects/${projectId}/tasks`;
  const q = query(collection(db, 'projects', projectId, 'tasks'), orderBy('order', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Task));
    callback(tasks);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function updateTask(projectId: string, taskId: string, updates: Partial<Task>) {
  const path = `projects/${projectId}/tasks/${taskId}`;
  try {
    await updateDoc(doc(db, 'projects', projectId, 'tasks', taskId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteTask(projectId: string, taskId: string) {
  const path = `projects/${projectId}/tasks/${taskId}`;
  try {
    await deleteDoc(doc(db, 'projects', projectId, 'tasks', taskId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function reorderTasks(projectId: string, tasks: Task[]) {
  const path = `projects/${projectId}/tasks`;
  try {
    const batch = writeBatch(db);
    tasks.forEach((task) => {
      const taskRef = doc(db, 'projects', projectId, 'tasks', task.id);
      batch.update(taskRef, { order: task.order });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
