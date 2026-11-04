/**
 * DeliverIQ Offline Storage Manager (IndexedDB)
 * Stores captured PODs during highway dead zones & syncs automatically
 * when connectivity is restored.
 */

export interface QueuedPOD {
  id: string; // unique queue ID
  tripId: string;
  blob: Blob;
  fileName: string;
  gpsLat: number | null;
  gpsLng: number | null;
  gpsAccuracy: number | null;
  gpsLocationName: string | null;
  capturedAt: string;
  attempts: number;
}

const DB_NAME = 'DeliverIQ_OfflineDB';
const STORE_NAME = 'pending_pods';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB not supported on server'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function queueOfflinePOD(pod: Omit<QueuedPOD, 'id' | 'attempts'>): Promise<string> {
  const db = await openDB();
  const id = `queued_${pod.tripId}_${Date.now()}`;
  const record: QueuedPOD = {
    ...pod,
    id,
    attempts: 0,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.add(record);
    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });
}

export async function getQueuedPODs(): Promise<QueuedPOD[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

export async function removeQueuedPOD(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function syncQueuedPODs(
  onProgress?: (syncedCount: number, total: number) => void
): Promise<{ syncedCount: number; errors: number }> {
  const queued = await getQueuedPODs();
  if (queued.length === 0) return { syncedCount: 0, errors: 0 };

  let synced = 0;
  let errors = 0;

  for (const item of queued) {
    try {
      const formData = new FormData();
      formData.append('tripId', item.tripId);
      formData.append('file', item.blob, item.fileName);
      if (item.gpsLat) formData.append('gpsLat', String(item.gpsLat));
      if (item.gpsLng) formData.append('gpsLng', String(item.gpsLng));
      if (item.gpsAccuracy) formData.append('gpsAccuracy', String(item.gpsAccuracy));
      if (item.gpsLocationName) formData.append('gpsLocationName', item.gpsLocationName);
      formData.append('isOfflineSync', 'true');

      const res = await fetch('/api/pod/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        await removeQueuedPOD(item.id);
        synced++;
        if (onProgress) onProgress(synced, queued.length);
      } else {
        errors++;
      }
    } catch {
      errors++;
    }
  }

  return { syncedCount: synced, errors };
}
