import React from 'react';

const MessageList = ({ messages }) => {
    return (
        <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
        }}>
            {messages.map(msg => (
                <div 
                    key={msg.id}
                    style={{
                        alignSelf: msg.self ? 'flex-end' : 'flex-start',
                        maxWidth: '65%',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-end'
                    }}
                >
                    {!msg.self && (
                        <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: 'var(--border-color)',
                            marginBottom: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: 'var(--text-secondary)'
                        }}>
                            EJ
                        </div>
                    )}
                    <div style={{
                        padding: '12px 16px 20px 16px',
                        borderRadius: msg.self ? '16px 16px 0 16px' : '16px 16px 16px 0',
                        background: msg.self ? 'var(--bubble-sent)' : 'var(--bubble-received)',
                        color: msg.self ? 'white' : 'var(--text-primary)',
                        fontSize: '0.9375rem',
                        position: 'relative',
                        lineHeight: 1.5,
                        boxShadow: 'none'
                    }}>
                        {msg.text}
                        <div style={{
                            position: 'absolute',
                            bottom: '4px',
                            right: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.65rem',
                            color: msg.self ? 'rgba(255, 255, 255, 0.8)' : 'var(--text-secondary)'
                        }}>
                            <span>{msg.time}</span>
                            {msg.self && <span>✓✓</span>}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MessageList;
