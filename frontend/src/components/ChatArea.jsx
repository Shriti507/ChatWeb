import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatArea = ({ selectedChat, messages, onMessageSent }) => {
    if (!selectedChat) {
        return (
            <main style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
                opacity: 0.6
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-sm)' }}>Select a conversation</h3>
                    <p>Continue chatting even if the internet goes down.</p>
                </div>
            </main>
        );
    }

    return (
        <main style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-primary)',
            position: 'relative'
        }}>
            <header style={{
                padding: 'var(--spacing-lg)',
                borderBottom: 'var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-md)',
                background: 'var(--glass-bg)',
                backdropFilter: 'var(--glass-blur)',
                zIndex: 10
            }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-secondary)' }}></div>
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{selectedChat.name}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>{selectedChat.status}</span>
                </div>
            </header>

            <MessageList messages={messages} />
            <MessageInput selectedChat={selectedChat} onMessageSent={onMessageSent} />
        </main>
    );
};

export default ChatArea;
