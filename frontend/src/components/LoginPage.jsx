import * as React from 'react';

const LoginPage = ({ onLogin }) => {
    
    const avatars = [
        { id: 1, top: '10%', left: '15%', size: 90, img: 'https://i.pravatar.cc/150?u=1' },
        { id: 2, top: '20%', left: '45%', size: 60, img: 'https://i.pravatar.cc/150?u=2' },
        { id: 3, top: '10%', left: '75%', size: 40, img: 'https://i.pravatar.cc/150?u=3' },
        { id: 4, top: '40%', left: '45%', size: 100, img: 'https://i.pravatar.cc/150?u=4' },
        { id: 5, top: '55%', left: '15%', size: 50, img: 'https://i.pravatar.cc/150?u=5' },
        { id: 6, top: '65%', left: '60%', size: 45, img: 'https://i.pravatar.cc/150?u=6' },
        { id: 7, top: '45%', left: '80%', size: 65, img: 'https://i.pravatar.cc/150?u=7' },
        { id: 8, top: '80%', left: '45%', size: 70, img: 'https://i.pravatar.cc/150?u=8' },
    ];

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            background: 'linear-gradient(135deg, #ffffff 0%, #fce7f3 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '40px 24px',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: "'Outfit', sans-serif"
        }}>
            
            <div style={{
                position: 'absolute',
                top: '5%',
                width: '100%',
                height: '50%',
                maxWidth: '500px'
            }}>
               
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '300px',
                    height: '300px',
                    border: '1px dashed rgba(219, 39, 119, 0.2)',
                    borderRadius: '50%'
                }}></div>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '200px',
                    height: '200px',
                    border: '1px dashed rgba(219, 39, 119, 0.2)',
                    borderRadius: '50%'
                }}></div>

                {avatars.map(avatar => (
                    <div key={avatar.id} style={{
                        position: 'absolute',
                        top: avatar.top,
                        left: avatar.left,
                        width: avatar.size,
                        height: avatar.size,
                        borderRadius: '50%',
                        border: '3px solid white',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        overflow: 'hidden',
                        transition: 'transform 0.3s ease'
                    }}>
                        <img src={avatar.img} alt="user" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                ))}

              
                <div style={{
                    position: 'absolute',
                    top: '70%',
                    left: '25%',
                    width: '32px',
                    height: '32px',
                    background: '#db2777',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                </div>
            </div>

            
            <div style={{
                textAlign: 'center',
                zIndex: 10,
                width: '100%',
                maxWidth: '400px'
            }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    color: '#1e293b',
                    lineHeight: 1.1,
                    marginBottom: '40px'
                }}>
                    Let's meeting new people around you
                </h1>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                    <button 
                        onClick={onLogin}
                        style={{
                            height: '64px',
                            background: '#311b92',
                            color: 'white',
                            border: 'none',
                            borderRadius: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 12px',
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            letterSpacing: '0.5px'
                        }}
                    >
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'white',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '24px'
                        }}>
                             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#311b92" strokeWidth="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                        </div>
                        <span style={{ flex: 1, textAlign: 'left' }}>Login with Phone</span>
                    </button>

                    <button 
                        onClick={onLogin}
                        style={{
                            height: '64px',
                            background: '#fdf2f8',
                            color: '#1e293b',
                            border: 'none',
                            borderRadius: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 12px',
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            letterSpacing: '0.5px'
                        }}
                    >
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'white',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '24px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}>
                            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="google" style={{ width: '20px' }} />
                        </div>
                        <span style={{ flex: 1, textAlign: 'left' }}>Login with Google</span>
                    </button>
                </div>

                <p style={{ marginTop: '32px', color: '#64748b', fontSize: '0.9rem' }}>
                    Don't have an account? <span style={{ color: '#db2777', fontWeight: 600, cursor: 'pointer' }}>Sign Up</span>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
