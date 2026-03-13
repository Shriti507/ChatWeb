import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import MessageListPanel from './MessageListPanel';
import ChatArea from './ChatArea';
import { getMessagesByConversation } from '../utils/db';

const ChatLayout = () => {
    const [selectedChat, setSelectedChat] = useState({ id: 3, name: 'Edwin Johnson', lastMessage: 'Cool! Is there a coffee machine...', time: '9:01', status: 'online' });
    const [messages, setMessages] = useState([]);

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

    const handleMessageSent = (newMessage) => {
        setMessages(prev => [...prev, newMessage]);
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
            />
        </div>
    );
};

export default ChatLayout;

