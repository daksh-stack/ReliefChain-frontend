import { openDB } from 'idb';

const DB_NAME = 'DisasterReliefDB';
const DB_VERSION = 1;
const STORES = {
    PENDING_UPDATES: 'pendingUpdates',
    CACHED_REQUESTS: 'cachedRequests',
    USER_DATA: 'userData'
};

let db = null;

// Initialize IndexedDB
export const initDB = async () => {
    try {
        db = await openDB(DB_NAME, DB_VERSION, {
            upgrade(database) {
                // Store for pending status updates (offline sync)
                if (!database.objectStoreNames.contains(STORES.PENDING_UPDATES)) {
                    database.createObjectStore(STORES.PENDING_UPDATES, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                }

                // Store for cached requests
                if (!database.objectStoreNames.contains(STORES.CACHED_REQUESTS)) {
                    const store = database.createObjectStore(STORES.CACHED_REQUESTS, {
                        keyPath: '_id'
                    });
                    store.createIndex('status', 'status');
                }

                // Store for user data
                if (!database.objectStoreNames.contains(STORES.USER_DATA)) {
                    database.createObjectStore(STORES.USER_DATA, {
                        keyPath: 'key'
                    });
                }
            }
        });

        console.log('IndexedDB initialized');
        return db;
    } catch (error) {
        console.error('Failed to initialize IndexedDB:', error);
        return null;
    }
};

// Get DB instance
export const getDB = async () => {
    if (!db) {
        await initDB();
    }
    return db;
};

// Pending Updates Operations
export const addPendingUpdate = async (update) => {
    const database = await getDB();
    if (!database) return null;

    return database.add(STORES.PENDING_UPDATES, {
        ...update,
        timestamp: Date.now()
    });
};

export const getPendingUpdates = async () => {
    const database = await getDB();
    if (!database) return [];

    return database.getAll(STORES.PENDING_UPDATES);
};

export const removePendingUpdate = async (id) => {
    const database = await getDB();
    if (!database) return;

    return database.delete(STORES.PENDING_UPDATES, id);
};

export const clearPendingUpdates = async () => {
    const database = await getDB();
    if (!database) return;

    return database.clear(STORES.PENDING_UPDATES);
};

// Cached Requests Operations
export const cacheRequests = async (requests) => {
    const database = await getDB();
    if (!database) return;

    const tx = database.transaction(STORES.CACHED_REQUESTS, 'readwrite');
    const store = tx.objectStore(STORES.CACHED_REQUESTS);

    // Clear old data
    await store.clear();

    // Add new data
    for (const request of requests) {
        await store.put(request);
    }

    await tx.done;
};

export const getCachedRequests = async () => {
    const database = await getDB();
    if (!database) return [];

    return database.getAll(STORES.CACHED_REQUESTS);
};

export const getCachedRequestById = async (id) => {
    const database = await getDB();
    if (!database) return null;

    return database.get(STORES.CACHED_REQUESTS, id);
};

// User Data Operations
export const saveUserData = async (key, value) => {
    const database = await getDB();
    if (!database) return;

    return database.put(STORES.USER_DATA, { key, value });
};

export const getUserData = async (key) => {
    const database = await getDB();
    if (!database) return null;

    const data = await database.get(STORES.USER_DATA, key);
    return data?.value || null;
};

// Network status detection
export const isOnline = () => {
    return navigator.onLine;
};

// Sync pending updates when online
export const syncPendingUpdates = async (updateStatusFn) => {
    if (!isOnline()) {
        console.log('Still offline, cannot sync');
        return { synced: 0, failed: 0 };
    }

    const pendingUpdates = await getPendingUpdates();
    let synced = 0;
    let failed = 0;

    for (const update of pendingUpdates) {
        try {
            await updateStatusFn(update.requestId, update.status);
            await removePendingUpdate(update.id);
            synced++;
        } catch (error) {
            console.error('Failed to sync update:', update, error);
            failed++;
        }
    }

    console.log(`Sync complete: ${synced} synced, ${failed} failed`);
    return { synced, failed };
};

// Register online/offline event listeners
export const registerNetworkListeners = (onOnline, onOffline) => {
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
        window.removeEventListener('online', onOnline);
        window.removeEventListener('offline', onOffline);
    };
};

export default {
    initDB,
    getDB,
    addPendingUpdate,
    getPendingUpdates,
    removePendingUpdate,
    clearPendingUpdates,
    cacheRequests,
    getCachedRequests,
    getCachedRequestById,
    saveUserData,
    getUserData,
    isOnline,
    syncPendingUpdates,
    registerNetworkListeners
};
