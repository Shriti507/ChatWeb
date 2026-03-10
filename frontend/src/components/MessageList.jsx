import React from 'react';

const MessageList = ({ messages }) => {
    return (
        <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--spacing-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-md)'
        }}>
            {messages.map(msg => (
                <div 
                    key={msg.id}
                    style={{
                        alignSelf: msg.self ? 'flex-end' : 'flex-start',
                        maxWidth: '70%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: msg.self ? 'flex-end' : 'flex-start'
                    }}
                >
                    <div style={{
                        padding: '12px 16px',
                        borderRadius: msg.self ? '16px 16px 0 16px' : '16px 16px 16px 0',
                        background: msg.self ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                        color: msg.self ? 'white' : 'var(--text-primary)',
                        fontSize: '0.9375rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        border: msg.self ? 'none' : 'var(--glass-border)',
                        position: 'relative'
                    }}>
                        {msg.text}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>
                            {msg.time}
                        </span>
                        {msg.self && (
                             <span style={{ fontSize: '0.75rem', opacity: 0.8, color: msg.status === 'synced' ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                                {msg.status === 'synced' ? '✓' : '🕒'}
                             </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MessageList;
