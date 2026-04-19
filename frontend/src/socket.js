import { io } from "socket.io-client";
import { getToken } from "./utils/session";

import { API } from "./utils/api";

const SOCKET_URL = API;

export const socket = io(SOCKET_URL, {
    autoConnect: false,
    auth: { token: getToken() },
});

export const connectSocketWithToken = () => {
    socket.auth = { token: getToken() };
    if (!socket.connected) {
        socket.connect();
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};
