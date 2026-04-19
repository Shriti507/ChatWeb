import React, { useState, useRef } from "react";
import { Paperclip, Mic2, Send } from "lucide-react";
import { socket } from "../socket";
import { saveMessage } from "../utils/db";

const MessageInput = ({
  selectedChat,
  currentUserId,
  onMessageSent,
  onMessageStatusChange,
  joinReady = false,
}) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const inputRef = useRef(null);
  const formRef = useRef(null);

  const emitTyping = (isTyping) => {
    if (!selectedChat?.id || !joinReady) return;
    const conversationId = String(selectedChat.id);
    socket.emit(isTyping ? "typing_start" : "typing_stop", { conversationId });
  };

  const handleTyping = (value) => {
    setMessage(value);

    
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }


    emitTyping(true);

    
    const timeout = setTimeout(() => {
      emitTyping(false);
    }, 1000);

    setTypingTimeout(timeout);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !joinReady || isSending || !selectedChat) return;

    const clientMessageId = crypto.randomUUID();
    const newMessage = {
      conversationId: String(selectedChat.id),
      senderId: currentUserId,
      sender: "Me",
      text: message.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      self: true,
      status: "pending",
      clientMessageId,
      timestamp: new Date().toISOString(),
    };

    try {
      setIsSending(true);
      await saveMessage(newMessage);
      onMessageSent(newMessage);

      socket.emit("send_message", newMessage, (ack) => {
        if (ack?.status === "stored") {
          onMessageStatusChange?.(clientMessageId, "sent", ack.messageId);
        } else {
          onMessageStatusChange?.(clientMessageId, "failed");
        }
        setIsSending(false);
      });
    } catch (error) {
      console.error("Failed to save message:", error);
      setIsSending(false);
    }

    setMessage("");
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm shadow-2xl dark:border-gray-700 dark:bg-gray-900/80 p-4 sticky bottom-0 z-50">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex items-end gap-3 max-w-4xl mx-auto"
      >
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            value={message}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              !joinReady
                ? "Join conversation to message..."
                : isSending
                  ? "Sending..."
                  : "Type a message..."
            }
            className="w-full p-4 pr-12 py-5 bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-3xl text-base focus:outline-none focus:ring-4 focus:ring-pink-200/50 focus:border-pink-300 shadow-lg backdrop-blur-sm dark:focus:ring-pink-500/20 dark:focus:border-pink-600/50 resize-none transition-all duration-200 hover:shadow-xl max-h-32 overflow-y-auto"
            disabled={!joinReady || isSending}
            rows={1}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-2xl transition-all dark:text-gray-500 dark:hover:text-white dark:hover:bg-gray-700"
            disabled={!joinReady}
          >
            <Paperclip className="w-5 h-5" />
          </button>
        </div>

        <button
          type="button"
          className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-3xl transition-all dark:text-gray-500 dark:hover:text-white dark:hover:bg-gray-700 flex-shrink-0"
          disabled={!joinReady}
        >
          <Mic2 className="w-5 h-5" />
        </button>

        <button
          type="submit"
          disabled={!joinReady || !message.trim() || isSending}
          className={`
                        flex items-center justify-center w-14 h-14 rounded-3xl shadow-xl transition-all duration-200 flex-shrink-0
                        ${
                          joinReady && message.trim()
                            ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 shadow-pink-500/25 hover:shadow-pink-400/50 hover:scale-105 active:scale-95"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                        }
                    `}
        >
          <Send
            className={`w-6 h-6 transition-transform ${isSending ? "animate-spin" : ""}`}
          />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
