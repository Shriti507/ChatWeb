import React, { useState } from 'react';
import { Paperclip, Mic, Send } from 'lucide-react';
import { saveMessage } from '../utils/db';
import { socket } from '../socket';


const MessageInput = ({ selectedChat, onMessageSent, onMessageStatusChange }) => {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        if (message.trim() && selectedChat) {
            setIsSending(true);
            const newMessage = {
                conversationId: selectedChat.id,
                sender: 'Me',
                text: message.trim(),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                self: true,
                status: 'pending' 
            };
            const id = await saveMessage(newMessage);
            const messageWithId = { ...newMessage, id };
            
            onMessageSent(messageWithId);
            socket.emit("send_message", messageWithId, (ack) => {
                if (ack?.ok) {
                    onMessageStatusChange?.(id, 'sent');
                } else {
                    onMessageStatusChange?.(id, 'failed');
                }
                setIsSending(false);
            });

            // Defensive timeout when no ack returns (disconnect/race).
            setTimeout(() => {
                setIsSending(false);
            }, 4000);
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
                        placeholder={isSending ? "Sending..." : "Your message"}
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
                    disabled={isSending || !message.trim() || !selectedChat}
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
                        flexShrink: 0,
                        opacity: isSending || !message.trim() || !selectedChat ? 0.65 : 1
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
