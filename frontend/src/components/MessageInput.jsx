import React, { useState, useRef } from "react";
import { Paperclip, Mic2, Send, Smile } from "lucide-react";
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
    <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl p-4 sticky bottom-0 z-50">
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
            className="w-full px-6 py-4 pr-32 bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 shadow-sm focus:shadow-md transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 resize-none overflow-y-auto"
            disabled={!joinReady || isSending}
            rows={1}
          />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-700 rounded-full transition-all duration-200 disabled:opacity-50"
              disabled={!joinReady}
            >
              <Paperclip className="w-5 h-5" />
            </button>
            
            <button
              type="button"
              className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-700 rounded-full transition-all duration-200 disabled:opacity-50"
              disabled={!joinReady}
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>
        </div>

        <button
          type="button"
          className="p-3.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-700 rounded-full transition-all duration-200 disabled:opacity-50 flex-shrink-0"
          disabled={!joinReady}
        >
          <Mic2 className="w-5 h-5" />
        </button>

        <button
          type="submit"
          disabled={!joinReady || !message.trim() || isSending}
          className={`
            flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-200 flex-shrink-0
            ${
              joinReady && message.trim()
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-blue-500/25 hover:shadow-blue-400/50 hover:scale-105 active:scale-95"
                : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            }
          `}
        >
          <Send
            className={`w-5 h-5 transition-transform ${isSending ? "animate-pulse" : ""}`}
          />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
