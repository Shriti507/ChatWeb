import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import MessageListPanel from './MessageListPanel';
import ChatArea from './ChatArea';
import { getMessagesByConversation } from '../utils/db';
import { socket } from '../socket';


const ChatLayout = () => {
    const [selectedChat, setSelectedChat] = useState({ id: 3, name: 'Edwin Johnson', lastMessage: 'Cool! Is there a coffee machine...', time: '9:01', status: 'online' });
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (!selectedChat?.id) return;
        const roomId = String(selectedChat.id);
        socket.emit("join_room", roomId);
        return () => {
            socket.emit("leave_room", roomId);
        };
    }, [selectedChat?.id]);

    useEffect(() => {
        if (selectedChat) {
            const loadLocalMessages = async () => {
                const localMsgs = await getMessagesByConversation(selectedChat.id);
                setMessages(localMsgs);
            };
            loadLocalMessages();
        } else {
            setMessages([]);
        }
    }, [selectedChat]);

    useEffect(() => {
        const handleReceiveMessage = (data) => {
            console.log("Received via socket:", data);
            if (selectedChat && data.conversationId === selectedChat.id) {
                setMessages(prev => {
                    if (prev.some(m => m.id === data.id)) return prev;
                    return [...prev, data];
                });
            }
        };

        socket.on("receive_message", handleReceiveMessage);

        return () => {
            socket.off("receive_message", handleReceiveMessage);
        };
    }, [selectedChat]);


    const handleMessageSent = (newMessage) => {
        setMessages(prev => [...prev, newMessage]);
    };

    const handleMessageStatusChange = (messageId, status) => {
        setMessages(prev =>
            prev.map(msg => (msg.id === messageId ? { ...msg, status } : msg))
        );
    };

    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            width: '100vw',
            background: 'var(--bg-primary)'
        }}>
            <Sidebar />
            <MessageListPanel onSelectChat={setSelectedChat} selectedChat={selectedChat} />
            <ChatArea 
                selectedChat={selectedChat} 
                messages={messages} 
                onMessageSent={handleMessageSent} 
                onMessageStatusChange={handleMessageStatusChange}
            />
        </div>
    );
};

export default ChatLayout;

