import React, { useState } from 'react';
import { saveMessage } from '../utils/db';

const MessageInput = ({ selectedChat, onMessageSent }) => {
    const [message, setMessage] = useState('');

    const handleSend = async (e) => {
        e.preventDefault();
        if (message.trim() && selectedChat) {
            const newMessage = {
                conversationId: selectedChat.id,
                sender: 'Me',
                text: message.trim(),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                self: true,
                status: 'pending' // Initially pending for offline sync
            };

            // Save to local storage first (Local-First!)
            const id = await saveMessage(newMessage);
            
            // Notify layout to update UI immediately
            onMessageSent({ ...newMessage, id });
            
            setMessage('');

            // In a real app, this is where we would trigger the Socket.io/API call
            // and update status to 'synced' upon success.
        }
    };

    return (
        <footer style={{
            padding: 'var(--spacing-md) var(--spacing-lg)',
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-blur)',
            borderTop: 'var(--glass-border)',
            zIndex: 10
        }}>
            <form onSubmit={handleSend} style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                <input 
                    type="text" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    style={{
                        flex: 1,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: 'var(--glass-border)',
                        borderRadius: '12px',
                        padding: '12px 20px',
                        color: 'white',
                        outline: 'none',
                        fontSize: '0.9375rem',
                        transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                />
                <button 
                    type="submit"
                    style={{
                        background: 'var(--accent-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '0 24px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'transform 0.1s active',
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    Send
                </button>
            </form>
        </footer>
    );
};

export default MessageInput;
