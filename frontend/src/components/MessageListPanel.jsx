import React from 'react';
import { Search } from 'lucide-react';

const MessageListPanel = ({ onSelectChat, selectedChat }) => {
    const contacts = [
        { id: 1, name: 'Albert Flores', lastMessage: "Hi, I'm confirming your check-in...", time: '10:37', status: 'online', unread: 0, avatar: 'AF' },
        { id: 2, name: 'Annette Black', lastMessage: "I'm arriving tomorrow afternoon..", time: '9:15', status: 'offline', unread: 1, avatar: 'AB' },
        { id: 3, name: 'Edwin Johnson', lastMessage: 'Cool! Is there a coffee machine...', time: '9:01', status: 'online', unread: 0, avatar: 'EJ', selected: true },
        { id: 4, name: 'Jerome Bell', lastMessage: "I've received your booking reque...", time: 'Thu', status: 'offline', unread: 0, avatar: 'JB' },
        { id: 5, name: 'Darrell Steward', lastMessage: 'Hello! Just a reminder that chec...', time: 'Thu', status: 'online', unread: 0, avatar: 'DS' },
        { id: 6, name: 'Steven Jordan', lastMessage: 'Sounds good! Could you confir...', time: 'Wed', status: 'online', unread: 2, avatar: 'SJ' },
        { id: 7, name: 'Wanda Hall', lastMessage: 'Thanks for the update! Just to d...', time: 'Wed', status: 'offline', unread: 1, avatar: 'WH' },
        { id: 8, name: 'Victor Olson', lastMessage: 'Hi, just letting you know that the...', time: 'Wed', status: 'offline', unread: 0, avatar: 'VO' },
    ];

    return (
        <aside style={{
            width: 'var(--panel-width)',
            background: 'var(--panel-bg)',
            borderRight: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10
        }}>
            <div style={{ padding: 'var(--spacing-lg)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>Messages</h2>
                
                <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--spacing-md)' }}>
                    <div style={{
                        flex: 1, 
                        background: 'var(--accent-primary)', 
                        color: 'white', 
                        padding: '8px 16px', 
                        borderRadius: '24px', 
                        textAlign: 'center', 
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        cursor: 'pointer'
                    }}>
                        General <span style={{ opacity: 0.8, fontSize: '0.75rem', marginLeft: '4px' }}>6</span>
                    </div>
                    <div style={{
                        flex: 1, 
                        background: 'var(--bg-primary)',
                        color: 'var(--text-secondary)', 
                        padding: '8px 16px', 
                        borderRadius: '24px', 
                        textAlign: 'center', 
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer'
                    }}>
                        Archive <span style={{ opacity: 0.8, fontSize: '0.75rem', marginLeft: '4px' }}>2</span>
                    </div>
                </div>

                <div style={{ position: 'relative', marginBottom: 'var(--spacing-md)' }}>
                    <input 
                        type="text" 
                        placeholder="Search..."
                        style={{
                            width: '100%',
                            padding: '10px 16px 10px 40px',
                            borderRadius: '24px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-primary)',
                            fontSize: '0.875rem',
                            outline: 'none'
                        }}
                    />
                    <Search style={{ position: 'absolute', left: '14px', top: '10px', color: 'var(--text-secondary)' }} size={16} />
                </div>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 var(--spacing-sm)' }}>
                {contacts.map(contact => (
                    <div 
                        key={contact.id}
                        onClick={() => onSelectChat(contact)}
                        style={{
                            padding: '12px var(--spacing-sm)',
                            borderRadius: '12px',
                            marginBottom: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            background: selectedChat?.id === contact.id ? 'var(--bubble-received)' : 'transparent',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'center'
                        }}
                        onMouseEnter={(e) => {
                            if (selectedChat?.id !== contact.id) {
                                e.currentTarget.style.background = 'var(--bubble-received)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (selectedChat?.id !== contact.id) {
                                e.currentTarget.style.background = 'transparent';
                            }
                        }}
                    >
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: 'var(--border-color)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--text-secondary)',
                                fontWeight: 500
                            }}>
                                {contact.avatar}
                            </div>
                            {contact.status === 'online' && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '2px',
                                    right: '2px',
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    background: '#22c55e',
                                    border: '2px solid var(--panel-bg)'
                                }}></div>
                            )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{contact.name}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{contact.time}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <p style={{ 
                                    fontSize: '0.875rem', 
                                    color: 'var(--text-secondary)', 
                                    whiteSpace: 'nowrap', 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis',
                                    flex: 1,
                                    marginRight: '8px'
                                }}>
                                    {contact.lastMessage}
                                </p>
                                {contact.unread > 0 ? (
                                    <div style={{
                                        background: 'var(--accent-primary)',
                                        color: 'white',
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {contact.unread}
                                    </div>
                                ) : contact.name === 'Edwin Johnson' ? (
                                    <div style={{ color: 'var(--accent-primary)', fontSize: '1rem', lineHeight: 1 }}>
                                        ✓
                                    </div>
                                ) : (
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1 }}>
                                        ✓
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default MessageListPanel;
