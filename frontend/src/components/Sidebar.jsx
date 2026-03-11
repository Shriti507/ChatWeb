import React from 'react';

const Sidebar = ({ onSelectChat, selectedChat }) => {
    
    const contacts = [
        { id: 1, name: 'John Doe', lastMessage: 'Hey, how are you?', time: '12:45 PM', status: 'online' },
        { id: 2, name: 'Project Group', lastMessage: 'Offline-first strategy is key.', time: '11:20 AM', status: 'away' },
        { id: 3, name: 'Tech Support', lastMessage: 'Your ticket is being processed.', time: 'Yesterday', status: 'offline' },
    ];

    return (
        <aside style={{
            width: 'var(--sidebar-width)',
            background: 'var(--bg-secondary)',
            borderRight: 'var(--glass-border)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <header style={{
                padding: 'var(--spacing-lg)',
                borderBottom: 'var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>ChatWeb</h2>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-primary)', opacity: 0.8 }}></div>
            </header>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-md)' }}>
                {contacts.map(contact => (
                    <div 
                        key={contact.id}
                        onClick={() => onSelectChat(contact)}
                        style={{
                            padding: 'var(--spacing-md)',
                            borderRadius: '12px',
                            marginBottom: 'var(--spacing-sm)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            background: selectedChat?.id === contact.id ? 'var(--accent-primary)' : 'transparent',
                            color: selectedChat?.id === contact.id ? 'white' : 'inherit',
                            opacity: selectedChat?.id === contact.id ? 1 : 0.8,
                        }}
                        onMouseEnter={(e) => {
                            if (selectedChat?.id !== contact.id) {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                e.currentTarget.style.opacity = 1;
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (selectedChat?.id !== contact.id) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.opacity = 0.8;
                            }
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontWeight: 500 }}>{contact.name}</span>
                            <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{contact.time}</span>
                        </div>
                        <p style={{ fontSize: '0.875rem', opacity: 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {contact.lastMessage}
                        </p>
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default Sidebar;
