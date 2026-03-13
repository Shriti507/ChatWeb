import React, { useState } from 'react';
import { Paperclip, Mic, Send } from 'lucide-react';
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
                status: 'pending' 
            };
            const id = await saveMessage(newMessage);
            onMessageSent({ ...newMessage, id });
            setMessage('');
        }
    };

    return (
        <footer style={{
            padding: '24px 32px',
            background: 'var(--panel-bg)',
            zIndex: 10
        }}>
            <form onSubmit={handleSend} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '30px',
                    padding: '8px 16px',
                    gap: '12px'
                }}>
                    <button type="button" style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px'
                    }}>
                        <Paperclip size={20} />
                    </button>
                    
                    <input 
                        type="text" 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Your message"
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            fontSize: '0.9375rem',
                        }}
                    />
                    
                    <button type="button" style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px'
                    }}>
                        <Mic size={20} />
                    </button>
                </div>

                <button 
                    type="submit"
                    style={{
                        background: 'var(--accent-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '48px',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.1s active',
                        flexShrink: 0
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <Send size={20} style={{ marginLeft: '2px' }} />
                </button>
            </form>
        </footer>
    );
};

export default MessageInput;
