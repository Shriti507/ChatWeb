import React from 'react';
import { Home, Calendar, MessageSquare, Bell, BarChart2, CreditCard, Star, HelpCircle, LogOut } from 'lucide-react';

const Sidebar = () => {
    const navItems = [
        { id: 'dashboard', icon: Home, label: 'Dashboard' },
        { id: 'bookings', icon: Calendar, label: 'Bookings' },
        { id: 'messages', icon: MessageSquare, label: 'Messages', active: true, badge: 3 },
        { id: 'notifications', icon: Bell, label: 'Notifications', badge: 4 },
        { id: 'analytics', icon: BarChart2, label: 'Analytics' },
        { id: 'payments', icon: CreditCard, label: 'Payments' },
        { id: 'reviews', icon: Star, label: 'Reviews' },
        { id: 'help', icon: HelpCircle, label: 'Help' },
    ];

    return (
        <aside style={{
            width: 'var(--sidebar-width)',
            background: 'var(--sidebar-bg)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            padding: 'var(--spacing-lg)',
            zIndex: 20
        }}>
            <header style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '40px'
            }}>
                <div style={{ width: 24, height: 24, background: 'var(--accent-primary)', borderRadius: '4px', transform: 'rotate(45deg)', opacity: 0.9 }}></div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>StayWise</h2>
            </header>
            
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {navItems.map(item => {
                    const Icon = item.icon;
                    return (
                        <div 
                            key={item.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                background: item.active ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                                color: item.active ? 'white' : 'var(--text-secondary)',
                                transition: 'all 0.2s',
                                position: 'relative'
                            }}
                            onMouseEnter={(e) => {
                                if (!item.active) e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                                if (!item.active) e.currentTarget.style.color = 'var(--text-secondary)';
                            }}
                        >
                            <Icon size={20} style={{ color: item.active ? 'var(--accent-primary)' : 'inherit' }} />
                            <span style={{ fontWeight: 500, fontSize: '0.9375rem', flex: 1 }}>{item.label}</span>
                            {item.badge && (
                                <div style={{
                                    background: 'var(--accent-primary)',
                                    color: 'white',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {item.badge}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            <div style={{
                marginTop: 'auto',
                paddingTop: 'var(--spacing-lg)'
            }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
                    <p style={{ marginBottom: '4px' }}>©2024 StayWise. All rights</p>
                    <p>reserved.</p>
                    <p style={{ marginTop: '12px' }}>Terms of Use</p>
                </div>
                
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'white',
                    padding: '8px 12px',
                    borderRadius: '16px',
                    color: 'var(--text-primary)'
                }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: '#e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: '0.875rem'
                    }}>
                        JD
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Jane Doe</div>
                        <div style={{ 
                            fontSize: '0.65rem', 
                            background: '#1e293b', 
                            color: 'white', 
                            padding: '2px 8px', 
                            borderRadius: '8px',
                            display: 'inline-block',
                            marginTop: '2px'
                        }}>
                            Admin
                        </div>
                    </div>
                    <div style={{ 
                        padding: '6px', 
                        borderRadius: '8px', 
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}>
                        <LogOut size={16} style={{ color: 'var(--text-primary)' }} />
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
