import React from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Phone, MoreHorizontal } from 'lucide-react';

const ChatArea = ({ selectedChat, messages, onMessageSent }) => {
    if (!selectedChat) {
        return (
            <main style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--chat-bg)'
            }}>
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-sm)', color: 'var(--text-primary)' }}>Select a conversation</h3>
                    <p>Choose a contact to start messaging.</p>
                </div>
            </main>
        );
    }

    return (
        <main style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--chat-bg)',
            position: 'relative',
            height: '100%'
        }}>
            <header style={{
                padding: 'var(--spacing-lg) 32px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--panel-bg)',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ 
                            width: 50, 
                            height: 50, 
                            borderRadius: '50%', 
                            background: 'var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 600,
                            color: 'var(--text-secondary)'
                        }}>
                            EJ
                        </div>
                        {selectedChat.status === 'online' && (
                            <div style={{
                                position: 'absolute',
                                bottom: 2,
                                right: 2,
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                background: '#22c55e',
                                border: '2px solid var(--panel-bg)'
                            }}></div>
                        )}
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedChat.name}</h3>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }}></div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>1-Bedroom Apartment, 45 m²</span>
                            <span style={{ 
                                fontSize: '0.75rem', 
                                background: 'var(--bubble-received)', 
                                padding: '4px 8px', 
                                borderRadius: '12px',
                                color: 'var(--text-primary)',
                                fontWeight: 500
                            }}>$80/night</span>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{
                        width: 40,
                        height: 40,
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        background: 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--text-primary)'
                    }}>
                        <Phone size={20} />
                    </button>
                    <button style={{
                        width: 40,
                        height: 40,
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bubble-received)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--text-primary)'
                    }}>
                        <MoreHorizontal size={20} />
                    </button>
                </div>
            </header>

            <MessageList messages={messages} />
            <MessageInput selectedChat={selectedChat} onMessageSent={onMessageSent} />
        </main>
    );
};

export default ChatArea;
