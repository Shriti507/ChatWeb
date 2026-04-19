import { openDB } from 'idb';

const DATABASE_NAME = 'chatweb_db';
const DATABASE_VERSION = 2;

export const initDB = async () => {
    return openDB(DATABASE_NAME, DATABASE_VERSION, {
        upgrade(db, _oldVersion, _newVersion, transaction) {
            if (!db.objectStoreNames.contains('messages')) {
                const store = db.createObjectStore('messages', {
                    keyPath: 'id',
                    autoIncrement: true,
                });
                store.createIndex('conversationId', 'conversationId');
                store.createIndex('timestamp', 'timestamp');
                store.createIndex('status', 'status');
                store.createIndex('clientMessageId', 'clientMessageId', { unique: false });
                return;
            }

            const store = transaction.objectStore('messages');
            if (!store.indexNames.contains('clientMessageId')) {
                store.createIndex('clientMessageId', 'clientMessageId', { unique: false });
            }
        },
    });
};

export const saveMessage = async (message) => {
    const db = await initDB();
    const messageToSave = {
        ...message,
        timestamp: message.timestamp || new Date().toISOString(),
        status: message.status || 'pending',
        retryCount: message.retryCount || 0,
        nextRetryAt: message.nextRetryAt || Date.now(),
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

export const updateMessageByClientMessageId = async (clientMessageId, patch) => {
    const db = await initDB();
    const tx = db.transaction('messages', 'readwrite');
    const index = tx.objectStore('messages').index('clientMessageId');
    const matches = await index.getAll(clientMessageId);
    for (const message of matches) {
        await tx.objectStore('messages').put({ ...message, ...patch });
    }
    return tx.done;
};

export const getPendingMessages = async (conversationId) => {
    const db = await initDB();
    const now = Date.now();
    const messages = await db.getAllFromIndex('messages', 'conversationId', conversationId);
    return messages.filter(
        (msg) => msg.status === 'pending' && (msg.nextRetryAt || 0) <= now
    );
};

export const upsertServerMessage = async (message) => {
    const db = await initDB();
    const tx = db.transaction('messages', 'readwrite');
    const store = tx.objectStore('messages');
    const existing = message.clientMessageId
        ? await store.index('clientMessageId').get(message.clientMessageId)
        : undefined;

    if (existing) {
        await store.put({ ...existing, ...message, id: existing.id, status: 'sent' });
    } else {
        await store.add({
            conversationId: message.conversationId,
            sender: message.self ? 'Me' : message.senderId,
            text: message.text,
            time: message.time,
            self: message.self,
            status: message.status || 'sent',
            clientMessageId: message.clientMessageId,
            timestamp: message.timestamp || new Date().toISOString(),
            serverMessageId: message.serverMessageId,
            retryCount: 0,
            nextRetryAt: Date.now(),
        });
    }
    return tx.done;
};
