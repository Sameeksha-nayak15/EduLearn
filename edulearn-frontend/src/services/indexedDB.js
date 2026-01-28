const DB_NAME = 'EduLearnDB';
const DB_VERSION = 1;
const VIDEOS_STORE = 'videos';
const PROGRESS_STORE = 'videoProgress';

let db = null;

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Create videos store
      if (!database.objectStoreNames.contains(VIDEOS_STORE)) {
        const videoStore = database.createObjectStore(VIDEOS_STORE, { keyPath: 'id' });
        videoStore.createIndex('videoId', 'videoId', { unique: true });
      }

      // Create video progress store
      if (!database.objectStoreNames.contains(PROGRESS_STORE)) {
        database.createObjectStore(PROGRESS_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

// Store video metadata in IndexedDB (NOT the actual video file)
export const saveVideoMetadata = (video) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([VIDEOS_STORE], 'readwrite');
    const store = transaction.objectStore(VIDEOS_STORE);
    const request = store.put({
      id: video.id,
      videoId: video.id,
      title: video.title,
      description: video.description,
      subject: video.subject,
      video_url: video.video_url,
      video_type: video.video_type,
      uploaded_by: video.uploaded_by,
      savedAt: new Date().toISOString(),
    });

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Get all cached videos
export const getCachedVideos = () => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([VIDEOS_STORE], 'readonly');
    const store = transaction.objectStore(VIDEOS_STORE);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Get single cached video
export const getCachedVideo = (videoId) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([VIDEOS_STORE], 'readonly');
    const store = transaction.objectStore(VIDEOS_STORE);
    const index = store.index('videoId');
    const request = index.get(videoId);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Delete cached video
export const deleteCachedVideo = (videoId) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([VIDEOS_STORE], 'readwrite');
    const store = transaction.objectStore(VIDEOS_STORE);
    const index = store.index('videoId');
    const getRequest = index.get(videoId);

    getRequest.onsuccess = () => {
      const video = getRequest.result;
      if (video) {
        const deleteRequest = store.delete(video.id);
        deleteRequest.onsuccess = () => resolve(true);
        deleteRequest.onerror = () => reject(deleteRequest.error);
      } else {
        resolve(false);
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
};

// Save video progress
export const saveVideoProgress = (userId, videoId, lastWatchedTime, completed) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([PROGRESS_STORE], 'readwrite');
    const store = transaction.objectStore(PROGRESS_STORE);
    const request = store.put({
      userId,
      videoId,
      lastWatchedTime,
      completed,
      updatedAt: new Date().toISOString(),
    });

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Get video progress for user
export const getVideoProgress = (userId, videoId) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([PROGRESS_STORE], 'readonly');
    const store = transaction.objectStore(PROGRESS_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      const results = request.result.filter(
        (p) => p.userId === userId && p.videoId === videoId
      );
      resolve(results.length > 0 ? results[0] : null);
    };
    request.onerror = () => reject(request.error);
  });
};

// Clear all cached data
export const clearAllCachedData = () => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([VIDEOS_STORE, PROGRESS_STORE], 'readwrite');
    const videoRequest = transaction.objectStore(VIDEOS_STORE).clear();
    const progressRequest = transaction.objectStore(PROGRESS_STORE).clear();

    transaction.oncomplete = () => resolve(true);
    transaction.onerror = () => reject(transaction.error);
  });
};