import { openDB } from 'idb';

const DATABASE_NAME = 'chatweb_db';
const DATABASE_VERSION = 1;

export const initDB = async () => {
    return openDB(DATABASE_NAME, DATABASE_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('messages')) {
                const store = db.createObjectStore('messages', {
                    keyPath: 'id',
                    autoIncrement: true,
                });
                store.createIndex('conversationId', 'conversationId');
                store.createIndex('timestamp', 'timestamp');
                store.createIndex('status', 'status');
            }
        },
    });
};

export const saveMessage = async (message) => {
    const db = await initDB();
    const messageToSave = {
        ...message,
        timestamp: message.timestamp || new Date().toISOString(),
        status: message.status || 'pending', // 'pending' or 'synced'
    };
    return db.add('messages', messageToSave);
};

export const getMessagesByConversation = async (conversationId) => {
    const db = await initDB();
    return db.getAllFromIndex('messages', 'conversationId', conversationId);
};

export const updateMessageStatus = async (id, status) => {
    const db = await initDB();
    const tx = db.transaction('messages', 'readwrite');
    const store = tx.objectStore('messages');
    const message = await store.get(id);
    if (message) {
        message.status = status;
        await store.put(message);
    }
    return tx.done;
};
