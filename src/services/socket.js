import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const connectSocket = () => {
    if (socket?.connected) {
        return socket;
    }

    socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    });

    socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
    });

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const getSocket = () => {
    if (!socket) {
        return connectSocket();
    }
    return socket;
};

// Event listeners
export const onNewRequest = (callback) => {
    const s = getSocket();
    s.on('newRequest', callback);
    return () => s.off('newRequest', callback);
};

export const onQueueUpdated = (callback) => {
    const s = getSocket();
    s.on('queueUpdated', callback);
    return () => s.off('queueUpdated', callback);
};

export const onRequestDequeued = (callback) => {
    const s = getSocket();
    s.on('requestDequeued', callback);
    return () => s.off('requestDequeued', callback);
};

export const onStatusUpdated = (callback) => {
    const s = getSocket();
    s.on('statusUpdated', callback);
    return () => s.off('statusUpdated', callback);
};

export const onHighPriorityAlert = (callback) => {
    const s = getSocket();
    s.on('highPriorityAlert', callback);
    return () => s.off('highPriorityAlert', callback);
};

export const onQueueState = (callback) => {
    const s = getSocket();
    s.on('queueState', callback);
    return () => s.off('queueState', callback);
};

export const requestQueueUpdate = () => {
    const s = getSocket();
    s.emit('requestQueueUpdate');
};

export default {
    connectSocket,
    disconnectSocket,
    getSocket,
    onNewRequest,
    onQueueUpdated,
    onRequestDequeued,
    onStatusUpdated,
    onHighPriorityAlert,
    onQueueState,
    requestQueueUpdate
};
