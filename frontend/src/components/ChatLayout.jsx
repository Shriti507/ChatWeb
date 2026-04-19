import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./Sidebar";
import MessageListPanel from "./MessageListPanel";
import ChatArea from "./ChatArea";
import {
  getMessagesByConversation,
  getPendingMessages,
  updateMessageByClientMessageId,
  upsertServerMessage,
} from "../utils/db";
import { socket } from "../socket";
import { authHeaders, getCurrentUserId } from "../utils/session";

const API_URL = "http://localhost:3000/api";
const MAX_RETRY = 5;

const toUiMessage = (serverMessage, currentUserId) => ({
  id: serverMessage.id,
  serverMessageId: serverMessage.id,
  clientMessageId: serverMessage.clientMessageId,
  conversationId: String(serverMessage.conversationId),
  senderId: serverMessage.senderId,
  sender:
    serverMessage.senderId === currentUserId ? "Me" : serverMessage.senderId,
  text: serverMessage.text,
  time: new Date(serverMessage.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }),
  self: serverMessage.senderId === currentUserId,
  status: "sent",
  timestamp: serverMessage.createdAt,
});

const ChatLayout = ({ onLogout }) => {
  const userId = getCurrentUserId();
  const [selectedChat, setSelectedChat] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [typingUserIds, setTypingUserIds] = useState(new Set());
  const [socketJoinState, setSocketJoinState] = useState({
    conversationId: null,
    status: "idle",
    error: null,
  });

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/conversations`, {
        headers: authHeaders(),
      });
      if (response.ok) {
        const convos = await response.json();
        setConversations(
          convos.map((convo) => ({
            id: convo.id,
            name:
              convo.name ||
              convo.participants?.map((p) => p.name).join(", ") ||
              "Unnamed",
            lastMessage: convo.lastMessage,
            time: new Date(convo.updatedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            participants: convo.participants || [],
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch all users for discovery
  const fetchAllUsers = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: authHeaders(),
      });
      if (response.ok) {
        setAllUsers(await response.json());
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  }, []);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const syncFromServer = async (conversationId) => {
    setIsSyncing(true);
    try {
      const local = await getMessagesByConversation(String(conversationId));
      const lastTimestamp = local.reduce((max, msg) => {
        if (!msg.timestamp) return max;
        const t = new Date(msg.timestamp).toISOString();
        return t > max ? t : max;
      }, "");

      const query = new URLSearchParams();
      if (lastTimestamp) query.set("after", lastTimestamp);

      const response = await fetch(
        `${API_URL}/messages/${conversationId}?${query.toString()}`,
        { headers: authHeaders() }
      );
      if (!response.ok) return;

      const serverMessages = await response.json();
      for (const serverMessage of serverMessages) {
        await upsertServerMessage(toUiMessage(serverMessage, userId));
      }
      const merged = await getMessagesByConversation(String(conversationId));
      setMessages(merged);
    } finally {
      setIsSyncing(false);
    }
  };

  const sendPendingMessage = async (pendingMessage, conversationId) => {
    if (!socket.connected) return;
    const retryCount = pendingMessage.retryCount || 0;

    if (retryCount >= MAX_RETRY) {
      await updateMessageByClientMessageId(pendingMessage.clientMessageId, {
        status: "failed",
      });
      setMessages((prev) =>
        prev.map((msg) =>
          msg.clientMessageId === pendingMessage.clientMessageId
            ? { ...msg, status: "failed" }
            : msg
        )
      );
      return;
    }

    socket.emit(
      "send_message",
      {
        conversationId: String(conversationId),
        text: pendingMessage.text,
        clientMessageId: pendingMessage.clientMessageId,
      },
      async (ack) => {
        if (ack?.status === "stored") {
          await updateMessageByClientMessageId(pendingMessage.clientMessageId, {
            status: "sent",
            serverMessageId: ack.messageId,
          });
          setMessages((prev) =>
            prev.map((msg) =>
              msg.clientMessageId === pendingMessage.clientMessageId
                ? { ...msg, status: "sent", serverMessageId: ack.messageId }
                : msg
            )
          );
          return;
        }

        const nextRetry = retryCount + 1;
        const delayMs = Math.min(30000, 2 ** nextRetry * 1000);
        await updateMessageByClientMessageId(pendingMessage.clientMessageId, {
          retryCount: nextRetry,
          nextRetryAt: Date.now() + delayMs,
          status: nextRetry >= MAX_RETRY ? "failed" : "pending",
        });
      }
    );
  };

  const flushPendingQueue = async (conversationId) => {
    const pending = await getPendingMessages(String(conversationId));
    for (const pendingMessage of pending) {
      await sendPendingMessage(pendingMessage, conversationId);
    }
  };

  useEffect(() => {
    if (!selectedChat?.id) {
      setSocketJoinState({ conversationId: null, status: "idle", error: null });
      setMessages([]);
      return;
    }
    const conversationId = String(selectedChat.id);
    setSocketJoinState({ conversationId, status: "joining", error: null });

    socket.emit("join_conversation", conversationId, (ack) => {
      setSocketJoinState((prev) => {
        if (prev.conversationId !== conversationId) return prev;
        if (ack?.ok) return { conversationId, status: "joined", error: null };
        return {
          conversationId,
          status: "error",
          error: ack?.error || "JOIN_FAILED",
        };
      });
      if (ack?.ok) {
        syncFromServer(conversationId);
        flushPendingQueue(conversationId);
      }
    });
    return () => {
      socket.emit("leave_conversation", conversationId);
      setSocketJoinState({ conversationId: null, status: "idle", error: null });
    };
  }, [selectedChat?.id]);

  useEffect(() => {
    const handlePresenceState = (payload) => {
      if (!selectedChat?.id) return;
      if (String(payload?.conversationId) !== String(selectedChat.id)) return;
      setOnlineUserIds(new Set(payload?.onlineUserIds || []));
    };
    const handleUserOnline = (payload) => {
      if (!selectedChat?.id) return;
      if (String(payload?.conversationId) !== String(selectedChat.id)) return;
      setOnlineUserIds(
        (prev) => new Set([...Array.from(prev), payload.userId])
      );
    };
    const handleUserOffline = (payload) => {
      if (!selectedChat?.id) return;
      if (String(payload?.conversationId) !== String(selectedChat.id)) return;
      setOnlineUserIds((prev) => {
        const next = new Set(Array.from(prev));
        next.delete(payload.userId);
        return next;
      });
    };

    const handleTypingStart = (payload) => {
      if (!selectedChat?.id) return;
      if (String(payload?.conversationId) !== String(selectedChat.id)) return;
      if (payload.userId === userId) return;
      setTypingUserIds(
        (prev) => new Set([...Array.from(prev), payload.userId])
      );
    };
    const handleTypingStop = (payload) => {
      if (!selectedChat?.id) return;
      if (String(payload?.conversationId) !== String(selectedChat.id)) return;
      setTypingUserIds((prev) => {
        const next = new Set(Array.from(prev));
        next.delete(payload.userId);
        return next;
      });
    };

    socket.on("presence_state", handlePresenceState);
    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);
    socket.on("typing_start", handleTypingStart);
    socket.on("typing_stop", handleTypingStop);
    return () => {
      socket.off("presence_state", handlePresenceState);
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
      socket.off("typing_start", handleTypingStart);
      socket.off("typing_stop", handleTypingStop);
    };
  }, [selectedChat?.id, userId]);

  useEffect(() => {
    if (selectedChat) {
      const loadLocalMessages = async () => {
        const localMsgs = await getMessagesByConversation(
          String(selectedChat.id)
        );
        setMessages(localMsgs);
      };
      loadLocalMessages();
    } else {
      setMessages([]);
    }
  }, [selectedChat]);

  useEffect(() => {
    const handleReceiveMessage = (data) => {
      const uiMessage = toUiMessage(data, userId);
      upsertServerMessage(uiMessage);
      if (
        selectedChat &&
        String(data.conversationId) === String(selectedChat.id)
      ) {
        setMessages((prev) => [...prev, uiMessage]);
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [selectedChat, userId]);

  const socketJoinReady =
    Boolean(selectedChat?.id) &&
    socketJoinState.status === "joined" &&
    socketJoinState.conversationId === String(selectedChat.id);

  const handleMessageSent = (newMessage) => {
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleMessageStatusChange = (
    clientMessageId,
    status,
    serverMessageId
  ) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.clientMessageId === clientMessageId
          ? { ...msg, status, ...(serverMessageId ? { serverMessageId } : {}) }
          : msg
      )
    );
  };

  const handleStartChat = async (targetUserId) => {
    try {
      const response = await fetch(`${API_URL}/conversation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ targetUserId }),
      });
      if (response.ok) {
        const conversation = await response.json();
        const otherUser = conversation.participants.find(
          (p) => p.id !== userId
        );
        const formattedConvo = {
          id: conversation.id,
          name: otherUser ? otherUser.name : "Chat",
          participants: conversation.participants,
        };
        setSelectedChat(formattedConvo);
        fetchConversations(); // refresh list
      }
    } catch (error) {
      console.error("Failed to start chat:", error);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar onLogout={onLogout} />

      <MessageListPanel
        onSelectChat={setSelectedChat}
        selectedChat={selectedChat}
        conversations={conversations}
        allUsers={allUsers}
        onStartChat={handleStartChat}
        onlineUserIds={onlineUserIds}
      />
      <ChatArea
        selectedChat={selectedChat}
        messages={messages}
        onMessageSent={handleMessageSent}
        onMessageStatusChange={handleMessageStatusChange}
        currentUserId={userId}
        isSyncing={isSyncing}
        onlineCount={onlineUserIds.size}
        isOtherTyping={typingUserIds.size > 0}
        socketJoinReady={socketJoinReady}
        socketJoinError={
          socketJoinState.status === "error" ? socketJoinState.error : null
        }
        socketJoinLoading={socketJoinState.status === "joining"}
      />
    </div>
  );
};

export default ChatLayout;
